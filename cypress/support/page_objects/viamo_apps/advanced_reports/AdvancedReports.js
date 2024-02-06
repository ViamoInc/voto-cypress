class AdvancedReports {
  visitInteractionReportPage() {
    cy.get(":nth-child(4) > .via-button > .tw-flex").click();
    cy.get(".tw-pb-0 > .via-link").click();
    this.validatePageTitleIsReport();
  }

  visitContactReportPage(){
    cy.get('[data-icon="cubes"]').click()
    cy.contains('a','Contact Reports').click()
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
      cy.wait(1000);
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
    cy.wait(5000)
  }

  openLiveLinkConfig() {
    cy.get(".dropdown-toggle").click();
    cy.get(".dropdown-menu > :nth-child(3)").click();
  }

  enterLiveLinkNameAndSave(name, permissions = "Anyone") {
    cy.get(".row > :nth-child(1) > .form-control").click();
    cy.get(".row > :nth-child(1) > .form-control").type(name);
    cy.get(":nth-child(3) > .flight-monitor > div > .btn").click();
    // TODO: Validate the shareable link notification shows
    // cy.get('.alert').should('have.text', "Shareable link created succesfully"); // validates the link is created
    cy.get(".via-sidebar__header > .close > span").click(); // close the config sidebar using the 'X' icon
    // TODO:: Add permission for specific people
  }

  exportsReportCSV() {
    cy.get(".dropdown-toggle").click();
    cy.get(".dropdown-menu > :nth-child(2)").click();
    cy.get(":nth-child(1) > .alert-link").should(
      "have.text",
      "View exports\n    "
    );
  }

  openExportedReportCSV() {
    cy.get(".alert-link").click();
    //   TODO:: Validate exported reports data created and available for download
  }

  //   TODO:: validate reports data is loaded

  getCreationTimestamp() {
    // TODO: Make the return timestamp in format: YYYY:MM:DD HH:MM:SS
    return new Date().getTime();
  }

  deleteCreatedReport(){
    cy.wait(500);
    cy.get('[class="fa fa-trash"]').first().click();
    cy.contains('button','Delete report').click();
    cy.wait(2500);

  }
}

export default AdvancedReports;
