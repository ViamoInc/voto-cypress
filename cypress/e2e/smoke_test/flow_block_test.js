import FlowBlock_Objects from  "../../support/page_objects/flow_block_objects";

///<reference types="cypress" />


describe('mutate flow state for CONTENT blocks', () => {
    let messageData, numericData, openendedData;
    before(() => {
        cy.loginToVoto();
        cy.createFlow({
        label: 'flow block test',
      })
// Initialize data using fixture loading
cy.fixture('flow_message_block_details').then(data => { messageData = data; });
cy.fixture('flow_numeric_block_details').then(data => { numericData = data; });
cy.fixture('flow_openendedq_block_details').then(data => { openendedData = data; });
   });
   const flow = new FlowBlock_Objects()

    it('Should add & configure Message Block', (messageData) => {
        cy.addBlock(['Message'])
        flow.addMessageConfig(messageData.label, messageData.afterEditPostFix, messageData.resourceIVR,messageData.resourceSMS, messageData.resourceUSSD);
        flow.advancedMessageConfig(messageData.exits_name, messageData.exit_expression, messageData.tag_name);
    });

    it('Should add & configure Numeric Block', (numericData) => {
        cy.addBlock(['Numeric Question'])
        flow.addNumericConfig(numericData.beforeEdit, numericData.afterEditPostFix, numericData.resourceIVR, numericData.resourceSMS, numericData.resourceUSSD)
        flow.advancedNumericConfig(numericData.minimum, numericData.maximum, numericData.maxiDigit)
    })

})