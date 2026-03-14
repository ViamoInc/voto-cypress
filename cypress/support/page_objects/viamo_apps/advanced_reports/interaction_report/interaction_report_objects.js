import AdvancedReports from "../AdvancedReports";

class InteractionReport_Objects extends AdvancedReports {
  addFilters(nameTree, columnType = "Tree Results") {
    // opens the 'Add filter' modal
    cy.get(".content > .text-right > :nth-child(2)", { timeout: 15000 })
      .should('be.visible')
      .click();

    if (columnType == "Tree Results") {
      cy.contains("a", columnType).click();
      cy.get(".multiselect__tags").click();
      cy.get(".multiselect__tags").type(nameTree);
      // Wait for dropdown option to appear before selecting
      cy.get('.multiselect__option', { timeout: 15000 })
        .contains(nameTree)
        .click();
      cy.wait(2000);
    }

    if (columnType == "Tag Engagement") {
      cy.contains("a", columnType).click();
    }

    if (columnType == "Tree Results by Tag") {
      cy.contains("a", columnType).click();
    }
  }
}

export default InteractionReport_Objects;
