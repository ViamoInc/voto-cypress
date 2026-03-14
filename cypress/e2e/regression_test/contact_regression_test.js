import ContactRegression_Objects from "../../support/page_objects/contact_regression_objects";
import SubscriberPage_Object from "../../support/page_objects/subscriber_object";

///<reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
});

describe('Contact Regression - Create, Search, and View', () => {
    let data;
    const subscriber = new SubscriberPage_Object();
    const contact = new ContactRegression_Objects();
    const timestamp = Date.now();

    before(() => {
        cy.fixture('contact_regression_details').then((d) => {
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

    it('Should create a new contact', () => {
        subscriber.visitSubscriberPage();
        subscriber.createSubscriber(
            data.phone_number,
            data.name + timestamp,
            data.location,
            data.language,
            data.channel
        );
        subscriber.saveSubscriber();
        cy.wait(2000);
        cy.logoutOfVoto();
    });

    it('Should search and find the created contact by name', () => {
        contact.searchContact(data.name + timestamp);
        contact.assertContactVisible(data.name + timestamp);
        cy.logoutOfVoto();
    });

    it('Should open the contact edit page', () => {
        contact.searchContact(data.name + timestamp);
        cy.contains('a', data.name + timestamp).click();
        cy.wait(2000);
        cy.url().should('include', '/subscriber/');
        cy.logoutOfVoto();
    });

    it('Should open the contact edit page and verify it loads', () => {
        contact.searchContact(data.name + timestamp);
        cy.contains('a', data.name + timestamp).click();
        cy.wait(2000);
        // Verify the subscriber edit page loaded
        cy.url().should('include', '/subscriber/');
        cy.contains('body', data.name + timestamp).should('exist');
        cy.logoutOfVoto();
    });

    it('Should search by phone number', () => {
        contact.visitContactsPage();
        cy.wait(2000);
        cy.get('[name="phone_filter"]').clear().type(data.phone_number);
        cy.get('form#search button[type="submit"]').click();
        cy.wait(3000);
        contact.assertContactVisible(data.name + timestamp);
        cy.logoutOfVoto();
    });

    it('Should filter contacts by channel preference', () => {
        contact.visitContactsPage();
        cy.wait(2000);
        cy.get('[name="preferred_content_type"]').select('SMS');
        cy.wait(3000);
        // Page should reload with filtered results
        cy.url().should('include', 'preferred_content_type');
        cy.logoutOfVoto();
    });
});

describe('Contact Regression - Groups CRUD', () => {
    let data;
    const contact = new ContactRegression_Objects();
    const timestamp = Date.now();

    before(() => {
        cy.fixture('contact_regression_details').then((d) => {
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

    it('Should create a group with a contact', () => {
        contact.visitAddGroupPage();
        contact.createGroup(
            data.group_name + timestamp,
            data.group_description
        );
        contact.addContactToGroup('Cypress');
        contact.saveGroup();
        cy.logoutOfVoto();
    });

    it('Should find the group in listing', () => {
        contact.visitGroupsPage();
        cy.wait(3000);
        cy.contains('body', data.group_name + timestamp).should('exist');
        cy.logoutOfVoto();
    });

    it('Should click on the group and verify subscribers are shown', () => {
        contact.visitGroupsPage();
        cy.wait(3000);
        cy.contains('a', data.group_name + timestamp).click();
        cy.wait(3000);
        // Clicking a group filters subscribers by that group
        cy.url().should('include', 'group_filter');
        cy.logoutOfVoto();
    });

    it('Should clean up - delete the group', () => {
        contact.visitGroupsPage();
        cy.wait(3000);
        // Select the first group checkbox and use bulk delete
        cy.get('input[type="checkbox"]').eq(1).check({ force: true });
        cy.wait(500);
        cy.get('[data-test="delete"]').click({ force: true });
        cy.wait(1500);
        // Click the delete confirmation button in the modal (force click in case modal overlay)
        cy.get('#confirm-delete-group_submit').should('exist').click({ force: true });
        cy.wait(3000);
    });
});
