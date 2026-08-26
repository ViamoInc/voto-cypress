/// <reference types="cypress" />

/**
 * Fixture lifecycle for the podcast specs.
 *
 * A podcast permanently consumes an unlinked playlist (one playlist ↔ at most
 * one podcast), and deleting the podcast leaves its generated Messages on the
 * playlist. So a spec that reuses the org's playlists exhausts them within a few
 * runs and grows the survivors without bound. Every run therefore creates its
 * own playlist over the API and removes both afterwards, including on failure.
 *
 * Names are timestamped so anything a killed run leaks is identifiable and can
 * be swept by hand.
 */
export const RUN_TAG = `[cy-podcast] ${Date.now()}`

export function createPlaylist(name) {
  return cy
    .request({ method: 'POST', url: '/resource/playlists', body: { name }, failOnStatusCode: false })
    .then((response) => {
      expect(response.status, `could not create the test playlist "${name}"`).to.be.oneOf([200, 201])
      const id = response.body?.data?.id ?? response.body?.id
      expect(id, 'playlist create returned no id').to.not.be.undefined
      return cy.wrap({ id: Number(id), name }, { log: false })
    })
}

export function deletePlaylist(playlistId) {
  if (!playlistId) {
    return cy.wrap(null, { log: false })
  }
  return cy.request({ method: 'DELETE', url: `/resource/playlists/${playlistId}`, failOnStatusCode: false })
}

export function deletePodcast(podcastId) {
  if (!podcastId) {
    return cy.wrap(null, { log: false })
  }
  return cy.request({ method: 'DELETE', url: `/resource/podcasts/${podcastId}`, failOnStatusCode: false })
}

/** Every podcast this org owns whose title carries our run tag. */
export function ownPodcasts(tag = RUN_TAG) {
  return cy.request({ url: '/resource/podcasts?limit=100', failOnStatusCode: false }).then((response) => {
    const rows = response.body?.data ?? []
    return rows.filter((row) => String(row.title || '').includes(tag))
  })
}

/**
 * Remove anything this run created. Deletes podcasts before playlists: deleting
 * a linked playlist first would orphan the podcast rather than remove it.
 */
export function cleanUp({ podcastIds = [], playlistIds = [] }) {
  podcastIds.filter(Boolean).forEach((id) => deletePodcast(id))
  playlistIds.filter(Boolean).forEach((id) => deletePlaylist(id))
}
