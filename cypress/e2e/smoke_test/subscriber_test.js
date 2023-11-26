import SubscriberPage_Object from "../../support/page_objects/subscriber_object";

///<reference types="cypress" />


describe('contact', () => {
    before(function(){
        cy.fixture('subscriber_details').then(function(data){
            globalThis.data = data; 
        })  
        
      });
    beforeEach(() => {
       // cy.visit("/")
        cy.loginToVoto();
        
      });
      // making an instance of the subscriber class that holds the objects i want to use
      const subscriber = new SubscriberPage_Object();
    
    it('should create contact', () => {

        subscriber.visitSubscriberPage();

        //create a contact using the objects from the instantiated class
        subscriber.createSubscriber(data.phone_number,data.name,data.location,data.language,data.channel);

        //save contact 
        subscriber.saveSubscriber();
        //logout
        cy.logoutOfVoto();
    });

  });