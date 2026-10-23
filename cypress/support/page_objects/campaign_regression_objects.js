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
        cy.visit(Cypress.env('baseUrl') + '/incoming/configure');
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
        cy.url().should('include', '/incoming/configure');
        cy.get('body').should('not.be.empty');
    }

    // ─── Inbound Campaign CRUD ───

    visitAddInboundCampaignPage() {
        cy.visit(Cypress.env('baseUrl') + '/incoming/new');
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
        // The message selector is a vue-multiselect component (class: message-set-selector-el)
        // It auto-selects the first message set on mount, so we need to wait for it to load
        cy.get('.message-set-selector-el', { timeout: 15000 }).should('be.visible');
        cy.wait(2000);
        // Click the multiselect to open the dropdown
        cy.get('.message-set-selector-el').click();
        cy.wait(500);
        // Select the matching option
        cy.get('.multiselect__option').contains(messageName).click();
        cy.wait(1000);
    }

    saveInboundCampaign() {
        cy.get('form').find('[type="submit"], button').contains(/save/i).click({ force: true });
        cy.wait(3000);
    }

    assertInboundCampaignInList(name) {
        cy.contains('body', name).should('exist');
    }

    deleteInboundCampaign(name) {
        cy.contains('tr', name, { timeout: 10000 }).within(() => {
            cy.get('button.tw-text-red-500').first().click({ force: true });
        });
        // Confirm deletion in the ViaModal dialog
        cy.get('.modal.show', { timeout: 10000 }).should('be.visible');
        cy.get('#confirm-deleting-inbound-campaign')
            .contains('button', 'Yes')
            .click({ force: true });
        cy.contains('tr', name, { timeout: 10000 }).should('not.exist');
        cy.get('body').then(($body) => {
            if ($body.find('.modal-backdrop.show').length > 0) {
                cy.get('.modal-backdrop.show', { timeout: 10000 }).should('not.exist');
            }
        });
        cy.wait(1000);
    }
}

export default CampaignRegression_Objects;
