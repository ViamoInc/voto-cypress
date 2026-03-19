import CampaignRegression_Objects from "../../support/page_objects/campaign_regression_objects";
import { ContentNavigation } from "../../support/navigations";

///<reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
});

describe('Message Regression - TTS Audio Generation', () => {
    let data;
    const timestamp = Date.now();

    before(() => {
        cy.fixture('message_regression_details').then((d) => {
            data = d;
        });
    });

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Should create a Voice message and generate audio using Text to Speech', () => {
        cy.navigateTo(ContentNavigation.MESSAGE);
        cy.contains('a', 'New Message').click();
        cy.wait(5000);

        // Set message title and enable Voice channel
        cy.get('#message-title-input').should('be.visible').type(data.message_name + ' ' + timestamp);
        cy.contains('label', 'Voice').click();
        cy.wait(2000);

        // Open the audio options dropdown and switch to TTS tab
        cy.contains('span', 'New audio').click();
        cy.contains('Text to Speech').click();
        cy.wait(1000);

        // Select an English voice from the voice dropdown
        cy.get('[placeholder*="voice"], [placeholder*="Voice"]').first().click();
        cy.wait(1000);
        cy.get('.via-dropdown-item, .multiselect__option').contains(/english/i).first().click();
        cy.wait(500);

        // Enter the TTS text
        cy.get('textarea[placeholder*="text"], textarea[placeholder*="Text"]')
            .first()
            .type(data.tts_text);

        // Intercept TTS generation API and trigger generation
        cy.intercept('POST', '**/content/audio-creator/generate').as('ttsGenerate');
        cy.contains('button', 'Generate').click();
        cy.wait('@ttsGenerate', { timeout: 30000 }).its('response.statusCode').should('eq', 200);

        // Save the generated audio to the message
        cy.contains('button', 'Save').click();
        cy.wait(2000);

        // Save & Publish the message
        cy.contains('span', 'Save & Publish').click();
        cy.wait(3000);

        cy.logoutOfVoto();
    });

    it('Should verify the TTS message appears in the messages list', () => {
        cy.navigateTo(ContentNavigation.MESSAGE);
        cy.wait(2000);
        cy.contains('body', data.message_name + ' ' + timestamp).should('exist');
        cy.logoutOfVoto();
    });

    it('Clean up - delete the TTS message', () => {
        cy.navigateTo(ContentNavigation.MESSAGE);
        cy.wait(2000);
        cy.contains('body', data.message_name + ' ' + timestamp).should('exist');
        cy.contains('a', 'More').first().click();
        cy.get('[data-target="#confirm-delete-message-set"]').first().click({ force: true });
        cy.get('#confirm-delete-message-set_submit').should('be.visible').click();
        cy.wait(2000);
        cy.logoutOfVoto();
    });
});
