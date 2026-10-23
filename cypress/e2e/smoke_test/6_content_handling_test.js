import ContentHandling_Objects from "../../support/page_objects/content_handling_objects";
///<reference types="cypress" />
describe('group', () => {
  let uncaughtExceptionHandler;
    before(function(){
         uncaughtExceptionHandler = (err) => {
            console.error('Uncaught exception:', err);
            return false;
        };

      });
    beforeEach(() => {
       // cy.visit("/")
        cy.loginToVoto(); 
        cy.fixture('content_handling_details').then(function(data){
            globalThis.data = data;
        cy.on('uncaught:exception', uncaughtExceptionHandler);
        })  
        
      });
    
      afterEach(function () {
        // Pass the same function reference used in cy.on
        cy.off('uncaught:exception', uncaughtExceptionHandler);
        cy.clearCookies();
        cy.clearLocalStorage();
    });
      // declaring a constant to hold the content_handling class that contains objects.
      const ctr = new ContentHandling_Objects();
      it('should create CTR message & add configure', () => {
        const currentDate = new Date();
        const Configs = {
            timestamp: currentDate.getTime()
           }
        // creating Message  using the imported ctr message objects
        ctr.visitMessagePage();
        ctr.createMessage(data.name)
       //configure audio
        ctr.configureVoiceEnglish(data.audio_name);
        // configure sms 
        ctr.configureSmsEnglish(data.descriptionEnglish + Configs.timestamp)
      // save CTR
      ctr.saveCtrMessage();
      cy.wait(5000);
      cy.logoutOfVoto();
    });
// Call to record — requires a physical phone to answer and record audio.
    // Cannot be automated end-to-end. Run manually when testing CTR telephony.
    it.skip('Should call subscriber and record (MANUAL — requires physical phone)', () => {
      const currentDate = new Date();
      const Configs = {
          timestamp: currentDate.getTime()
         }
      // creating Message  using the imported ctr message objects
      ctr.visitMessagePage();
      ctr.createMessage(data.name)
      // Place a call to subscriber
      ctr.callSubscriberToRecord()
      ctr.configureSmsEnglish(data.descriptionEnglish + Configs.timestamp)
      ctr.saveCtrMessage();
      //logout
      cy.logoutOfVoto();
  });
    // send CTR message out — requires outbound campaign setup and telephony credits.
    // Skipped in automated runs to avoid unintended calls.
    it.skip('Should configure outbound call with CTR (MANUAL — outbound campaign)', () => {
      cy.SendOutboundMessage(data.name);
  });
    });