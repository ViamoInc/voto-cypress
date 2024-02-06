class ContentHandling_Objects{
    visitMessagePage(){
        cy.get('[data-icon="message-dots"]').click()
        cy.contains('a','Messages').click()
    }
    createMessage(name){
        cy.contains('a','New Message').click()
        cy.wait(5000)
        cy.get('#message-title-input').should('be.visible').type(name)
        cy.contains('label', 'Voice').click()
        cy.contains('label', 'SMS').click()
    }
    callSubscriberToRecord(){
        cy.contains('span','Call to Record').click()
        cy.contains('label','Cypress').click()
        cy.contains('span','Call This Phone Number').click()
        cy.wait(5000)
        cy.get('[class = "via-helper-text tw-text-neutral-700"]').should('have.text',' Call in progress... '); // Verify initial state
        // Wait for 10 seconds, checking every 500 milliseconds if the text changed
        cy.wait(10000, { delay: 5000 }).then(() => {
        cy.get('[class = "via-helper-text tw-text-neutral-700"]').should('not.have.text', ' Call Successful... ') // Assert after text change
        .then(() => {cy.log('Call stuck in progress!');}) 
        
        cy.get('[role="alert"]').should('have.text','You have successfully published a new message.')
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
        cy.wait(500)
        cy.contains('a','More').first().click()
        cy.get('[data-target="#confirm-delete-message-set"]').first().click()
        cy.get('#confirm-delete-message-set_submit').should('be.visible').click()

    }
}
export default ContentHandling_Objects;