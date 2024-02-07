import InteractionReport_Objects from "../../support/page_objects/viamo_apps/advanced_reports/interaction_report/interaction_report_objects";

///<reference types="cypress" />

describe("Interaction Report", () => {
  before(function () {
    cy.fixture("interaction_report_details").then(function (data) {
      globalThis.data = data;
    });
  });
  beforeEach(() => {
    cy.loginToVoto();
  });

  afterEach(() => {
    interactionReport.visitInteractionReportPage();
    interactionReport.deleteCreatedReport();
    cy.logoutOfVoto();
  });

  const interactionReport = new InteractionReport_Objects();

  it("should create interaction report and configure it with a tree results", () => {
    interactionReport.visitInteractionReportPage();
    interactionReport.clickNewReportBtn();
    interactionReport.validatePageTitleIsReport();
    interactionReport.enterReportName(
      data.reportName + " " + interactionReport.getCreationTimestamp()
    );
    interactionReport.openReportConfig();
    interactionReport.addFilters(data.treeName);
    interactionReport.addTreeResults();
    interactionReport.saveReportConfig();
    interactionReport.closeReportConfig();
    interactionReport.runReport();
  });

  it("should create a live link and export interaction report", () => {
    interactionReport.visitInteractionReportPage();
    interactionReport.clickNewReportBtn();
    interactionReport.validatePageTitleIsReport();
    interactionReport.enterReportName(
      data.reportName + " " + interactionReport.getCreationTimestamp()
    );
    interactionReport.openReportConfig();
    interactionReport.addFilters(data.treeName);
    interactionReport.addTreeResults();
    interactionReport.saveReportConfig();
    interactionReport.closeReportConfig();
    interactionReport.runReport();
    interactionReport.openLiveLinkConfig();
    interactionReport.enterLiveLinkNameAndSave(
      data.liveLinkName + " " + interactionReport.getCreationTimestamp()
    );
    interactionReport.exportsReportCSV();
    interactionReport.openExportedReportCSV();

  });
});
