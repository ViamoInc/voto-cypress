import GroupPage_Objects from  "../../support/page_objects/group_objects";


describe('audience targeting group', () => {
  before(function(){
      cy.fixture('audience_targeting_group_details').then(function(data){
          globalThis.data = data; 
      })  
      
    });
    beforeEach(() => {
       // cy.visit("/")
       Cypress.on('uncaught:exception', (err, runnable) => {
        // Ignore network errors or specific messages
        if (err.message.includes('Network Error')) {
          return false  // Prevents Cypress from failing the test
        }
        return true  // Fails the test if another error occurs
      })
      
        cy.loginToVoto();
        cy.switchOrg(data.audienceTargetingOrg)

        
      });
      // declaring a constant to hold the group class that contains objects.
      const group = new GroupPage_Objects();
      it('should expand group via criteria', () => {
        const currentDate = new Date();
        const Configs = {
            timestamp: currentDate.getTime()
           }
        // creating group  using the imported group objects
        group.visitGroupPage();
        group.createGroupWithSubscriber(data.name +' created @ ' + Configs.timestamp, data.describe +' created @ ' + Configs.timestamp);
       // group.editGroup();
        group.expandGroup();
        group.cleanup(); 
        cy.switchOrg(data.defaultOrg);
        cy.logoutOfVoto();

    });


    });