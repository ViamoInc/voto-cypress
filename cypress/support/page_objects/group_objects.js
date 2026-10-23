import { ContactNavigation  } from "./../../support/navigations";
class GroupPage_Objects{
    visitGroupPage(){
        cy.navigateTo(ContactNavigation.GROUP)
    }

    visitAddGroupPage(){
        cy.navigateTo(ContactNavigation.ADD_GROUP)
    }

    createGroupWithSubscriber(name,description){
        this.visitAddGroupPage()
        cy.get('#name').type(name).should('have.value', name)
        cy.get('[id="description"]').type(description).should('have.value', description)
        cy.get('a[data-test="choose-contacts"]').click();

        cy.get('tr.js-open-subscriber-item').eq(1).click();
        cy.wait(100)// this due to an overlay that comes on the page , it allows us to load the dom completely

        cy.get('tr.js-open-subscriber-item').eq(2).click();
        cy.wait(100)
        cy.get('button[data-test="save-selection"]').click();
        cy.wait(100)
        cy.get('button[data-test="submit-button"]').click();
        cy.wait(200)
    }
    createGroup(name,description){
        this.visitAddGroupPage()
        cy.get('#name').type(name).should('have.value', name)
        cy.get('[id="description"]').type(description).should('have.value', description)
    }
    editGroup(name, description){
        // Leaves the form open: shrinkGroup() needs its size-adjustment options.
        cy.get('a[aria-label="Edit"]:first').click();
        cy.get('[data-test="edit-group"]').should('be.visible');
    }
    populateGroup(name,description){
        cy.contains('a','New Group').click()
        cy.get('#name').type(name)
        cy.get('[id="description"]').type(description)
        cy.get('input[name="selected_subscriber_method"][value="criteria_based"]').check();
        cy.get('input[name="selected_subscriber_method"][value="criteria_based"]').should('be.checked');
        cy.wait(600)
        cy.contains('h3', 'Demographics').click();
        cy.get('button#gender').click();
        cy.get('input#gender-female').uncheck();

        cy.get('[data-test="submit-button"]').click();

    }    
    expandGroup(){
        cy.wait(1500);// this due to an overlay that comes on the page , it allows us to load the dom completely
        cy.contains('a','More').eq(0).click();
        cy.contains('a','Divide Group').click({ force: true });
        cy.get('[id="number-of-groups"]').clear().type(2);
        cy.contains('button', 'Proceed').click();
        cy.contains('button', 'Close').click({force: true} );
        cy.wait(1500);// this due to an overlay that comes on the page , it allows us to load the dom completely

    }
    shrinkGroup(){
        cy.contains('label.form-check-label', 'Remove some contacts').find('input[type="radio"]').check();
        cy.contains('label.form-check-label', 'Remove some contacts').find('input[type="radio"]').should('be.checked');
        cy.get('input[name="selected_subscriber_method"][value="criteria_based"]').check();
        cy.get('input[name="selected_subscriber_method"][value="criteria_based"]').should('be.checked');
        cy.get('[data-test="submit-button"]').click();
        // Confirming mid show-transition orphans the .modal-backdrop, which blocks the next click.
        cy.get('#confirm-update-group').should('be.visible');
        cy.wait(500);
        cy.contains('#confirm-update-group button', 'Yes, Proceed').click();
        cy.location('pathname', { timeout: 15000 }).should('eq', '/groups');
    }
    addSubscriberToGroup(contact_name){
        cy.contains('a','Choose Contacts...').click()
        cy.get('[name="js-filter-by-name"]').type(contact_name)
        cy.get('[class="js-open-subscriber-name"]').eq(0).click()
        cy.contains('button','Save Selection').click()
    }
  
    addSubscribersToGroupUsingAudienceTarget(){
        cy.get('input[type="radio"][value="criteria_based"]').click()
        cy.wait(3500)
        cy.contains('h4','Select Criteria').should('be.visible')
    }
    

    saveGroup(){
        cy.get('.total-contacts-number').should('be.visible')
        cy.contains('button','Add group').click()
        cy.get('.alert-success').should('be.visible')
    }
    cleanup(name){
        cy.wait(6000);
        cy.reload();
        // Only this spec's group and the parts Divide Group named "<name> (n)", so seeded groups survive.
        cy.get('tbody tr').filter(`:contains("${name}")`).find('[type="checkbox"]').check({ force: true });
        cy.get('select[name="action_type"]').select('delete');
        cy.contains('button','GO').click();
        cy.reload();
    }
}
export default GroupPage_Objects;