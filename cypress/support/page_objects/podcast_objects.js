/// <reference types="cypress" />
import { ContentNavigation } from '../navigations'

/**
 * Page object for Content → Podcasts (VAI-1680).
 *
 * Selects only on the data-cy hooks added to SetsView.vue / CreateEditView.vue /
 * EpisodePreviewModal.vue, never on visible copy: podcast labels come from an
 * external localization source, so text selectors would break on a translation
 * change and would also defeat the raw-translation-key assertion below.
 *
 * Two placement facts the hooks depend on, both pinned by
 * podcastTestHooks.spec.js in voto5:
 *   - ViaCheckbox binds $attrs on its wrapper div *and* its inner input, so
 *     episode checkboxes are addressed as input[data-cy="podcast-episode--checkbox"].
 *   - Row-level hooks carry data-cy-podcast-id, so a row can be addressed by id
 *     rather than by position in the table.
 */
export default class Podcast_Objects {

  // --- navigation ----------------------------------------------------------

  visitPodcastsPage() {
    cy.navigateTo(ContentNavigation.PODCAST)
    cy.location('pathname', { timeout: 20000 }).should('eq', '/podcasts')
    return this
  }

  /**
   * The nav item only renders with ENABLE_PODCASTS, and every /resource/podcasts
   * route 302s to /home without it. Checked once per spec so a disabled org
   * produces one clear message instead of twenty selector timeouts.
   */
  assertPodcastsEnabled() {
    cy.request({ url: '/resource/podcasts', failOnStatusCode: false, followRedirect: false })
      .then((response) => {
        expect(
          response.status,
          'ENABLE_PODCASTS looks disabled for this org: /resource/podcasts redirected instead of '
          + 'returning JSON. Enable ENABLE_PLAYLISTS + ENABLE_PODCASTS in voto5admin for the '
          + `org "${Cypress.env('OrgName')}" before running the podcast specs.`,
        ).to.eq(200)
      })
    return this
  }

  startCreate() {
    cy.get('[data-cy="podcasts--create-btn"], [data-cy="podcasts--empty-state-create-btn"]')
      .first()
      .click({ force: true })
    cy.location('pathname', { timeout: 20000 }).should('eq', '/podcast/create')
    return this
  }

  openEdit(podcastId) {
    cy.get(`[data-cy="podcast-row--edit"][data-cy-podcast-id="${podcastId}"]`).click({ force: true })
    cy.location('pathname', { timeout: 20000 }).should('eq', `/podcast/edit/${podcastId}`)
    return this
  }

  // --- create / edit form --------------------------------------------------

  selectPlaylist(name) {
    cy.get('[data-cy="podcast-playlist--selector"]').click()
    cy.contains('.multiselect__option', name).click()
    return this
  }

  selectLanguage(name) {
    cy.get('[data-cy="podcast-language--selector"]').click()
    cy.contains('.multiselect__option', name).click()
    return this
  }

  setDurations(minMinutes, maxMinutes) {
    cy.get('[data-cy="podcast-min-duration--input"] input').clear().type(String(minMinutes))
    cy.get('[data-cy="podcast-max-duration--input"] input').clear().type(String(maxMinutes))
    return this
  }

  /** Feeds are cached for 300s per URL, so every reference gets a cache-buster. */
  feedUrl(fixtureName) {
    const base = String(Cypress.env('podcastFeedBaseUrl') || '').replace(/\/$/, '')
    expect(base, 'cypress.env.json is missing podcastFeedBaseUrl — see scripts/publish-podcast-feeds.sh').to.not.eq('')
    return `${base}/${fixtureName}?v=${Date.now()}${Math.floor(Math.random() * 1000)}`
  }

  enterFeedUrl(url) {
    cy.get('[data-cy="podcast-rss-url--input"] input').clear().type(url, { delay: 0 })
    return this
  }

  connectFeed(url) {
    this.enterFeedUrl(url)
    cy.get('[data-cy="podcast-connect-feed--btn"]').click()
    return this
  }

  assertFeedConnected(expectedEpisodes) {
    cy.get('[data-cy="podcast-episode-list"]', { timeout: 30000 }).should('be.visible')
    if (expectedEpisodes !== undefined) {
      cy.get('[data-cy="podcast-episode--row"]').should('have.length', expectedEpisodes)
    }
    return this
  }

  assertFeedError(expectedText) {
    cy.contains(expectedText, { timeout: 30000 }).should('be.visible')
    cy.get('[data-cy="podcast-episode-list"]').should('not.exist')
    return this
  }

  episodeCheckboxes() {
    return cy.get('input[data-cy="podcast-episode--checkbox"]')
  }

  selectEpisodes(count) {
    for (let index = 0; index < count; index += 1) {
      this.episodeCheckboxes().eq(index).click({ force: true })
    }
    return this
  }

  selectLatest() {
    cy.get('[data-cy="podcast-episodes--select-latest"]').click()
    return this
  }

  clearSelection() {
    cy.get('[data-cy="podcast-episodes--clear"]').click()
    return this
  }

  loadMore() {
    cy.get('[data-cy="podcast-episodes--load-more"]').click()
    return this
  }

  save() {
    cy.get('[data-cy="podcast-save--btn"]').should('not.be.disabled').click({ force: true })
    return this
  }

  assertSaveDisabled() {
    cy.get('[data-cy="podcast-save--btn"]').should('be.disabled')
    return this
  }

  syncNowFromEditPage() {
    cy.get('[data-cy="podcast-sync-now--btn"]').click()
    return this
  }

  // --- index ---------------------------------------------------------------

  search(term) {
    cy.get('[data-cy="podcasts--search-input"] input').clear().type(`${term}{enter}`)
    return this
  }

  filterByStatus(status) {
    cy.get(`[data-cy="podcast-status-filter--${status}"]`).click()
    return this
  }

  row(podcastId) {
    return cy.get(`[data-cy="podcast-row--title"][data-cy-podcast-id="${podcastId}"]`)
  }

  assertStatus(podcastId, status) {
    cy.get(`[data-cy="podcast-row--status-pill"][data-cy-podcast-id="${podcastId}"]`)
      .should('have.attr', 'data-cy-sync-status', status)
    return this
  }

  assertEpisodeCount(podcastId, count) {
    cy.get(`[data-cy="podcast-row--episodes-count"][data-cy-podcast-id="${podcastId}"]`)
      .should('contain.text', String(count))
    return this
  }

  rowAction(podcastId, action) {
    cy.get(`[data-cy="podcast-row--${action}"][data-cy-podcast-id="${podcastId}"]`).click({ force: true })
    return this
  }

  confirmDelete() {
    cy.get('[data-cy="podcast-delete--modal"]').should('be.visible')
    cy.get('[data-cy="podcast-delete--modal"]').contains('button', /delete/i).click({ force: true })
    return this
  }

  cancelDelete() {
    cy.get('[data-cy="podcast-delete--modal"]').contains('button', /cancel/i).click({ force: true })
    return this
  }

  // --- episodes on the edit page -------------------------------------------

  episodeStatus(episodeId) {
    return cy.get(`[data-cy="podcast-episode--status-badge"][data-cy-episode-id="${episodeId}"]`)
  }

  retryEpisode(episodeId) {
    cy.get(`[data-cy="podcast-episode--retry-btn"][data-cy-episode-id="${episodeId}"]`).click({ force: true })
    return this
  }

  // --- cross-cutting -------------------------------------------------------

  /**
   * Podcast lang keys live in an external localization source, so a missing key
   * renders as the raw key. 11 of them shipped that way in the VAI-1680 QA pass;
   * this is the check that would have caught them.
   */
  assertNoRawTranslationKeys() {
    cy.get('body').invoke('text').then((text) => {
      const raw = text.match(/\b(?:podcasts|base|content)\.[a-z][a-z0-9-]{3,}/g) || []
      expect([...new Set(raw)], 'raw translation keys are visible on this page').to.deep.eq([])
    })
    return this
  }
}
