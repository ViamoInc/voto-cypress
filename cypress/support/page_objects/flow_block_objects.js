import { ContentNavigation } from "../navigations";

class FlowBlock_Objects{

    addMessageConfig(label,afterEditPostFix,resourceIVR,resourceSMS,resourceUSSD){
        //enter block label
        cy.get('[data-cy="label--editor"]')
        .find('textarea')
        .type(label)

        //Edit block label 
        cy.get('[data-cy="name-editor--edit-btn"]').click()
        cy.get('[data-cy="name-editor--input"]')
          .find('textarea')
          .clear()
          .type(afterEditPostFix)
        cy.get('[data-cy="name-editor--save-btn"]').click()
            // ####### Resource UIs
    cy.selectAudioLibraryResource(resourceIVR)

    cy.get('[data-cy="SMS-resource-variant-text--editor"]')
      .find('textarea')
      .type(resourceSMS)

    cy.get('[data-cy="USSD-resource-variant-text--editor"]')
      .find('textarea')
      .type(resourceUSSD)
    }
      // Advanced branching 

    advancedMessageConfig(exits_name,exit_expression,tag_name){
    cy.get('[data-cy="output-branching--advanced--btn"]').click()
    cy.get('[data-cy="add-exit--btn"]').click()

    cy.get('[data-cy="advanced-exit-name--input"]')
      .type(exits_name)
    cy.get('[data-cy="advanced-exit-test-expression--input"]')
      .find('textarea')
      .type(exit_expression)


      // Tags 

      cy.get('[data-cy="tag--selector"]').as('tagSelector').click()
      cy.get('@tagSelector')
        .find('input')
        .type(tag_name)
      cy.get('@tagSelector').contains('.multiselect__option', tag_name).click()

    }


    // >>>>>>>>>>>> Adding Numeric block configuration

    addNumericConfig(beforeEdit,afterEditPostFix,resourceIVR,resourceSMS,resourceUSSD){
        
        //cy.get('p.block-type').contains('Numeric Question').click();
        cy.get('[data-cy="label--editor"]')
        .find('textarea')
        .type(beforeEdit)

        cy.get('[data-cy="name-editor--edit-btn"]').click()
        cy.get('[data-cy="name-editor--input"]')
        .find('textarea')
        .clear()
          .type(afterEditPostFix)
        cy.get('[data-cy="name-editor--save-btn"]').click()

        // #### Resource UIs 

        cy.selectAudioLibraryResource(resourceIVR)
      
        cy.get('[data-cy="SMS-resource-variant-text--editor"]')
          .find('textarea')
          .type(resourceSMS)
      
        cy.get('[data-cy="USSD-resource-variant-text--editor"]')
          .find('textarea')
          .type(resourceUSSD)
        
    }
    advancedNumericConfig(minimum,maximum,maxiDigit){
           // ######## Num values
           cy.get('[data-cy="minimum-numeric--editor"]')
           .find('input')
           .clear()
           .type(minimum)
     
         cy.get('[data-cy="maximum-numeric--editor"]')
           .find('input')
           .clear()
           .type(maximum)
     
         cy.get('[data-cy="max-digit--editor"]')
           .find('input')
           .clear()
           .type(maxiDigit)

    }

    addResponseBlockConfig(beforeEdit,afterEditPostFix,resourceIVR,resourceSMS,resourceUSSD){

        cy.get('[data-cy="label--editor"]')
        .find('textarea')
        .type(beforeEdit)
  
        cy.get('[data-cy="name-editor--edit-btn"]').click()
        cy.get('[data-cy="name-editor--input"]')
        .find('textarea')
        .clear()
          .type(afterEditPostFix)
        cy.get('[data-cy="name-editor--save-btn"]').click()
              // ####### Resource UIs
  cy.selectAudioLibraryResource(resourceIVR)

  cy.get('[data-cy="SMS-resource-variant-text--editor"]')
    .find('textarea')
    .type(resourceSMS)

  cy.get('[data-cy="USSD-resource-variant-text--editor"]')
    .find('textarea')
    .type(resourceUSSD)
    }

    advancedResponseBlockConfig(maxDuration,endRecordingKey){

        cy.get('[data-cy="max-duration--input"]')
        .find('input')
        .clear()
        .type(maxDuration)  
      cy.get('[data-cy="end-recording-digit--selector"]').as('digitSelector').click()
        .type(endRecordingKey)
      cy.get('@digitSelector').contains('.multiselect__option', endRecordingKey).click()
    }

    editFlowCreate(){
        cy.EditFlow_tree()
    }

    flowAssertion(flowName = 'Cypress flow block test'){
      cy.get('body').contains(flowName).should('exist');
    }

    flowDetails(){
      cy.get('[data-cy="builder-toolbar--flow-details--btn"]', { timeout: 20000 }).should('be.visible').click()
      cy.get('[data-cy="flow-label--editor"]', { timeout: 10000 })
      .find('textarea')
      .clear()
      .type('Cypress flow block test edited')
      cy.contains('button', 'Done').click()

    }

    deleteFlowByName(flowName) {
      cy.navigateTo(ContentNavigation.TREE)
      cy.get('input[placeholder*="Search by tree or flow"]', { timeout: 10000 })
        .clear()
        .type(flowName)
      cy.contains('button', 'Search').click()
      cy.contains('a', flowName, { timeout: 15000 })
        .parents('tr')
        .first()
        .within(() => {
          cy.contains('a', 'More').click({ force: true })
        })
      cy.get('a.js-delete', { timeout: 5000 }).first().click({ force: true })
      cy.contains('button', 'Delete').click()
      cy.contains(flowName).should('not.exist')
    }

}

export default FlowBlock_Objects;
