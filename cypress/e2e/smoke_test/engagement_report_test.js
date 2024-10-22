import EngagementReport_Objects from "../../support/page_objects/viamo_apps/advanced_reports/engagement_report/engagement_report_objects";

///<reference types="cypress" />

describe("Engagement Report", () => {
  before(function () {
    cy.fixture("engagement_report_details").then(function (data) {
      globalThis.data = data;
    });
  });

  beforeEach(() => {
    cy.loginToVoto();
  });

  afterEach(() => {
    cy.navigateToEngagementReportsPage();
    engagementReport.deleteCreatedReport();
    cy.logoutOfVoto();
  });


  const engagementReport = new EngagementReport_Objects();

  it("should create engagement report and configure it with a tree results", () => {
    cy.navigateToEngagementReportsPage();
    engagementReport.clickNewReportBtn();
    engagementReport.validatePageTitleIsReport();
    engagementReport.enterReportName(
      data.engagement_report_name + " " + engagementReport.getCreationTimestamp()
    );
    engagementReport.openReportConfig();
    engagementReport.addFilters(data.tree_name);
    engagementReport.addTreeResults();
    engagementReport.saveReportConfig();
    engagementReport.closeReportConfig();
    engagementReport.runReport();
  });

  it("should create a live link and export engagement report", () => {
    cy.navigateToEngagementReportsPage();
    engagementReport.clickNewReportBtn();
    engagementReport.validatePageTitleIsReport();
    engagementReport.enterReportName(
      data.engagement_report_name + " " + engagementReport.getCreationTimestamp()
    );
    engagementReport.openReportConfig();
    engagementReport.addFilters(data.tree_name);
    engagementReport.addTreeResults();
    engagementReport.saveReportConfig();
    engagementReport.closeReportConfig();
    engagementReport.runReport();
    engagementReport.openLiveLinkConfig();
    engagementReport.enterLiveLinkNameAndSave(
      data.live_link_name + " " + engagementReport.getCreationTimestamp()
    );
    engagementReport.exportsReportCSV();
    engagementReport.openExportedReportCSV();
  });

  
});
