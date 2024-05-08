import FlowBlock_Objects from  "../../support/page_objects/flow_block_objects";

///<reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
    // Returning false here prevents Cypress from failing the test
    return false;
  });
  
describe('Testing Flow', () => {
    let message, numeric,openended;
    
    before(() => {
        cy.loginToVoto();
        cy.createFlow({
        label: 'Cypress flow block test',
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
        cy.save();
    });

    it('Should add & configure Numeric Block', () => {
        cy.addBlock(['Numeric Question'])
        flow.addNumericConfig(numeric.beforeEdit, numeric.afterEditPostFix, numeric.resourceIVR, numeric.resourceSMS, numeric.resourceUSSD)
        flow.advancedNumericConfig(numeric.minimum, numeric.maximum, numeric.maxiDigit)
        cy.save();
    });

    it('Should add & configure Open-Ended Question', () => {
        cy.addBlock(['Open-Ended Question'])
        flow.addResponseBlockConfig(openended.beforeEdit,openended.afterEditPostFix,openended.resourceIVR,openended.resourceSMS, openended.resourceUSSD)
        flow.advancedResponseBlockConfig(openended.maxDuration, openended.endRecordingKey)
        cy.wait(150);
        cy.save();
        cy.wait(150);
        cy.PublishFlow();
        flow.flowAssertion();
    });

 /*  it('Should publish & Assert', () => {
        cy.PublishFlow();
        flow.flowAssertion();
        cy.wait(100);
    });*/

    it('Should edit created Flow ', () =>{
        cy.EditFlow_tree();
        flow.flowDetails();
        cy.save();
        cy.wait(150);
        cy.PublishFlow();
        

    });

    it('Clean up test',()=>{
        cy.DeleteFlow();
    });

})