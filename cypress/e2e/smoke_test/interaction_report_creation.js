import InteractionReport_Objects from "../../support/page_objects/viamo_apps/advanced_reports/interaction_report/interaction_report_objects";

///<reference types="cypress" />

describe("Interaction Report", () => {
  before(function () {
    cy.fixture("advanced_report_details").then(function (data) {
      globalThis.data = data;
    });
  });
  beforeEach(() => {
    cy.loginToVoto();
  });

  const interactionReport = new InteractionReport_Objects();

  it("should add tree results to an interaction report", () => {
    interactionReport.visitInteractionReportPage();
    interactionReport.clickNewReportBtn();
    interactionReport.validatePageTitleIsReport();
    interactionReport.enterReportName("New Report Data");
    interactionReport.openReportConfig();
    interactionReport.addFilters("Advanced Report Data (for Automated Testing");
    interactionReport.addTreeResults();
    interactionReport.saveReportConfig();
    interactionReport.closeReportConfig();
    interactionReport.runReport();

    cy.logoutOfVoto();
  });
});
