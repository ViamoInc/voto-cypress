import AdvancedReports from "../AdvancedReports"

class InteractionReport_Objects extends AdvancedReports {

    constructor(reportName){
        super(reportName)
    }

    addFilters(columnType = "Tree Results", nameTree){
        
        if(columnType == "Tree Results"){
            cy.contains('a', columnType).click()
            cy.get('input').type(nameTree).should('have.value', nameTree)
        }

        if(columnType == "Tag Engagement"){
            cy.contains('a', columnType).click()
        }

        if(columnType == "Tree Results by Tag"){
            cy.contains('a', columnType).click()
        }

    }
    
}

export default InteractionReport_Objects