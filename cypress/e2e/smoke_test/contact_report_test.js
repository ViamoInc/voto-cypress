import ContactReport_Objects from "../../support/page_objects/viamo_apps/advanced_reports/contact_report/contact_report_objects";

///<reference types="cypress" />

describe("Contact Report", () => {
  before(function () {
    cy.fixture("contact_report_details").then(function (data) {
      globalThis.data = data;
    });
  });
  beforeEach(() => {
    cy.loginToVoto();
  });

  const contactReport = new ContactReport_Objects();

  it("should create contact report and configure it with a tree results", () => {
    contactReport.visitContactReportPage();
    contactReport.clickNewReportBtn();
    contactReport.validatePageTitleIsReport();
    contactReport.enterReportName(
      data.reportName + " " + contactReport.getCreationTimestamp()
    );
    contactReport.openReportConfig();
    contactReport.addFilters(data.treeName);
    contactReport.addTreeResults();
    contactReport.saveReportConfig();
    contactReport.closeReportConfig();
    contactReport.runReport();
    contactReport.visitContactReportPage();
    contactReport.deleteCreatedReport();


    cy.logoutOfVoto();
  });

  it("should create a live link and export contact report", () => {
    contactReport.visitContactReportPage();
    contactReport.clickNewReportBtn();
    contactReport.validatePageTitleIsReport();
    contactReport.enterReportName(
      data.reportName + " " + contactReport.getCreationTimestamp()
    );
    contactReport.openReportConfig();
    contactReport.addFilters(data.treeName);
    contactReport.addTreeResults();
    contactReport.saveReportConfig();
    contactReport.closeReportConfig();
    contactReport.runReport();
    contactReport.openLiveLinkConfig();
    contactReport.enterLiveLinkNameAndSave(
      data.liveLinkName + " " + contactReport.getCreationTimestamp()
    );
    contactReport.exportsReportCSV();
    contactReport.openExportedReportCSV();
    contactReport.visitContactReportPage();
    contactReport.deleteCreatedReport();

    cy.logoutOfVoto();
  });
});
