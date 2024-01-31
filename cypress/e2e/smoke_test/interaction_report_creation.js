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

  it("should create a create a new interaction report", () => {
    interactionReport.visitInteractionReportPage();
    interactionReport.clickNewReportBtn();
    interactionReport.validatePageTitleIsReport();
    interactionReport.enterReportName(data.enterReportName);

    cy.logoutOfVoto(); 
  });
});
