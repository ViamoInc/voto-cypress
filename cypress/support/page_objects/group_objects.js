class GroupPage_Objects{
    visitGroupPage(){
        cy.get('[data-key="campaign-subscribers"]').click()
        cy.get('[rel="groups"]').click()
    }

    createGroup(name,description){
        cy.contains('a','New Group').click()
        cy.get('#name').type(name).should('have.value', name)
        cy.get('[id="description"]').type(description).should('have.value', description)
    }
    editGroup(name, description){
        cy.get('a[aria-label="Edit"]:first').click();
    }
    populateGroup(name,description){
        cy.contains('a','New Group').click()
        cy.get('#name').type(name)
        cy.get('[id="description"]').type(description)
        cy.get('input[name="selected_subscriber_method"][value="criteria_based"]').check();
        cy.get('input[name="selected_subscriber_method"][value="criteria_based"]').should('be.checked');
        cy.contains('h3.title', 'Demographics').click();
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
        cy.contains('h3.title', 'Demographics').click();
        cy.get('button#gender').click();
        cy.get('input#gender-male').uncheck();
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
        cy.wait(2000)
        cy.contains('h4','Select Criteria').should('be.visible')
    }

    saveGroup(){
        cy.get('.total-contacts-number').should('be.visible')
        cy.contains('button','Add group').click()
        cy.get('.alert-success').should('be.visible')
    }

}
export default GroupPage_Objects;