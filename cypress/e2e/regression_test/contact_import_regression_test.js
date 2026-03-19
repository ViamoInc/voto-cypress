import { ContactNavigation } from "../../support/navigations";
import PlatformRegression_Objects from "../../support/page_objects/platform_regression_objects";

///<reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
});

describe('Contact Import Regression', () => {
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
        cy.get('body').should('contain.text', 'Import');
        cy.logoutOfVoto();
    });

    it('Should upload a CSV file and show the column mapping dialog', () => {
        platform.visitImportContactPage();
        cy.wait(2000);

        // Upload the CSV fixture file
        cy.get('input[type="file"][name="import_file"], input[type="file"][accept*=".csv"]')
            .selectFile('cypress/fixtures/contact_import_details.csv', { force: true });
        cy.wait(3000);

        // The column mapping modal should appear after upload
        cy.get('[role="dialog"], .modal, .via-modal').should('be.visible');
        cy.contains(/column|mapping|match/i).should('exist');

        cy.logoutOfVoto();
    });

    it('Should map columns and confirm the import', () => {
        platform.visitImportContactPage();
        cy.wait(2000);

        // Upload CSV
        cy.get('input[type="file"][name="import_file"], input[type="file"][accept*=".csv"]')
            .selectFile('cypress/fixtures/contact_import_details.csv', { force: true });
        cy.wait(3000);

        // Wait for mapping dialog
        cy.get('[role="dialog"], .modal, .via-modal').should('be.visible');

        // Map "phone" column — first row should be the phone header
        // VueMultiSelect: click the dropdown for the "phone" row and select the phone property
        cy.get('.multiselect').first().click();
        cy.get('.multiselect__element, .multiselect__option')
            .contains(/phone/i)
            .first()
            .click();

        // Map "name" column — second multiselect
        cy.get('.multiselect').eq(1).click();
        cy.get('.multiselect__element, .multiselect__option')
            .contains(/name/i)
            .first()
            .click();

        // Confirm the import
        cy.contains('button', /confirm|upload|import/i).click();
        cy.wait(5000);

        // Assert success — page redirects or shows confirmation
        cy.get('body').should('not.contain.text', 'Error');

        cy.logoutOfVoto();
    });

    it('Should verify imported contacts appear in the contacts list', () => {
        cy.navigateTo(ContactNavigation.CONTACT);
        cy.wait(2000);
        // Verify at least one of our imported contacts is visible
        cy.contains('body', 'Cypress Import Alpha').should('exist');
        cy.logoutOfVoto();
    });
});
