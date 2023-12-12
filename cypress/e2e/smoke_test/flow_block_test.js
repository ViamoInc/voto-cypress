import FlowBlock_Objects from  "../../support/page_objects/flow_block_objects";

///<reference types="cypress" />


describe('mutate flow state for CONTENT blocks', () => {
    let message, numeric,openended;
    before(() => {
        cy.loginToVoto();
        cy.createFlow({
        label: 'flow block test',
      })
// Initialize data using fixture loading
cy.fixture('flow_message_block_details').then((data)=> { message = data; }) ;
cy.fixture('flow_numeric_block_details').then(data => { numeric = data; });
cy.fixture('flow_openendedq_block_details').then(data => { openended = data; });
   });
   const flow = new FlowBlock_Objects()

    it('Should add & configure Message Block', () => {
        cy.addBlock(['Message'])
        
       flow.addMessageConfig(message.label,message.afterEditPostFix, message.resourceIVR,message.resourceSMS,message.resourceUSSD);
        flow.advancedMessageConfig(message.exits_name, message.exit_expression, message.tag_name);
    });

    it('Should add & configure Numeric Block', () => {
        cy.addBlock(['Numeric Question'])
        flow.addNumericConfig(numeric.beforeEdit, numeric.afterEditPostFix, numeric.resourceIVR, numeric.resourceSMS, numeric.resourceUSSD)
        flow.advancedNumericConfig(numeric.minimum, numeric.maximum, numeric.maxiDigit)
    });

    it('Should add & configure Open-Ended Question', () => {
        cy.addBlock(['Open-Ended Question'])
        flow.addResponseBlockConfig(openended.beforeEdit,openended.afterEditPostFix,openended.resourceIVR,openended.resourceSMS, openended.resourceUSSD)
        flow.advancedResponseBlockConfig(openended.maxDuration, openended.endRecordingKey)
        cy.wait(50);
        cy.save();
    });


})