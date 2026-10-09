import CampaignRegression_Objects from "../../support/page_objects/campaign_regression_objects";

///<reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
});

describe('Inbound Campaign Regression - Listing', () => {
    const campaign = new CampaignRegression_Objects();

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Should load the inbound campaigns listing page', () => {
        campaign.visitInboundCampaignsPage();
        campaign.assertInboundPageLoads();
        cy.logoutOfVoto();
    });
});

describe('Inbound Campaign Regression - CRUD', () => {
    let data;
    const campaign = new CampaignRegression_Objects();
    const timestamp = Date.now();

    before(() => {
        cy.fixture('inbound_campaign_details').then((d) => {
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

    it('Should create a new inbound campaign with a message', () => {
        campaign.visitAddInboundCampaignPage();
        campaign.fillCampaignTitle(data.campaign_name + ' ' + timestamp);
        campaign.selectCallHandlingAccept();
        campaign.selectContentTypeMessage();
        campaign.selectMessageContent(data.message_name);
        campaign.saveInboundCampaign();
        cy.logoutOfVoto();
    });

    it('Should verify the inbound campaign appears in the listing', () => {
        campaign.visitInboundCampaignsPage();
        campaign.assertInboundCampaignInList(data.campaign_name + ' ' + timestamp);
        cy.logoutOfVoto();
    });

    // after(), not an it: the skipped cleanup left one campaign per run in the
    // QA org. Tolerates the campaign never having been created.
    after(() => {
        const name = data.campaign_name + ' ' + timestamp;
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.loginToVoto();
        campaign.visitInboundCampaignsPage();
        cy.get('body').then(($body) => {
            if ($body.find(`tr:contains("${name}")`).length > 0) {
                campaign.deleteInboundCampaign(name);
            }
        });
        cy.logoutOfVoto();
    });
});
