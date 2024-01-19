// ***********************************************

// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })


// env configuration 

// end of configuration
Cypress.Commands.add('searchAndSubmit', (searchText) => {
    cy.get('input[type="text"]').type(searchText).type('{enter}');
  });

Cypress.Commands.add('loginToVoto', () => {

   // require('dotenv').config();
    
    const defaultlogin ={
        email:Cypress.env('email'),
        password:Cypress.env('password'),
        BaseUrl:Cypress.env('baseUrl'),
        OrgName:Cypress.env('OrgName')
    }
  
      cy.visit(defaultlogin.BaseUrl)
      cy.get('[name="email"]').type(defaultlogin.email)
      cy.get('[name="password"]').type(defaultlogin.password)
      cy.get('[type="submit"]').click()
})

Cypress.Commands.add('logoutOfVoto', () => {
    
    cy.get('[data-key="account-settings"]').click()
    cy.contains('a','Logout').click()
})

Cypress.Commands.add('switchOrg', () => {
    const switchOrgName = Cypress.env('OrgName');

    cy.get('.menu-label').contains('Account').click();
    cy.get('.multiselect__placeholder').contains('Switch Organization').click();
    cy.searchAndSubmit(switchOrgName);  
});
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })