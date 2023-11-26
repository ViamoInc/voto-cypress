import GroupPage_Objects from  "../../support/page_objects/group_objects";

///<reference types="cypress" />

describe('group', () => {
    before(function(){
        cy.fixture('group_details').then(function(data){
            globalThis.data = data; 
        })  
        
      });
    beforeEach(() => {
       // cy.visit("/")
        cy.loginToVoto();
        
      });
      // declaring a constant to hold the group class that contains objects.
      const group = new GroupPage_Objects();
      it('should create group & add contact', () => {
        const currentDate = new Date();
        const Configs = {
            timestamp: currentDate.getTime()
           }
        // creating group  using the imported group objects
        group.visitGroupPage();
        group.createGroup(data.name + Configs.timestamp,data.description +' created @ ' + Configs.timestamp);
       //add subscriber to group
        group.addSubscriberToGroup(data.contact_name);
      // save the group
        group.saveGroup();
        //logout
        cy.logoutOfVoto();

    });


    });