/// <reference types="cypress" />
import Podcast_Objects from '../../support/page_objects/podcast_objects'
import { RUN_TAG, cleanUp, createPlaylist } from '../../support/podcast_lifecycle'

/**
 * Browser coverage for Content → Podcasts (VAI-1680).
 *
 * Deliberately stops short of anything that needs the audiofiles queue worker or
 * ffmpeg, so this spec is deterministic and safe for the daily run. Episode
 * processing is covered by cypress/e2e/podcast_processing/, which is opt-in.
 *
 * Cases map to the ids in voto5/QA-VAI-1680-podcasts.md, and are limited to what
 * nothing else covers — the ~110 PHPUnit tests on CN already cover CRUD, org
 * isolation and validation at the API level.
 *
 * Preconditions (the spec fails fast and says so if they are missing):
 *   - ENABLE_PLAYLISTS + ENABLE_PODCASTS on the org
 *   - the QA user holds view-content + edit-content
 *   - podcastFeedBaseUrl in cypress.env.json points at a host the CN can reach
 *     server-side (see scripts/publish-podcast-feeds.sh)
 */
describe('podcasts', () => {
  const podcast = new Podcast_Objects()
  let data
  const created = { podcastIds: [], playlistIds: [] }

  const uncaught = () => false

  before(() => {
    cy.fixture('podcast_regression_details').then((fixture) => {
      data = fixture
    })
  })

  beforeEach(() => {
    cy.on('uncaught:exception', uncaught)
    cy.loginToVoto()
    podcast.assertPodcastsEnabled()
  })

  afterEach(() => {
    cy.off('uncaught:exception', uncaught)
  })

  after(() => {
    // after() inherits the last test's session, so loginToVoto would land on
    // /home with no login form and fail the hook even on a fully green run.
    cy.clearCookies()
    cy.loginToVoto()
    cleanUp(created)
  })

  /** Register ids as we go so cleanup runs even when a later assertion fails. */
  const trackPodcastFromUrl = () => cy.location('pathname').then((pathname) => {
    const match = pathname.match(/\/podcast\/edit\/(\d+)/)
    if (match) {
      created.podcastIds.push(Number(match[1]))
      return Number(match[1])
    }
    return null
  })

  const freshPlaylist = (suffix) => createPlaylist(`${RUN_TAG} ${suffix}`).then((playlist) => {
    created.playlistIds.push(playlist.id)
    return playlist
  })

  // --- index [B01–B03, I01] ------------------------------------------------

  it('shows the index with the documented columns and no raw translation keys', () => {
    podcast.visitPodcastsPage()

    // Either the table or the empty state, depending on what the org already has.
    cy.get('[data-cy="podcasts--table"], [data-cy="podcasts--empty-state"]').should('exist')
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="podcasts--table"]').length) {
        const headers = ['Title', 'Linked playlist', 'Status', 'Episodes', 'Tags']
        headers.forEach((header) => cy.get('[data-cy="podcasts--table"]').should('contain.text', header))
      }
    })

    podcast.assertNoRawTranslationKeys()
  })

  // --- create flow [C02, C07, C08–C12, C14, C20–C24] ----------------------

  it('keeps save disabled until a feed is connected [C02]', () => {
    podcast.visitPodcastsPage().startCreate()
    podcast.assertSaveDisabled()
    podcast.assertNoRawTranslationKeys()
  })

  it('lists the first 20 episodes and appends the rest on load more [C07]', () => {
    podcast.visitPodcastsPage().startCreate()
    podcast.connectFeed(podcast.feedUrl(data.feeds.many))
    podcast.assertFeedConnected(data.episodesPerPage)

    // Each episode row must carry enough for a producer to choose between them.
    cy.get('[data-cy="podcast-episode--row"]').first().within(() => {
      cy.contains('Episode').should('be.visible')
      cy.contains('smallholder farmers').should('be.visible')
    })

    podcast.loadMore()
    cy.get('[data-cy="podcast-episode--row"]').should('have.length', 25)
  })

  it('caps the selection at five and keeps deselection available [C08, C09, C10]', () => {
    podcast.visitPodcastsPage().startCreate()
    podcast.connectFeed(podcast.feedUrl(data.feeds.many))
    podcast.assertFeedConnected(data.episodesPerPage)

    podcast.selectEpisodes(data.maxSelectableEpisodes)
    podcast.episodeCheckboxes().filter(':checked').should('have.length', data.maxSelectableEpisodes)

    // At the cap the remaining boxes are disabled rather than silently ignoring
    // clicks, and the selected ones stay clickable so a swap is always possible.
    podcast.episodeCheckboxes().filter(':not(:checked)').first().should('be.disabled')
    podcast.episodeCheckboxes().filter(':checked').first().should('not.be.disabled')

    podcast.episodeCheckboxes().filter(':checked').first().click({ force: true })
    podcast.episodeCheckboxes().filter(':checked').should('have.length', data.maxSelectableEpisodes - 1)
    podcast.episodeCheckboxes().filter(':not(:checked)').first().should('not.be.disabled')
  })

  it('select-latest fills the cap and clear empties it [C11, C12]', () => {
    podcast.visitPodcastsPage().startCreate()
    podcast.connectFeed(podcast.feedUrl(data.feeds.many))
    podcast.assertFeedConnected(data.episodesPerPage)

    podcast.selectLatest()
    podcast.episodeCheckboxes().filter(':checked').should('have.length', data.maxSelectableEpisodes)

    podcast.clearSelection()
    podcast.episodeCheckboxes().filter(':checked').should('have.length', 0)
  })

  it('resets the episode browser when the feed URL is edited [C14]', () => {
    podcast.visitPodcastsPage().startCreate()
    podcast.connectFeed(podcast.feedUrl(data.feeds.few))
    podcast.assertFeedConnected(3)
    podcast.selectEpisodes(1)

    // A stale episode list against a new URL is the dangerous state: it would
    // import episodes that do not belong to the feed being saved.
    podcast.enterFeedUrl(podcast.feedUrl(data.feeds.many))
    cy.get('[data-cy="podcast-episode--row"]').should('not.exist')
    podcast.assertSaveDisabled()
  })

  it('reports an empty feed distinctly [C22]', () => {
    podcast.visitPodcastsPage().startCreate()
    podcast.connectFeed(podcast.feedUrl(data.feeds.empty))
    podcast.assertFeedError(data.errors.empty)
  })

  it('reports a malformed feed distinctly [C21]', () => {
    podcast.visitPodcastsPage().startCreate()
    podcast.connectFeed(podcast.feedUrl(data.feeds.malformed))
    podcast.assertFeedError(data.errors.malformed)
  })

  it('reports an unreachable feed distinctly [C20]', () => {
    podcast.visitPodcastsPage().startCreate()
    podcast.connectFeed(data.unreachableFeed)
    podcast.assertFeedError(data.errors.unreachable)
  })

  it('parses an Atom feed [C24]', () => {
    podcast.visitPodcastsPage().startCreate()
    podcast.connectFeed(podcast.feedUrl(data.feeds.atom))
    podcast.assertFeedConnected(2)
  })

  // --- happy path + edit [C01, D01, D02, D03] -----------------------------

  it('creates a podcast, lands on its edit page and lists it on the index [C01, D01, D03]', () => {
    freshPlaylist('create').then((playlist) => {
      podcast.visitPodcastsPage().startCreate()
      podcast.selectPlaylist(playlist.name)
      podcast.selectLanguage(data.language)
      podcast.setDurations(data.minDuration, data.maxDuration)
      podcast.connectFeed(podcast.feedUrl(data.feeds.few))
      podcast.assertFeedConnected(3)
      podcast.selectEpisodes(2)
      podcast.save()

      cy.location('pathname', { timeout: 30000 }).should('match', /\/podcast\/edit\/\d+/)
      trackPodcastFromUrl().then((podcastId) => {
        // Creation fields are fixed after save — changing the feed or language of
        // a podcast that already produced content would silently orphan it.
        cy.get('[data-cy="podcast-rss-url--input"] input').should('be.disabled')
        cy.get('[data-cy="podcast-language--selector"]').should('have.class', 'multiselect--disabled')
        // Episodes arrive by sync only; no browser in edit mode.
        cy.get('[data-cy="podcast-episode-list"]').should('not.exist')
        podcast.assertNoRawTranslationKeys()

        podcast.visitPodcastsPage()
        podcast.row(podcastId).should('be.visible')
        podcast.assertEpisodeCount(podcastId, 2)
        podcast.assertStatus(podcastId, 'active')
      })
    })
  })

  it('rejects a second podcast on the same feed URL [C18]', () => {
    const feed = podcast.feedUrl(data.feeds.few)

    freshPlaylist('dup-a').then((first) => {
      podcast.visitPodcastsPage().startCreate()
      podcast.selectPlaylist(first.name)
      podcast.selectLanguage(data.language)
      podcast.setDurations(data.minDuration, data.maxDuration)
      podcast.connectFeed(feed)
      podcast.assertFeedConnected(3)
      podcast.save()
      cy.location('pathname', { timeout: 30000 }).should('match', /\/podcast\/edit\/\d+/)
      trackPodcastFromUrl()

      freshPlaylist('dup-b').then((second) => {
        podcast.visitPodcastsPage().startCreate()
        podcast.selectPlaylist(second.name)
        podcast.selectLanguage(data.language)
        podcast.setDurations(data.minDuration, data.maxDuration)
        podcast.connectFeed(feed)
        podcast.assertFeedConnected(3)
        podcast.save()
        cy.contains(data.errors.duplicate, { timeout: 20000 }).should('be.visible')
      })
    })
  })

  // --- row actions [B16, B17, B18, B19, F14] ------------------------------

  it('swaps pause for resume, and keeps pause on an errored podcast [B16, B17]', () => {
    freshPlaylist('pause').then((playlist) => {
      createPodcastViaApi(playlist.id, podcast.feedUrl(data.feeds.few)).then((podcastId) => {
        podcast.visitPodcastsPage()
        podcast.assertStatus(podcastId, 'active')

        podcast.rowAction(podcastId, 'pause')
        podcast.assertStatus(podcastId, 'paused')
        cy.get(`[data-cy="podcast-row--resume"][data-cy-podcast-id="${podcastId}"]`).should('exist')
        cy.get(`[data-cy="podcast-row--pause"][data-cy-podcast-id="${podcastId}"]`).should('not.exist')

        podcast.rowAction(podcastId, 'resume')
        podcast.assertStatus(podcastId, 'active')
        cy.get(`[data-cy="podcast-row--pause"][data-cy-podcast-id="${podcastId}"]`).should('exist')
      })
    })
  })

  it('deletes a podcast on confirmation and leaves the linked playlist intact [B18, B19]', () => {
    freshPlaylist('delete').then((playlist) => {
      createPodcastViaApi(playlist.id, podcast.feedUrl(data.feeds.few)).then((podcastId) => {
        podcast.visitPodcastsPage()

        // Cancel must abort.
        podcast.rowAction(podcastId, 'delete')
        podcast.cancelDelete()
        podcast.row(podcastId).should('exist')

        podcast.rowAction(podcastId, 'delete')
        podcast.confirmDelete()
        cy.get(`[data-cy="podcast-row--title"][data-cy-podcast-id="${podcastId}"]`, { timeout: 20000 })
          .should('not.exist')

        // The playlist and its messages outlive the podcast by design.
        cy.request({ url: `/resource/playlists/${playlist.id}`, failOnStatusCode: false })
          .its('status')
          .should('eq', 200)
      })
    })
  })

  // --- search and filters [B10, B11, B12] ---------------------------------

  it('filters by search term and by status [B10, B11, B12]', () => {
    freshPlaylist('search').then((playlist) => {
      createPodcastViaApi(playlist.id, podcast.feedUrl(data.feeds.few)).then((podcastId) => {
        podcast.visitPodcastsPage()

        podcast.search(RUN_TAG)
        podcast.row(podcastId).should('be.visible')

        podcast.search('zzz-no-such-podcast-zzz')
        cy.get('[data-cy="podcasts--table"]').should('contain.text', 'No records found')

        podcast.search(RUN_TAG)
        podcast.filterByStatus('paused')
        cy.get(`[data-cy="podcast-row--title"][data-cy-podcast-id="${podcastId}"]`).should('not.exist')
        podcast.filterByStatus('active')
        podcast.row(podcastId).should('be.visible')
      })
    })
  })

  // --- API-level guards nothing else covers [J01, J02, F14, retest §3] ----

  it('refuses a partial duration update that would persist min > max [J01, J02]', () => {
    freshPlaylist('durations').then((playlist) => {
      createPodcastViaApi(playlist.id, podcast.feedUrl(data.feeds.few)).then((podcastId) => {
        // Both directions, each sending only one side of the window. The fix for
        // this landed in e27dc243ac but was never verified on a deployed build.
        cy.request({
          method: 'PUT',
          url: `/resource/podcasts/${podcastId}`,
          body: { min_duration_minutes: 60 },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status, 'raising min above the stored max must be rejected, not 500').to.eq(422)
        })

        cy.request({
          method: 'PUT',
          url: `/resource/podcasts/${podcastId}`,
          body: { max_duration_minutes: 1 },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status, 'lowering max below the stored min must be rejected, not 500').to.be.oneOf([200, 422])
        })

        cy.request({ url: `/resource/podcasts/${podcastId}` }).then((response) => {
          const row = response.body.data
          expect(
            Number(row.min_duration_minutes),
            'an impossible duration window reached the database',
          ).to.be.at.most(Number(row.max_duration_minutes))
        })
      })
    })
  })

  it('keeps the playlist picker usable when the org has an orphaned podcast [retest §3, F14]', () => {
    freshPlaylist('orphan-target').then((doomed) => {
      createPodcastViaApi(doomed.id, podcast.feedUrl(data.feeds.few)).then((podcastId) => {
        created.podcastIds.push(podcastId)

        // Deleting the linked playlist orphans the podcast (playlist_id → null).
        cy.request({ method: 'DELETE', url: `/resource/playlists/${doomed.id}`, failOnStatusCode: false })

        freshPlaylist('orphan-bystander').then((free) => {
          // With a NULL in the exclusion list, `id NOT IN (NULL, …)` matched no
          // rows and emptied the picker, blocking all podcast creation.
          cy.request({
            url: '/resource/playlists?should_show_all=true&exclude_linked_podcasts=true',
          }).then((response) => {
            const ids = (response.body.data || []).map((row) => Number(row.id))
            expect(ids, 'the playlist picker went empty because of an orphaned podcast').to.include(free.id)
          })

          // Sync-now and resume must refuse an orphan with a clear 422, not crash.
          cy.request({
            method: 'POST',
            url: `/resource/podcasts/${podcastId}/sync-now`,
            failOnStatusCode: false,
          }).its('status').should('eq', 422)
        })
      })
    })
  })

  /**
   * Creating through the API rather than the form: these cases are about the
   * index and the endpoints, and driving the whole create form for each of them
   * would triple the runtime without testing anything new.
   */
  function createPodcastViaApi(playlistId, feedUrl) {
    return cy.request({ url: '/resource/languages' }).then((languages) => {
      const language = (languages.body.data || languages.body || [])
        .find((row) => String(row.name).toLowerCase() === String(data.language).toLowerCase())
      expect(language, `the org has no "${data.language}" language configured`).to.not.be.undefined

      return cy.request({
        method: 'POST',
        url: '/resource/podcasts',
        body: {
          rss_url: feedUrl,
          title: `${RUN_TAG} api`,
          playlist_id: playlistId,
          language_id: language.id,
          min_duration_minutes: data.minDuration,
          max_duration_minutes: data.maxDuration,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status, `podcast create failed: ${JSON.stringify(response.body)}`).to.be.oneOf([200, 201])
        const id = Number(response.body.data.id)
        created.podcastIds.push(id)
        return cy.wrap(id, { log: false })
      })
    })
  }
})
