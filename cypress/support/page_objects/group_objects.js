class GroupPage_Objects{
    visitGroupPage(){
        cy.get('[data-key="campaign-subscribers"]').click()
        cy.get('[rel="groups"]').click()
    }

    createGroup(name,description){
        cy.contains('a','New Group').click()
        cy.get('#name').type(name)
        cy.get('[id="description"]').type(description)
    }

    addSubscriberToGroup(contact_name){
        cy.contains('a','Choose Contacts...').click()
        cy.get('[name="js-filter-by-name"]').type(contact_name)
        cy.get('[class="js-open-subscriber-name"]').eq(0).click()
    }
  
    selectAudienceTargeting(){
        cy.get('input[name="selected_subscriber_method"][value="criteria_based"]').check();
        cy.get('input[name="selected_subscriber_method"][value="criteria_based"]').should('be.checked');
      
    }
    expandAudienceTargeting(){
        cy.get('#date-picker-input-91').click();
        cy.contains('li', 'Last 7 Days').click();
        cy.get('[data-test="submit-button"]').click();

    }
    saveGroup(){
        cy.contains('button','Save Selection').click()
        cy.contains('button','Add group').click()
    }


}
export default GroupPage_Objects;