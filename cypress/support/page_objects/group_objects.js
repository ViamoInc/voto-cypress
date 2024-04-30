import { ContactNavigation  } from "./../../support/navigations";
class GroupPage_Objects{
    visitGroupPage(){
        cy.navigateTo(ContactNavigation.GROUP)
    }

    visitAddGroupPage(){
        cy.navigateTo(ContactNavigation.ADD_GROUP)
    }

    createGroup(name,description){
        this.visitAddGroupPage()
        cy.get('#name').type(name).should('have.value', name)
        cy.get('[id="description"]').type(description).should('have.value', description)
    }
    editGroup(name, description){
        cy.get('a[aria-label="Edit"]:first').click();
        cy.get('button[data-test="submit-button"]').click();

        
    }
    populateGroup(name,description){
        cy.contains('a','New Group').click()
        cy.get('#name').type(name)
        cy.get('[id="description"]').type(description)
        cy.get('input[name="selected_subscriber_method"][value="criteria_based"]').check();
        cy.get('input[name="selected_subscriber_method"][value="criteria_based"]').should('be.checked');
        cy.wait(500)
        cy.contains('h3', 'Demographics').click();
        cy.get('button#gender').click();
        cy.get('input#gender-female').uncheck();

        cy.get('[data-test="submit-button"]').click();

    }    
    expandGroup(){
        cy.contains('label.form-check-label', 'Add more contacts').find('input[type="radio"]').check();
        cy.contains('label.form-check-label', 'Add more contacts').find('input[type="radio"]').should('be.checked');
    }
    shrinkGroup(){
        cy.contains('label.form-check-label', 'Remove some contacts').find('input[type="radio"]').check();
        cy.contains('label.form-check-label', 'Remove some contacts').find('input[type="radio"]').should('be.checked');
        cy.get('input[name="selected_subscriber_method"][value="criteria_based"]').check();
        cy.get('input[name="selected_subscriber_method"][value="criteria_based"]').should('be.checked');
        // cy.contains('h3', 'Demographics').click();
        // cy.get('button#gender').click();
        // cy.get('input#gender-male').uncheck();
        cy.get('[data-test="submit-button"]').click();

    }
    addSubscriberToGroup(contact_name){
        cy.contains('a','Choose Contacts...').click()
        cy.get('[name="js-filter-by-name"]').type(contact_name)
        cy.get('[class="js-open-subscriber-name"]').eq(0).click()
        cy.contains('button','Save Selection').click()
    }
  
    addSubscribersToGroupUsingAudienceTarget(){
        cy.get('input[type="radio"][value="criteria_based"]').click()
        cy.wait(3000)
        cy.contains('h4','Select Criteria').should('be.visible')
    }

    saveGroup(){
        cy.get('.total-contacts-number').should('be.visible')
        cy.contains('button','Add group').click()
        cy.get('.alert-success').should('be.visible')
    }
    cleanup(){
       // cy.wait(60000);

        cy.get('span.badge-warning').should('contain.text', 'Saving...100%');

        cy.get('tbody tr:first-child td:nth-child(8) div:first-child a:nth-child(3) div:first-child svg').click()
        cy.get('button#confirm-delete-group_submit').click();


    }
}
export default GroupPage_Objects;