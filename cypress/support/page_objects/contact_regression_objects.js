import { ContactNavigation } from "../navigations";

class ContactRegression_Objects {

    visitContactsPage() {
        cy.navigateTo(ContactNavigation.CONTACT);
        cy.wait(2000);
    }

    visitAddContactPage() {
        cy.navigateTo(ContactNavigation.CONTACT);
        cy.navigateTo(ContactNavigation.ADD_CONTACT);
    }

    createContact(phone, name, location, language, channel) {
        cy.get('[name="phone"]').type(phone);
        cy.get('[type="text"]').first().type(name);
        cy.get('[type="text"]').eq(1).type(location);
        cy.get('[name="preferred_language"]').select(language);
        cy.get('[name="preferred_content_type"]').select(channel);
    }

    saveContact() {
        cy.contains('button', 'Add Contacts').click();
        cy.wait(2000);
    }

    searchContact(searchTerm) {
        this.visitContactsPage();
        cy.wait(2000);
        // Subscriber listing uses a form with name_filter and phone_filter inputs
        cy.get('#form-name-filter').clear().type(searchTerm);
        cy.get('form#search button[type="submit"]').click();
        cy.wait(3000);
    }

    assertContactVisible(name) {
        cy.contains('body', name).should('exist');
    }

    assertContactNotVisible(name) {
        cy.contains('body', name).should('not.exist');
    }

    clickFirstContact() {
        cy.get('tr.js-open-subscriber-item').first().click();
    }

    editContact(newName) {
        cy.contains('a', 'Edit').first().click();
        cy.wait(2000);
        // Clear and retype the name field
        cy.get('[type="text"]').first().clear().type(newName);
    }

    saveEditedContact() {
        cy.contains('button', 'Save').click();
        cy.wait(2000);
    }

    deleteContact() {
        cy.contains('a', 'Delete').click();
        cy.wait(500);
        cy.contains('button', 'Delete').click();
        cy.wait(2000);
    }

    // Group operations
    visitGroupsPage() {
        cy.navigateTo(ContactNavigation.GROUP);
    }

    visitAddGroupPage() {
        cy.navigateTo(ContactNavigation.ADD_GROUP);
    }

    createGroup(name, description) {
        cy.get('#name').type(name);
        cy.get('[id="description"]').type(description);
    }

    addContactToGroup(contactName) {
        cy.get('a[data-test="choose-contacts"]').click();
        cy.wait(2000);
        cy.get('[placeholder="Search contacts..."]').type(contactName);
        cy.wait(1000);
        cy.get('tr.js-open-subscriber-item').first().click();
        cy.get('[data-test="save-selection"]').click();
        cy.wait(1000);
    }

    saveGroup() {
        cy.get('[data-test="submit-button"]').click();
        cy.wait(2000);
    }

    editGroupDescription(newDescription) {
        cy.get('[id="description"]').clear().type(newDescription);
        cy.get('[data-test="submit-button"]').click();
        cy.wait(2000);
    }

    deleteGroup() {
        cy.get('input[type="checkbox"]').eq(1).check({ force: true });
        cy.wait(500);
        cy.get('[data-test="delete"]').click({ force: true });
        cy.wait(500);
        cy.contains('button', 'Delete').click();
        cy.wait(2000);
    }
}

export default ContactRegression_Objects;
