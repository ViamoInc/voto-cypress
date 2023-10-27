///<reference types="cypress" />

describe('contact', () => {
    before(function(){
        cy.fixture('groupDetails').then(function(data){
            globalThis.data = data; 
        })  
        
      });
    beforeEach(() => {
        cy.visit("/")
        cy.loginToVoto();
        
      });
      it('should create group & add contact', () => {
        const currentDate = new Date();
        const Configs = {
            timestamp: currentDate.getTime()
           }
        // creating group 
        
        cy.get('[data-key="campaign-subscribers"]').click()
        cy.get('[rel="groups"]').click()
        cy.contains('a','New Group').click()
        cy.get('#name').type(data.name + Configs.timestamp)
        cy.get('[id="description"]').type(data.description +' created @ ' + Configs.timestamp)
        cy.wait(800)
        cy.contains('a','Choose Contacts...').click()
        cy.wait(800)
        cy.get('[name="js-filter-by-name"]').type(data.contact_name)
        cy.get('[class="js-open-subscriber-name"]').first().click()
        cy.contains('button','Save Selection').click()
        cy.contains('button','Add group').click()
        cy.wait(1000)
        //logout
        cy.logoutOfVoto();

    });


    });