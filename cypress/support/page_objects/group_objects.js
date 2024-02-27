import { ContactNavigation  } from "./../../support/navigations";
class GroupPage_Objects{
    visitGroupPage(){
        cy.navigateTo(ContactNavigation.GROUP)
    }

    createGroup(name,description){
        cy.contains('a','New Group').click()
        cy.get('#name').type(name).should('have.value', name)
        cy.get('[id="description"]').type(description).should('have.value', description)
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

}
export default GroupPage_Objects;