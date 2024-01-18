import GroupPage_Objects from  "../../support/page_objects/group_objects";


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
        cy.switchOrgToPlatformOrg();
        group.visitGroupPage();
        group.editGroup();
        group.expandGroup();
        group.selectAudienceTargeting();
        group.expandAudienceTargeting();
        group.editGroup();
        group.shrinkGroup();
        group.selectAudienceTargeting();
        cy.logoutOfVoto();

    });


    });