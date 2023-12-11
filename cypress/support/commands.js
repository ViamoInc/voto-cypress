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
Cypress.Commands.add('loginToVoto', () => {

   // require('dotenv').config();
    
    const defaultlogin ={
        email:Cypress.env('email'),
        password:Cypress.env('password'),
        BaseUrl:Cypress.env('baseUrl')
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

//creating a flow >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>



Cypress.Commands.add('createFlow', (label, languages = ['English'], Channels = ['IVR', 'SMS', 'USSD']) => {
    
    //cy.get('#app').should('exist')
    cy.get('[data-key="campaign-content"]').click()
    cy.get('[rel="trees"]').click()

    cy.get('(//a[contains(text(), "New Flow")])[1]').click()
  
  
    cy.get('[data-cy="flow-label--editor"]')
      .find('textarea')
      .type(label)
  
  
    for (const language of languages) {
      cy.get('[data-cy="languages--selector"]').click()
      cy.contains('.multiselect__option', language).click()
    }
  
    for (const channel of Channels) {
        cy.get('[data-cy="languages--selector"]').click()
        cy.contains('.multiselect__option', channel).click()
      }
    cy.get('[data-cy="create--btn"]').click()
  
  })


  //Add block >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  Cypress.Commands.add('addBlock', (menuChoices) => {
    // Loop through each menu choice
    for (const choice of menuChoices) {
      cy.get('[data-cy="blocks--menu"]')
      .contains('[data-cy="blocks--menu-item"]', choice) // Find the menu item with the specific choice
      .click({ force: true }); // Click on the menu item with force to handle potential hidden elements
  
      // Wait for the block creation to be registered
      cy.wait(100); // Replace with your actual wait time
    }
  });
  

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })