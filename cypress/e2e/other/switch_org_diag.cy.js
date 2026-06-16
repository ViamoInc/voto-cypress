describe('switch org diagnostics', () => {
  it('keeps the session across an org switch', () => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.loginToVoto()
    cy.getCookies().then((cookies) => {
      cy.task('log', 'AFTER LOGIN: ' + JSON.stringify(cookies.map(c => ({ n: c.name, v: c.value.slice(0, 12), domain: c.domain }))))
    })

    cy.intercept('POST', '**/users/switch-organisation').as('switchOrgRequest')
    cy.get('[data-test="nav-main-menu-item--organisations"]').click({ force: true })
    cy.get('div.multiselect__select').click()
    cy.get('input[placeholder="Switch..."]').type('HNI 321 Mali')
    cy.contains('li', 'HNI 321 Mali').click()
    cy.wait('@switchOrgRequest').then((interception) => {
      cy.task('log', 'SWITCH STATUS: ' + interception.response.statusCode)
      cy.task('log', 'SWITCH SET-COOKIE: ' + JSON.stringify(interception.response.headers['set-cookie'] || 'none'))
      cy.task('log', 'SWITCH BODY: ' + String(interception.response.body).slice(0, 120))
    })
    cy.getCookies().then((cookies) => {
      cy.task('log', 'AFTER SWITCH: ' + JSON.stringify(cookies.map(c => ({ n: c.name, v: c.value.slice(0, 12), domain: c.domain }))))
    })
    cy.reload()
    cy.url().then(u => cy.task('log', 'URL AFTER RELOAD: ' + u))
    cy.contains('footer', 'HNI 321 Mali').should('be.visible')
  })
})
