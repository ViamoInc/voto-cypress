/// <reference types="cypress" />
import Podcast_Objects from '../../support/page_objects/podcast_objects'
import { RUN_TAG, cleanUp, createPlaylist } from '../../support/podcast_lifecycle'

/**
 * The half of the podcast flow that needs infrastructure: an `audiofiles` queue
 * worker consuming, and ffmpeg/ffprobe on the CN box.
 *
 * Kept out of the default regression glob on purpose. It is the only automated
 * proof that an imported episode becomes playable content, but it depends on
 * services this suite does not control, so a red run here means "check the
 * worker" at least as often as it means "the code broke". Run it deliberately:
 *
 *   npm run cy:podcast-processing
 *
 * Timeouts are generous rather than tight: a real episode goes through download
 * → normalise → silence-detect → N × extract → N × S3 ingest.
 */
const PROCESSING_TIMEOUT_MS = 5 * 60 * 1000
const POLL_INTERVAL_MS = 5000

/**
 * Gated at runtime rather than by excludeSpecPattern: --spec does not override an
 * exclude pattern, so a config-level exclusion would make this spec unrunnable
 * instead of opt-in. This way `just run-all` collects it and skips it, while
 * `npm run cy:podcast-processing` (which sets the flag) runs it.
 */
const ENABLED = String(Cypress.env('podcastProcessing')) === 'true'

/* eslint-disable-next-line mocha/no-exclusive-tests, no-undef -- deliberate opt-in gate */
const suite = ENABLED ? describe : describe.skip

suite('podcast episode processing', () => {
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
    cy.loginToVoto()
    cleanUp(created)
  })

  /**
   * Polls the episodes endpoint until nothing is pending. Reports what it saw on
   * timeout, because "still pending after five minutes" and "failed with an
   * error" call for completely different responses.
   */
  const waitForEpisodes = (podcastId, deadline = Date.now() + PROCESSING_TIMEOUT_MS) => cy
    .request({ url: `/resource/podcasts/${podcastId}/episodes`, failOnStatusCode: false })
    .then((response) => {
      const episodes = response.body?.data ?? []
      const pending = episodes.filter((episode) => ['pending', 'processing'].includes(episode.status))

      if (pending.length === 0) {
        return cy.wrap(episodes, { log: false })
      }

      if (Date.now() > deadline) {
        const summary = episodes.map((e) => `${e.id}:${e.status}`).join(', ')
        throw new Error(
          `Episodes were still unprocessed after ${PROCESSING_TIMEOUT_MS / 1000}s (${summary}). `
          + 'The audiofiles queue worker is the usual cause — check it is consuming on the CN, '
          + 'and that ffmpeg/ffprobe are installed.',
        )
      }

      cy.wait(POLL_INTERVAL_MS)
      return waitForEpisodes(podcastId, deadline)
    })

  const playlistMessageCount = (playlistId) => cy
    .request({ url: `/resource/playlists/${playlistId}` })
    .then((response) => (response.body?.data?.messages ?? []).length)

  const createPodcast = (playlistId, feedFixture, episodeCount) => cy
    .request({ url: '/resource/languages' })
    .then((languages) => {
      const language = (languages.body.data || languages.body || [])
        .find((row) => String(row.name).toLowerCase() === String(data.language).toLowerCase())
      expect(language, `the org has no "${data.language}" language configured`).to.not.be.undefined

      podcast.visitPodcastsPage().startCreate()
      cy.get('[data-cy="podcast-playlist--selector"]').click()
      cy.contains('.multiselect__option', RUN_TAG).click()
      podcast.selectLanguage(data.language)
      podcast.setDurations(data.minDuration, data.maxDuration)
      podcast.connectFeed(podcast.feedUrl(feedFixture))
      podcast.assertFeedConnected()
      podcast.selectEpisodes(episodeCount)
      podcast.save()

      return cy.location('pathname', { timeout: 30000 })
        .should('match', /\/podcast\/edit\/\d+/)
        .then((pathname) => {
          const id = Number(String(pathname).match(/(\d+)$/)[1])
          created.podcastIds.push(id)
          return id
        })
    })

  it('turns imported episodes into messages appended to the linked playlist [E01]', () => {
    createPlaylist(`${RUN_TAG} processing`).then((playlist) => {
      created.playlistIds.push(playlist.id)

      playlistMessageCount(playlist.id).then((before) => {
        createPodcast(playlist.id, data.feeds.few, 2).then((podcastId) => {
          waitForEpisodes(podcastId).then((episodes) => {
            expect(episodes, 'no episodes were imported').to.have.length(2)
            episodes.forEach((episode) => {
              expect(
                episode.status,
                `episode ${episode.id} ended as ${episode.status}: ${episode.last_error || 'no error recorded'}`,
              ).to.eq('processed')
            })

            // Appended, not inserted: existing playlist order must be untouched.
            playlistMessageCount(playlist.id).should('be.greaterThan', before)
          })
        })
      })
    })
  })

  it('cuts a long episode into several segments inside the configured window [E02]', () => {
    createPlaylist(`${RUN_TAG} segments`).then((playlist) => {
      created.playlistIds.push(playlist.id)

      createPodcast(playlist.id, data.feeds.longEpisode, 1).then((podcastId) => {
        waitForEpisodes(podcastId).then((episodes) => {
          expect(episodes[0].status).to.eq('processed')
          // The fixture is 210s against a 2-minute maximum, so it must not have
          // been ingested whole.
          expect(
            (episodes[0].messages || []).length,
            'a 210s episode against a 120s maximum produced a single message',
          ).to.be.greaterThan(1)
        })
      })
    })
  })

  it('flags an unsupported enclosure without harming its siblings [E07]', () => {
    createPlaylist(`${RUN_TAG} unsupported`).then((playlist) => {
      created.playlistIds.push(playlist.id)

      createPodcast(playlist.id, data.feeds.videoEnclosure, 2).then((podcastId) => {
        waitForEpisodes(podcastId).then((episodes) => {
          const failed = episodes.filter((episode) => episode.status === 'failed')
          const processed = episodes.filter((episode) => episode.status === 'processed')

          expect(failed, 'the video-enclosure episode should have failed').to.have.length(1)
          expect(failed[0].last_error, 'a failed episode must say why').to.be.a('string').and.not.be.empty
          expect(processed, 'a sibling episode should still have processed').to.have.length(1)

          // The failure must be visible on the page, with a retry available.
          podcast.openEdit(podcastId)
          podcast.episodeStatus(failed[0].id).should('have.attr', 'data-cy-episode-status', 'failed')
          cy.get(`[data-cy="podcast-episode--retry-btn"][data-cy-episode-id="${failed[0].id}"]`).should('exist')
        })
      })
    })
  })

  it('re-queues a failed episode when retry is pressed [VAI-1847]', () => {
    createPlaylist(`${RUN_TAG} retry`).then((playlist) => {
      created.playlistIds.push(playlist.id)

      createPodcast(playlist.id, data.feeds.videoEnclosure, 1).then((podcastId) => {
        waitForEpisodes(podcastId).then((episodes) => {
          const failed = episodes.find((episode) => episode.status === 'failed')
          expect(failed, 'expected the video-enclosure episode to fail').to.not.be.undefined

          podcast.openEdit(podcastId)
          podcast.retryEpisode(failed.id)

          // It will fail again — the enclosure is still not audio. What matters
          // is that the retry was accepted and the row left `failed`.
          podcast.episodeStatus(failed.id, { timeout: 20000 })
            .should('not.have.attr', 'data-cy-episode-status', 'failed')
        })
      })
    })
  })
})
