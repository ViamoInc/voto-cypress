class AdvancedReports {
  constructor(reportName) {
    this.reportName = reportName;
  }

  visitInteractionReportPage() {
    cy.get(":nth-child(4) > .via-button > .tw-flex").click();
    cy.get(".tw-pb-0 > .via-link").click();
    this.validatePageTitleIsReport();
  }

  validatePageTitleIsReport() {
    cy.get(".text-uppercase").should("have.text", "Reports"); // It's in caps on the UI: CSS conversion
  }

  clickNewReportBtn(btn = "button", btnName = "New Report") {
    cy.contains(btn, btnName).click();
  }

  enterReportName(name, saveName = true) {
    cy.get(".no-room-below > input").click();
    cy.get(".no-room-below > input").type(name).should("have.value", name);

    if (saveName) {
      cy.get("form > .sm-room-above > .btn-primary").click();
    } else {
      cy.get(".sm-room-above > .btn-secondary").click();
    }
  }

  /**
   * Report Configuration
   */
  openReportConfig() {
    cy.get(".flight-monitor > .btn-primary").click();
  }

  saveReportConfig(saveConfig = true) {
    if (saveConfig) {
      cy.get(".text-right > .btn-primary").click();
    } else {
      cy.get(".btn-link").click();
    }
  }

  closeReportConfig() {
    cy.get(".via-sidebar__header > .close > span").click();
  }

  /**
   * Column Data Selection
   */
  addTreeResults(selectAllBlocks = true, addBlockInteractions = true) {
    if (selectAllBlocks) {
      cy.get(".select-all > :nth-child(1)").click();
      if (addBlockInteractions) {
        cy.get(".modal-footer > .btn-primary").click();
      } else {
        cy.get(".btn-light").click();
      }
    } else {
      cy.get(".select-all > :nth-child(2)").click();
    }
  }

  /**
   * Run/Refresh reports data
   */
  runReport(btn = "button", btnLabel = "Run") {
    cy.contains(btn, btnLabel).click();
  }

  //   TDOD:: validate reports data is loaded
}

export default AdvancedReports;
