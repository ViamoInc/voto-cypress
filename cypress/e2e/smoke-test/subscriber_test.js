///<reference types="cypress" />


describe('contact', () => {
    before(function(){
        cy.fixture('subscriberDetails').then(function(data){
            globalThis.data = data; 
        })  
        
      });
    beforeEach(() => {
        cy.visit("/")
        cy.loginToVoto();
        
      });

    it('should create contact', () => {
        cy.get('[data-key="campaign-subscribers"]').click()
        cy.get('[rel="subscribers"]').click()
        //create a contact
        cy.contains('a','New Contact').click()
        cy.get('[name="phone"]').type(data.phone_number)
        cy.get('[type="text"]').first().type(data.name)
        cy.get('[type="text"]').eq(1).type(data.location)

        cy.get('[name="preferred_language"]').select(data.language)
        cy.get('[name="preferred_content_type"]').select(data.channel)
        //save contact 
        cy.contains('button','Add Contacts').click()
        cy.wait(1000)
        //logout

        cy.logoutOfVoto();
    });

  });