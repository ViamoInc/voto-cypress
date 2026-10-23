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

    it('Should upload a CSV file and complete the import', () => {
        platform.visitImportContactPage();
        cy.wait(2000);

        // Upload the CSV fixture file
        cy.get('input[type="file"][name="import_file"]')
            .selectFile('cypress/fixtures/contact_import_details.csv', { force: true });

        // Submit the upload form
        cy.contains('button', /upload/i).click();
        cy.wait(5000);

        // Step 1: Column mapping dialog — columns are auto-mapped, click Next
        cy.contains('Import Options', { timeout: 10000 }).should('be.visible');
        cy.contains('button', 'Next').click();
        cy.wait(2000);

        // Step 2: Duplicate handling and group assignment — click Confirm Upload
        cy.contains('button', 'Confirm Upload', { timeout: 10000 }).click();
        cy.wait(5000);

        cy.logoutOfVoto();
    });

    it('Should verify contacts page loads', () => {
        cy.navigateTo(ContactNavigation.CONTACT);
        cy.wait(2000);
        cy.get('body').should('not.be.empty');
        cy.logoutOfVoto();
    });
});
