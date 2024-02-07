import GroupPage_Objects from  "../../support/page_objects/group_objects";


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
      it('should shrink group via criteria', () => {
        const currentDate = new Date();
        const Configs = {
            timestamp: currentDate.getTime()
           }
        // creating group  using the imported group objects
        group.visitGroupPage();
        group.populateGroup(data.name + Configs.timestamp,data.description +' created @ ' + Configs.timestamp);
        group.editGroup();
        group.shrinkGroup();
        cy.logoutOfVoto();

    });


    });