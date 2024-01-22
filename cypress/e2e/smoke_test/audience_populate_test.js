import GroupPage_Objects from  "../../support/page_objects/group_objects";

///<reference types="cypress" />

describe('audience targeting group', () => {
    before(function(){
        cy.fixture('audience_targeting_group_details').then(function(data){
            globalThis.data = data; 
        })  
        
      });
    beforeEach(() => {
       // cy.visit("/")
        cy.loginToVoto();
        cy.switchOrg(data.audienceTargetingOrg)
        
      });
      // declaring a constant to hold the group class that contains objects.
      const group = new GroupPage_Objects();
      it('should create group & add contact using audience targeting', () => {
        const currentDate = new Date();
        const Configs = {
            timestamp: currentDate.getTime()
           }
        // creating group  using the imported group objects
        group.visitGroupPage();
        group.createGroup(data.name + Configs.timestamp,data.description +' created @ ' + Configs.timestamp);
       //add subscriber to group
        group.addSubscribersToGroupUsingAudienceTarget();
      // save the group
        group.saveGroup();
        //logout
        cy.logoutOfVoto();

    });


    });