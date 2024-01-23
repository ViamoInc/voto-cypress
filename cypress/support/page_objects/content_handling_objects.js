class ContentHandling_Objects{
    visitMessagePage(){
        cy.get('[data-key="campaign-content"]').click()
        cy.get('[rel="messages"]').click()
    }
    createMessage(name){
        cy.contains('a','New Message').click()
        cy.get('#message-title-input').type(name)
        cy.contains('label', 'Voice').click()
        cy.contains('label', 'SMS').click()
    }
    callSubscriberToRecord(){
        cy.contains('span','Call to Record').click()
        cy.contains('label','pascal').click()
        cy.contains('span','Call This Phone Number').click()
        cy.wait(5000)
        cy.get('[class = "via-helper-text tw-text-neutral-700"]').should('have.text',' Call in progress... '); // Verify initial state
        // Wait for 10 seconds, checking every 500 milliseconds if the text changed
        cy.wait(10000, { delay: 500 }).then(() => {
        cy.get('[class = "via-helper-text tw-text-neutral-700"]').should('not.have.text', ' Call Successful... ') // Assert after text change
        .then(() => {cy.log('Call stuck in progress!');}) 
  });
    }
    configureVoiceEnglish(audio_name){
        cy.get('[data-icon="chevron-down"]').first().click();
        cy.contains('.via-dropdown-link', audio_name).click()
    }
    configureSmsEnglish(descriptionEng){
        cy.get('[aria-label="sms content for English"]').type(descriptionEng)     
    }
    saveCtrMessage(){
        cy.contains('span','Save & Publish').click()
    }
}
export default ContentHandling_Objects;