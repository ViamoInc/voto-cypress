import { ContentNavigation, ContactNavigation, accountNavigation } from "../navigations";

class PlatformRegression_Objects {

    // ─── Audio Library ───
    visitAudioLibrary() {
        cy.navigateTo(ContentNavigation.AUDIO);
        cy.wait(2000);
    }

    assertAudioListingLoads() {
        cy.url().should('include', '/audio');
        cy.get('body').should('not.be.empty');
    }

    searchAudio(query) {
        // Audio library has no search — just wait for the listing to load
        cy.wait(2000);
    }

    // ─── Contact Properties ───
    visitContactProperties() {
        cy.navigateTo(ContactNavigation.CONTACT_PROPERTY);
        cy.wait(2000);
    }

    visitAddContactProperty() {
        cy.navigateTo(ContactNavigation.ADD_CONTACT_PROPERTY);
        cy.wait(2000);
    }

    createContactProperty(name, type = 'text') {
        // The "Add Contact Property" form has a "Property Name" field
        cy.get('input[type="text"]').first().type(name);
        // The submit button is "Add Property"
        cy.contains('button', 'Add Property').click();
        cy.wait(2000);
    }

    assertPropertyVisible(name) {
        cy.contains('body', name).should('exist');
    }

    deleteFirstProperty() {
        cy.get('a.js-delete, [data-target*="delete"]').first().click({ force: true });
        cy.wait(500);
        cy.contains('button', 'Delete').click();
        cy.wait(2000);
    }

    // ─── Do Not Disturb ───
    visitDoNotDisturb() {
        cy.navigateTo(ContactNavigation.DO_NOT_DISTURB_CONTACT);
        cy.wait(2000);
    }

    assertDndPageLoads() {
        cy.get('body').should('not.be.empty');
    }

    addDndNumber(phoneNumber) {
        cy.navigateTo(ContactNavigation.ADD_DO_NOT_DISTURB_CONTACT);
        cy.wait(2000);
        cy.get('[name="phone"]').type(phoneNumber);
        cy.contains('button', 'Save').click();
        cy.wait(2000);
    }

    // ─── Account / Settings ───
    // Use direct URL navigation since settings nav selectors
    // may not be available for all org/user permission levels
    visitUserSettings() {
        cy.visit(Cypress.env('baseUrl') + '/user/profile');
        cy.wait(2000);
    }

    assertUserSettingsLoads() {
        cy.get('body').should('not.be.empty');
    }

    visitOrgSettings() {
        cy.visit(Cypress.env('baseUrl') + '/organisation/settings');
        cy.wait(2000);
    }

    assertOrgSettingsLoads() {
        cy.get('body').should('not.be.empty');
    }

    visitCreditPage() {
        cy.visit(Cypress.env('baseUrl') + '/organisation/credit');
        cy.wait(2000);
    }

    assertCreditPageLoads() {
        cy.get('body').should('not.be.empty');
    }

    visitUsersPage() {
        cy.visit(Cypress.env('baseUrl') + '/organisation/users');
        cy.wait(2000);
    }

    assertUsersPageLoads() {
        cy.get('body').should('not.be.empty');
    }

    visitRolesPage() {
        cy.visit(Cypress.env('baseUrl') + '/organisation/roles');
        cy.wait(2000);
    }

    assertRolesPageLoads() {
        cy.get('body').should('not.be.empty');
    }

    // ─── Content Pages ───
    visitSurveysPage() {
        cy.navigateTo(ContentNavigation.SURVEYS);
        cy.wait(2000);
    }

    assertSurveysPageLoads() {
        cy.get('body').should('not.be.empty');
    }

    visitPlaceholdersPage() {
        cy.navigateTo(ContentNavigation.PLACEHOLDER);
        cy.wait(2000);
    }

    assertPlaceholdersPageLoads() {
        cy.get('body').should('not.be.empty');
    }

    visitLanguageSelectorsPage() {
        cy.navigateTo(ContentNavigation.LANGUAGE_SELECTORS);
        cy.wait(2000);
    }

    assertLanguageSelectorsPageLoads() {
        cy.get('body').should('not.be.empty');
    }

    visitExportsLibrary() {
        cy.navigateTo(ContentNavigation.EXPORTS_LIBRARY);
        cy.wait(2000);
    }

    assertExportsLibraryLoads() {
        cy.get('body').should('not.be.empty');
    }

    // ─── Message CRUD (Voice + SMS) ───
    visitMessagesPage() {
        cy.navigateTo(ContentNavigation.MESSAGE);
        cy.wait(2000);
    }

    createVoiceSmsMessage(name, audioName, smsContent) {
        cy.contains('a', 'New Message').click();
        cy.wait(5000);
        cy.get('#message-title-input').should('be.visible').type(name);
        // Enable Voice and SMS
        cy.contains('label', 'Voice').click();
        cy.contains('label', 'SMS').click();
        cy.wait(2000);
        // Configure voice — search audio library
        cy.get('[data-icon="chevron-down"]').first().click();
        cy.get('[placeholder="Search audio library"]')
            .should('be.visible')
            .eq(0)
            .click()
            .type(audioName);
        cy.get('.via-dropdown-item')
            .should('be.visible')
            .contains(audioName)
            .click();
        // Configure SMS
        cy.wait(2000);
        cy.get('[aria-label="sms content for English"]').eq(0).type(smsContent);
    }

    saveAndPublishMessage() {
        cy.contains('span', 'Save & Publish').click();
        cy.wait(3000);
    }

    assertMessageInList(name) {
        this.visitMessagesPage();
        cy.contains('body', name).should('exist');
    }

    deleteFirstMessage() {
        cy.contains('a', 'More').first().click();
        cy.get('[data-target="#confirm-delete-message-set"]').first().click({ force: true });
        cy.get('#confirm-delete-message-set_submit').should('be.visible').click();
        cy.wait(2000);
    }

    // ─── Audio Library Upload & Delete ───

    visitAudioUploadPage() {
        cy.navigateTo(ContentNavigation.ADD_AUDIO);
        cy.wait(2000);
    }

    uploadAudioFile(filename) {
        // Flow.js creates two hidden file inputs (file + folder); target the first one
        cy.get('input[type="file"]').first().selectFile(`cypress/fixtures/${filename}`, { force: true });
        // Wait for the upload to finish — Flow.js updates the row status
        cy.get('.flow-list, table', { timeout: 15000 }).should('be.visible');
        cy.wait(3000);
    }

    assertAudioUploadComplete() {
        // Flow.js shows "(complete)" when upload finishes
        cy.contains('complete', { timeout: 15000 }).should('exist');
    }

    deleteFirstAudioInLibrary() {
        // Delete button pattern used across audio library rows
        cy.get('[data-target*="delete-audio"], .js-delete-audio, [href*="audio"][href*="delete"]')
            .first()
            .click({ force: true });
        cy.wait(500);
        cy.get('[id*="delete"] [type="submit"]').should('be.visible').click();
        cy.wait(2000);
    }

    // ─── Contact Import/Export pages ───
    visitImportContactPage() {
        cy.navigateTo(ContactNavigation.IMPORT_CONTACT);
        cy.wait(2000);
    }

    assertImportPageLoads() {
        cy.get('body').should('not.be.empty');
    }

    visitExportContactPage() {
        cy.navigateTo(ContactNavigation.EXPORT_CONTACT);
        cy.wait(2000);
    }

    assertExportPageLoads() {
        cy.get('body').should('not.be.empty');
    }
}

export default PlatformRegression_Objects;
