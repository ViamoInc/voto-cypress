import GroupPage_Objects from  "../../support/Page_Objects/smoke-testObjects/group_Objects";

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
      const group_objects = new GroupPage_Objects();
      it('should create group & add contact', () => {
        const currentDate = new Date();
        const Configs = {
            timestamp: currentDate.getTime()
           }
        // creating group 
        group_objects.visitGroupPage();
        group_objects.createGroup(data.name + Configs.timestamp,data.description +' created @ ' + Configs.timestamp);
       //add subscriber to group
        group_objects.addSubscriberToGroup(data.contact_name);
      // save the group
        group_objects.saveGroup();
        //logout
        cy.logoutOfVoto();

    });


    });