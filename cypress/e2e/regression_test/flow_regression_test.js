import FlowRegression_Objects from "../../support/page_objects/flow_regression_objects";

///<reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
});

describe('Flow Regression - Multi-Block Flow Creation', () => {
    let data;
    const flow = new FlowRegression_Objects();

    before(() => {
        cy.fixture('flow_regression_details').then((d) => {
            data = d;
            cy.loginToVoto();
            cy.navigateTo({
                categoryLinkSelector: "[data-test='nav-main-menu-item--content']",
                linkSelector: "[data-test='nav-menu-item--trees-and-flows']"
            });
            cy.wait(2000);
            flow.createFlow(d.flow_label);
        });
    });

    it('Should add a Message block with resources and advanced branching', () => {
        flow.addMessageBlock(
            data.message_block_label,
            data.resourceIVR,
            data.resourceSMS,
            data.resourceUSSD
        );
        flow.addAdvancedBranching(data.exits_name, data.exit_expression);
        flow.addTag(data.tag_name);
        flow.saveFlow();
    });

    it('Should add a Numeric Question block and save', () => {
        flow.addNumericBlock(
            data.numeric_block_label,
            data.resourceIVR,
            data.resourceSMS,
            data.resourceUSSD,
            data.minimum,
            data.maximum,
            data.maxiDigit
        );
        flow.saveFlow();
    });

    it('Should edit the flow details', () => {
        cy.loginToVoto();
        flow.navigateAndEditFlow();
        flow.editFlowDetails(' - Updated');
        flow.saveFlow();
        cy.logoutOfVoto();
    });

    it('Clean up - delete the flow', () => {
        cy.loginToVoto();
        flow.deleteFlow();
        cy.logoutOfVoto();
    });
});

describe('Flow Regression - Duplicate Flow', () => {
    let data;
    const flow = new FlowRegression_Objects();

    before(() => {
        cy.fixture('flow_regression_details').then((d) => {
            data = d;
        });
    });

    it('Should create a flow and publish it', () => {
        cy.loginToVoto();
        flow.visitFlowsPage();
        cy.wait(2000);
        flow.createFlow(data.duplicate_label);
        flow.addMessageBlock(
            'Dup Message Block',
            data.resourceIVR,
            data.resourceSMS,
            data.resourceUSSD
        );
        flow.saveFlow();
        flow.publishFlow();
        flow.assertFlowInBuilder(data.duplicate_label);
        cy.logoutOfVoto();
    });

    it('Should duplicate the flow', () => {
        cy.loginToVoto();
        flow.duplicateFlow();
        cy.wait(3000);
        // Verify duplicate exists in the list
        flow.assertFlowInList(data.duplicate_label);
        cy.logoutOfVoto();
    });

    it('Clean up - delete both flows', () => {
        cy.loginToVoto();
        cy.navigateTo({
            categoryLinkSelector: "[data-test='nav-main-menu-item--content']",
            linkSelector: "[data-test='nav-menu-item--trees-and-flows']"
        });
        cy.wait(2000);
        // Delete first flow/tree using the js-delete class selector
        cy.contains('a', 'More').first().click();
        cy.wait(500);
        cy.get('a.js-delete').first().click({ force: true });
        cy.wait(500);
        cy.contains('button', 'Delete').click();
        cy.wait(3000);
        // Delete second flow/tree
        cy.contains('a', 'More').first().click();
        cy.wait(500);
        cy.get('a.js-delete').first().click({ force: true });
        cy.wait(500);
        cy.contains('button', 'Delete').click();
        cy.wait(2000);
        cy.logoutOfVoto();
    });
});

describe('Flow Regression - SMS-Only Flow', () => {
    let data;
    const flow = new FlowRegression_Objects();

    before(() => {
        cy.fixture('flow_regression_details').then((d) => {
            data = d;
        });
    });

    it('Should create an SMS-only flow with a message block', () => {
        cy.loginToVoto();
        flow.visitFlowsPage();
        cy.wait(2000);
        flow.createFlow('Cypress SMS Only Flow', ['English'], ['SMS']);

        // Add message block (SMS only — no IVR resource needed)
        cy.get('[data-cy="blocks--menu"]')
            .contains('[data-cy="blocks--menu-item"]', 'Message')
            .click({ force: true });
        cy.wait(500);

        cy.get('[data-cy="label--editor"]')
            .find('textarea')
            .type('SMS Message');

        cy.get('[data-cy="SMS-resource-variant-text--editor"]')
            .find('textarea')
            .type('Hello from Cypress SMS test');

        flow.saveFlow();
        flow.publishFlow();
        flow.assertFlowInBuilder('Cypress SMS Only Flow');
        cy.logoutOfVoto();
    });

    it('Clean up - delete SMS-only flow', () => {
        cy.loginToVoto();
        flow.deleteFlow();
        cy.logoutOfVoto();
    });
});
