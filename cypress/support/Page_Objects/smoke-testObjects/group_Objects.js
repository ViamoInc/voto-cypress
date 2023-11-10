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

    saveGroup(){
        cy.contains('button','Save Selection').click()
        cy.contains('button','Add group').click()
    }


}
export default GroupPage_Objects;