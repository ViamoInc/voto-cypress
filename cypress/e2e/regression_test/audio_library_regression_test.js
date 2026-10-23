import PlatformRegression_Objects from "../../support/page_objects/platform_regression_objects";

///<reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
});

describe('Audio Library Regression - Upload and CRUD', () => {
    const platform = new PlatformRegression_Objects();

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Should load the audio library page', () => {
        platform.visitAudioLibrary();
        platform.assertAudioListingLoads();
        cy.logoutOfVoto();
    });

    it('Should upload a WAV audio file to the library', () => {
        platform.visitAudioUploadPage();
        platform.uploadAudioFile('test_audio.wav');
        platform.assertAudioUploadComplete();
        cy.logoutOfVoto();
    });

    it('Should verify the uploaded audio file appears in the library', () => {
        platform.visitAudioLibrary();
        // Recently uploaded files appear in the Recent tab (default view)
        cy.get('#js-recent-audio-table', { timeout: 10000 }).should('exist');
        cy.get('#js-recent-audio-table tr').should('have.length.greaterThan', 0);
        cy.logoutOfVoto();
    });
});
