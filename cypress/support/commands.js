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

Cypress.Commands.add('switchOrg', (orgName) => {

    cy.get('[data-key="account-settings"]').click()
    cy.get('div.multiselect__select').click()
    cy.get('input[placeholder="Switch Organization"]').type(orgName)
    cy.contains('li', orgName).click()
    cy.contains('.footer', orgName).should('be.visible')
})

Cypress.Commands.add('logoutOfVoto', () => {
    
    cy.get('[data-key="account-settings"]').click()
    cy.contains('a','Logout').click()
})

//creating a flow >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


Cypress.Commands.add('createFlow', ({label, languages = ['English'], Channels = ['IVR', 'SMS', 'USSD']}) => {
    
    //cy.get('#app').should('exist')
    cy.get('[data-key="campaign-content"]').click()
    cy.get('[rel="trees"]').click()

   // cy.get('(//a[contains(text(), "New Flow")])[1]').click()
   cy.get('[href="/flows/new"]').click()
  
    cy.get('[data-cy="flow-label--editor"]')
      .find('textarea')
      .type(label)
  

    for (const language of languages) {
      cy.get('[data-cy="languages--selector"]').click()
      cy.contains('.multiselect__option', language).click()
    }
  
    for (const channel of Channels) {
        cy.get('[data-cy="modes--selector"]').click()
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
  
//>>>>>>>Save flow 
Cypress.Commands.add('save', () => {
    cy.get('[data-cy="save--btn"]')
      .as('saveBtn')
      .should('not.have.attr', 'disabled')
  
    cy.get('@saveBtn').click({
      // May be covered with a toast
      force: true,
    })
  })

  //>>>>>>> Drag and drop blocks 

  Cypress.Commands.add('dragAndDropTo', {prevSubject: 'element'}, (subject, targetSelectorOrAlias) => {
    cy.wrap(subject).scrollIntoView()
    cy.wrap(subject).should('be.visible')
    cy.get(targetSelectorOrAlias).should('be.visible')
  
    cy.wrap(subject)
      .realHover()
      .realMouseDown()
  
    cy.get(targetSelectorOrAlias)
      .realMouseMove(0, 0, {position: 'center'})
      .realMouseUp({position: 'center'})
  })

  //>>>>>>> Edit flow 

  Cypress.Commands.add('EditFlow_tree', () => {
    cy.get('[href="/trees"]').click()
  /*  if (cy.get('body').contains(/Create an account/i)) {
      cy.log('Found "Create an account" text. Logging in...');
      const defaultlogin = {
        email: Cypress.env('email'),
        password: Cypress.env('password'),
      };

      cy.get('[name="email"]').type(defaultlogin.email);
      cy.get('[name="password"]').type(defaultlogin.password);
      cy.get('[type="submit"]').click();
    }else {
      cy.log('Did not find "Create an account" text. Skipping login.');
    }
*/
    
    cy.get('[data-icon="edit"]').first().click();

  })

  //>>>>>>>>>Delete flow/tree created 
  Cypress.Commands.add('DeleteFlow', () => {
    cy.contains('a','More').first().click()
    cy.contains('a','Delete Flow').first().click()
    cy.wait(150)
    cy.contains('button','Delete').click()
  })
//>>>>>>>>>>>>>>>>>>>>Publish Flow \

Cypress.Commands.add('PublishFlow', () => {
  cy.contains('a','Publish').click()
  cy.wait(100)
  cy.contains('button','Publish').click()
})

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })