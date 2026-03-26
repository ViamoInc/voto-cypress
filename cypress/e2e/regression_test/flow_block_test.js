import FlowBlock_Objects from  "../../support/page_objects/flow_block_objects";

///<reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
    // Returning false here prevents Cypress from failing the test
    return false;
  });
  
describe('Testing Flow', () => {
    let message, numeric,openended;
    const timestamp = Date.now()
    const flowLabel = `Cypress flow block test ${timestamp}`
    
    before(() => {
      cy.fixture('flow_message_block_details').then((data)=> { message = data; }) ;
      cy.fixture('flow_numeric_block_details').then(data => { numeric = data; });
      cy.fixture('flow_openendedq_block_details').then(data => { openended = data; });
    });
    const flow = new FlowBlock_Objects()

    it('Should create and configure a flow', () => {
        cy.loginToVoto();
        cy.createFlow({
          label: flowLabel,
        });
        cy.get('[data-cy="blocks--menu"]', { timeout: 30000 }).should('exist');

        cy.addBlock(['Message'])
        flow.addMessageConfig(message.label,message.afterEditPostFix, message.resourceIVR,message.resourceSMS,message.resourceUSSD);
        flow.advancedMessageConfig(message.exits_name, message.exit_expression, message.tag_name);
        cy.save();

        cy.addBlock(['Numeric Question'])
        flow.addNumericConfig(numeric.beforeEdit, numeric.afterEditPostFix, numeric.resourceIVR, numeric.resourceSMS, numeric.resourceUSSD)
        flow.advancedNumericConfig(numeric.minimum, numeric.maximum, numeric.maxiDigit)
        cy.save();

        cy.addBlock(['Open-Ended Question'])
        flow.addResponseBlockConfig(openended.beforeEdit,openended.afterEditPostFix,openended.resourceIVR,openended.resourceSMS, openended.resourceUSSD)
        flow.advancedResponseBlockConfig(openended.maxDuration, openended.endRecordingKey)
        cy.wait(150);
        cy.save();
        cy.wait(150);
        flow.flowAssertion(flowLabel);
    });

})
