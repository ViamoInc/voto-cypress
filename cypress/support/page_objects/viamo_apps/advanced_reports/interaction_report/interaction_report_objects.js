import AdvancedReports from "../AdvancedReports";

class InteractionReport_Objects extends AdvancedReports {
  addFilters(nameTree, columnType = "Tree Results") {
    // opens the 'Add filter' modal
    cy.get(".content > .text-right > :nth-child(2)").click();

    if (columnType == "Tree Results") {
      cy.contains("a", columnType).click();
      cy.get(".multiselect__tags").click();
      cy.get(".multiselect__tags").type(`${nameTree} {enter}`);
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
