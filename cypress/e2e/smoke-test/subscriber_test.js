import SubscriberPage_Object from "../../support/Page_Objects/smoke-testObjects/subscriber_Object";

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
      const subscriber_object = new SubscriberPage_Object();
    
    it('should create contact', () => {

        subscriber_object.visitSubscriberPage();

        //create a contact
        subscriber_object.createSubscriber(data.phone_number,data.name,data.location,data.language,data.channel);

        //save contact 
        subscriber_object.saveSubscriber();
        //logout
        cy.logoutOfVoto();
    });

  });