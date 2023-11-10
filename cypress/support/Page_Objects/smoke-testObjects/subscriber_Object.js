class SubscriberPage_Object{
    visitSubscriberPage(){
        cy.get('[data-key="campaign-subscribers"]').click()
        cy.get('[rel="subscribers"]').click()
    }

    createSubscriber(phone_number,name,location,language,channel){
        cy.contains('a','New Contact').click()
        cy.get('[name="phone"]').type(phone_number)
        cy.get('[type="text"]').first().type(name)
        cy.get('[type="text"]').eq(1).type(location)

        cy.get('[name="preferred_language"]').select(language)
        cy.get('[name="preferred_content_type"]').select(channel)
    }

    saveSubscriber(){
        cy.contains('button','Add Contacts').click()
    }

}
export default SubscriberPage_Object;