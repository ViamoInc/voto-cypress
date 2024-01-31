class AdvancedReports {

    constructor(reportName) {
        this.reportName = reportName;
    }

    // TODO:: Add assertions 
    // 01. We are on the page 
    //     page browser titles
    //     page titles e.g. Reports

    visitInteractionReportPage(){
        cy.get(':nth-child(4) > .via-button > .tw-flex').click()
        cy.get('.tw-pb-0 > .via-link').click()
        this.validatePageTitleIsReport()
    }

    validatePageTitleIsReport(){
        cy.get('.text-uppercase').should('have.text', 'Reports') // It's in caps on the UI: CSS conversion
    }

    clickNewReportBtn(btn = "button", btnName = "New Report"){
        cy.contains(btn, btnName).click()
    }

    enterReportName(name, saveName=true){
        cy.contains('button','Untitled report').click()
        cy.get('input').type(name).should('have.value', name)

        if(saveName){
            cy.contains('button','Save').click()
        }else{
            cy.contains('button','Cancel').click()
        }
    }

    openReportConfig(saveConfig=true){
        
        if(saveConfig){
            cy.contains('button','Save').click()
        }else{
            cy.contains('button','Cancel').click()
        }
    }
}

export default AdvancedReports