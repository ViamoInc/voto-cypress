import { ContentNavigation, CampaignNavigation } from "../navigations";

class CampaignRegression_Objects {

    // Campaign listing views — use direct URL navigation
    // since the nav menu selectors are unreliable for listing pages
    visitOutboundCampaignsPage() {
        cy.visit(Cypress.env('baseUrl') + '/outgoing');
        cy.wait(3000);
    }

    visitPastCampaigns() {
        cy.visit(Cypress.env('baseUrl') + '/outgoing/past');
        cy.wait(3000);
    }

    visitScheduledCampaigns() {
        cy.visit(Cypress.env('baseUrl') + '/outgoing/scheduled');
        cy.wait(3000);
    }

    visitInboundCampaignsPage() {
        cy.visit(Cypress.env('baseUrl') + '/incoming');
        cy.wait(3000);
    }

    visitCreateOutboundPage() {
        // Use the nav action selector that works (confirmed in SendOutboundMessage command)
        cy.get('[data-test="nav-main-menu-item--campaigns"]').click();
        cy.get('[data-test="nav-menu-item-action--outgoing--create-new"]').click();
        cy.wait(3000);
    }

    // Assert campaign listing loads
    assertCampaignListingLoads() {
        cy.url().should('include', '/outgoing');
        cy.get('body').should('not.be.empty');
    }

    // Create a message for campaigns
    visitMessagePage() {
        cy.navigateTo(ContentNavigation.MESSAGE);
    }

    createMessage(name) {
        cy.contains('a', 'New Message').click();
        cy.wait(5000);
        cy.get('#message-title-input').should('be.visible').type(name);
        cy.contains('label', 'SMS').click();
    }

    configureSms(smsContent) {
        cy.wait(3000);
        cy.get('[aria-label="sms content for English"]').eq(0).type(smsContent);
    }

    saveAndPublishMessage() {
        cy.contains('span', 'Save & Publish').click();
        cy.wait(3000);
    }

    deleteMessage() {
        cy.contains('a', 'More').first().click();
        cy.get('[data-target="#confirm-delete-message-set"]').first().click({ force: true });
        cy.get('#confirm-delete-message-set_submit').should('be.visible').click();
        cy.wait(2000);
    }

    // View campaign details
    viewFirstCampaignDetails() {
        cy.get('table tbody tr').first().click();
        cy.wait(3000);
    }

    // Assert campaign detail page loads
    assertCampaignDetailLoads() {
        cy.url().should('match', /\/outgoing\/\d+/);
    }

    // Inbound page assertions
    assertInboundPageLoads() {
        cy.url().should('include', '/incoming');
        cy.get('body').should('not.be.empty');
    }

    // ─── Inbound Campaign CRUD ───

    visitAddInboundCampaignPage() {
        cy.navigateTo(CampaignNavigation.ADD_INBOUND_CAMPAIGN);
        cy.wait(3000);
    }

    fillCampaignTitle(name) {
        cy.get('input[name="title"]').should('be.visible').type(name);
    }

    selectCallHandlingAccept() {
        cy.get('input[name="call_handling"][value="accept_call"]').check({ force: true });
    }

    selectContentTypeMessage() {
        cy.get('input[name="content_type"][value="message"]').check({ force: true });
        cy.wait(1000);
    }

    selectMessageContent(messageName) {
        // The content-selection Vue component renders a searchable dropdown
        cy.get('[placeholder*="earch"]').first().type(messageName);
        cy.wait(1000);
        cy.contains('.via-dropdown-item, li', messageName).first().click();
    }

    saveInboundCampaign() {
        cy.get('form').find('[type="submit"], button').contains(/save/i).click({ force: true });
        cy.wait(3000);
    }

    assertInboundCampaignInList(name) {
        cy.contains('body', name).should('exist');
    }

    deleteInboundCampaign() {
        cy.contains('a', 'More').first().click();
        cy.get('[data-target*="delete"], .js-delete').first().click({ force: true });
        cy.get('[id*="delete"] [type="submit"], #confirm-delete-incoming_submit').should('be.visible').click();
        cy.wait(2000);
    }
}

export default CampaignRegression_Objects;
