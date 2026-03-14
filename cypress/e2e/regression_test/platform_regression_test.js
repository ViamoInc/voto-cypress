import PlatformRegression_Objects from "../../support/page_objects/platform_regression_objects";

///<reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
});

describe('Platform Regression - Audio Library', () => {
    let data;
    const platform = new PlatformRegression_Objects();

    before(() => {
        cy.fixture('platform_regression_details').then((d) => {
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

    it('Should load the audio library listing page', () => {
        platform.visitAudioLibrary();
        platform.assertAudioListingLoads();
        cy.logoutOfVoto();
    });

    it('Should search for an audio file in the library', () => {
        platform.visitAudioLibrary();
        platform.searchAudio(data.audio_search_term);
        cy.contains('body', data.audio_search_term).should('exist');
        cy.logoutOfVoto();
    });
});

describe('Platform Regression - Voice+SMS Message CRUD', () => {
    let data;
    const platform = new PlatformRegression_Objects();
    const timestamp = Date.now();

    before(() => {
        cy.fixture('platform_regression_details').then((d) => {
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

    it('Should create a Voice+SMS message, verify, and delete', () => {
        platform.visitMessagesPage();
        platform.createVoiceSmsMessage(
            data.message_name + ' ' + timestamp,
            data.audio_name,
            data.sms_content + ' ' + timestamp
        );
        platform.saveAndPublishMessage();
        // Verify it exists
        platform.assertMessageInList(data.message_name + ' ' + timestamp);
        // Clean up
        platform.deleteFirstMessage();
        cy.logoutOfVoto();
    });
});

describe('Platform Regression - Contact Properties', () => {
    let data;
    const platform = new PlatformRegression_Objects();
    const timestamp = Date.now();

    before(() => {
        cy.fixture('platform_regression_details').then((d) => {
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

    it('Should load the contact properties page', () => {
        platform.visitContactProperties();
        cy.get('body').should('not.be.empty');
        cy.logoutOfVoto();
    });

    it('Should create a contact property and verify it appears', () => {
        platform.visitAddContactProperty();
        platform.createContactProperty(data.contact_property_name + ' ' + timestamp);
        platform.visitContactProperties();
        platform.assertPropertyVisible(data.contact_property_name + ' ' + timestamp);
        cy.logoutOfVoto();
    });
});

describe('Platform Regression - Do Not Disturb List', () => {
    const platform = new PlatformRegression_Objects();

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Should load the Do Not Disturb page', () => {
        platform.visitDoNotDisturb();
        platform.assertDndPageLoads();
        cy.logoutOfVoto();
    });
});

describe('Platform Regression - Account & Settings Pages', () => {
    const platform = new PlatformRegression_Objects();

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Should load the user profile settings page', () => {
        platform.visitUserSettings();
        platform.assertUserSettingsLoads();
        cy.logoutOfVoto();
    });

    it('Should load the organisation settings page', () => {
        platform.visitOrgSettings();
        platform.assertOrgSettingsLoads();
        cy.logoutOfVoto();
    });

    it('Should load the credit/billing page', () => {
        platform.visitCreditPage();
        platform.assertCreditPageLoads();
        cy.logoutOfVoto();
    });

    it('Should load the users management page', () => {
        platform.visitUsersPage();
        platform.assertUsersPageLoads();
        cy.logoutOfVoto();
    });

    it('Should load the roles management page', () => {
        platform.visitRolesPage();
        platform.assertRolesPageLoads();
        cy.logoutOfVoto();
    });
});

describe('Platform Regression - Content Listing Pages', () => {
    const platform = new PlatformRegression_Objects();

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Should load the surveys page', () => {
        platform.visitSurveysPage();
        platform.assertSurveysPageLoads();
        cy.logoutOfVoto();
    });

    it('Should load the placeholders page', () => {
        platform.visitPlaceholdersPage();
        platform.assertPlaceholdersPageLoads();
        cy.logoutOfVoto();
    });

    it('Should load the language selectors page', () => {
        platform.visitLanguageSelectorsPage();
        platform.assertLanguageSelectorsPageLoads();
        cy.logoutOfVoto();
    });

    it('Should load the exports library page', () => {
        platform.visitExportsLibrary();
        platform.assertExportsLibraryLoads();
        cy.logoutOfVoto();
    });
});

describe('Platform Regression - Contact Import/Export Pages', () => {
    const platform = new PlatformRegression_Objects();

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Should load the contact import page', () => {
        platform.visitImportContactPage();
        platform.assertImportPageLoads();
        cy.logoutOfVoto();
    });

    it('Should load the contact export page', () => {
        platform.visitExportContactPage();
        platform.assertExportPageLoads();
        cy.logoutOfVoto();
    });
});
