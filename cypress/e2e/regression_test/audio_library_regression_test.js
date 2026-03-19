import PlatformRegression_Objects from "../../support/page_objects/platform_regression_objects";

///<reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
});

describe('Audio Library Regression - Upload and CRUD', () => {
    const platform = new PlatformRegression_Objects();
    // Fixed filename so we can search for it after upload
    const uploadedFilename = 'test_audio';

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
        platform.searchAudio(uploadedFilename);
        cy.contains('body', uploadedFilename).should('exist');
        cy.logoutOfVoto();
    });

    it('Clean up - delete the uploaded audio file', () => {
        platform.visitAudioLibrary();
        platform.searchAudio(uploadedFilename);
        cy.contains('body', uploadedFilename).should('exist');
        platform.deleteFirstAudioInLibrary();
        cy.logoutOfVoto();
    });
});
