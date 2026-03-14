import CampaignRegression_Objects from "../../support/page_objects/campaign_regression_objects";

///<reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
});

describe('Campaign Regression - Listing Pages', () => {
    const campaign = new CampaignRegression_Objects();

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Should load the active outbound campaigns page', () => {
        campaign.visitOutboundCampaignsPage();
        campaign.assertCampaignListingLoads();
        cy.logoutOfVoto();
    });

    it('Should load the past campaigns page', () => {
        campaign.visitPastCampaigns();
        cy.url().should('include', '/outgoing/past');
        cy.logoutOfVoto();
    });

    it('Should load the scheduled campaigns page', () => {
        campaign.visitScheduledCampaigns();
        cy.url().should('include', '/outgoing/scheduled');
        cy.logoutOfVoto();
    });

    it('Should load the inbound campaigns page', () => {
        // Navigate via the nav menu instead of direct URL
        cy.get('[data-test="nav-main-menu-item--campaigns"]').click();
        cy.get('[data-test="nav-menu-item--incoming--view-all"]').click();
        cy.wait(3000);
        cy.get('body').should('not.be.empty');
        cy.logoutOfVoto();
    });
});

describe('Campaign Regression - Create SMS Message & Campaign', () => {
    let data;
    const campaign = new CampaignRegression_Objects();
    const timestamp = Date.now();

    before(() => {
        cy.fixture('campaign_regression_details').then((d) => {
            data = d;
        });
    });

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Should create an SMS-only message', () => {
        campaign.visitMessagePage();
        campaign.createMessage(data.message_name + timestamp);
        campaign.configureSms(data.sms_content + ' ' + timestamp);
        campaign.saveAndPublishMessage();
        cy.logoutOfVoto();
    });

    it('Should verify the message was created', () => {
        campaign.visitMessagePage();
        cy.wait(2000);
        cy.contains('body', data.message_name + timestamp).should('exist');
        cy.logoutOfVoto();
    });

    it.skip('Should create outbound campaign with the message (MANUAL — sends real SMS)', () => {
        // This test creates and sends a real outbound campaign.
        // Skipped by default to avoid consuming credits.
        // Un-skip for manual regression testing.
        campaign.configureOutboundSMSCampaign(
            data.message_name + timestamp,
            data.outbound_contact
        );
        campaign.saveCampaign();
        campaign.confirmAndSendCampaign();
        campaign.assertCampaignCreated();
        cy.logoutOfVoto();
    });

    it('Should navigate to past campaigns and verify listing loads', () => {
        campaign.visitPastCampaigns();
        cy.wait(2000);
        // Verify past campaigns page loads with content
        cy.url().should('include', '/outgoing/past');
        cy.get('body').should('not.be.empty');
        cy.logoutOfVoto();
    });

    it('Clean up - delete the created message', () => {
        campaign.visitMessagePage();
        cy.wait(2000);
        campaign.deleteMessage();
        cy.logoutOfVoto();
    });
});
