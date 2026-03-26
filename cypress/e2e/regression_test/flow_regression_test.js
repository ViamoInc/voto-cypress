import FlowRegression_Objects from "../../support/page_objects/flow_regression_objects";

///<reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
});

describe('Flow Regression - Multi-Block Flow Creation', () => {
    let data;
    let flowLabel;
    let editedFlowLabel;
    const flow = new FlowRegression_Objects();
    const timestamp = Date.now();

    before(() => {
        cy.fixture('flow_regression_details').then((d) => {
            data = d;
            flowLabel = `${d.flow_label} ${timestamp}`;
            editedFlowLabel = `${flowLabel} - Updated`;
            cy.loginToVoto();
            cy.navigateTo({
                categoryLinkSelector: "[data-test='nav-main-menu-item--content']",
                linkSelector: "[data-test='nav-menu-item--trees-and-flows']"
            });
            cy.wait(2000);
            flow.createFlow(flowLabel);
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

    it.skip('Should edit the flow details', () => {
        cy.loginToVoto();
        flow.navigateAndEditFlow(flowLabel);
        flow.editFlowDetails(' - Updated');
        flow.saveFlow();
        cy.logoutOfVoto();
    });

    it.skip('Clean up - delete the flow', () => {
        cy.loginToVoto();
        flow.deleteFlow(editedFlowLabel);
        cy.logoutOfVoto();
    });
});

describe('Flow Regression - Duplicate Flow', () => {
    let data;
    let duplicateFlowLabel;
    const flow = new FlowRegression_Objects();
    const timestamp = Date.now();

    before(() => {
        cy.fixture('flow_regression_details').then((d) => {
            data = d;
            duplicateFlowLabel = `${d.duplicate_label} ${timestamp}`;
        });
    });

    it('Should create a flow and publish it', () => {
        cy.loginToVoto();
        flow.visitFlowsPage();
        cy.wait(2000);
        flow.createFlow(duplicateFlowLabel);
        flow.addMessageBlock(
            'Dup Message Block',
            data.resourceIVR,
            data.resourceSMS,
            data.resourceUSSD
        );
        flow.saveFlow();
        flow.publishFlow();
        flow.assertFlowInBuilder(duplicateFlowLabel);
        cy.logoutOfVoto();
    });

    it.skip('Should duplicate the flow', () => {
        cy.loginToVoto();
        flow.duplicateFlow(duplicateFlowLabel);
        cy.wait(3000);
        // Verify duplicate exists in the list
        flow.assertFlowInList(duplicateFlowLabel);
        cy.logoutOfVoto();
    });

    it.skip('Clean up - delete both flows', () => {
        cy.loginToVoto();
        flow.deleteFlow(duplicateFlowLabel);
        flow.deleteFlow(duplicateFlowLabel);
        cy.logoutOfVoto();
    });
});

describe('Flow Regression - SMS-Only Flow', () => {
    let data;
    let smsOnlyFlowLabel;
    const flow = new FlowRegression_Objects();
    const timestamp = Date.now();

    before(() => {
        cy.fixture('flow_regression_details').then((d) => {
            data = d;
            smsOnlyFlowLabel = `Cypress SMS Only Flow ${timestamp}`;
        });
    });

    it('Should create an SMS-only flow with a message block', () => {
        cy.loginToVoto();
        flow.visitFlowsPage();
        cy.wait(2000);
        flow.createFlow(smsOnlyFlowLabel, ['English'], ['SMS']);

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
        flow.assertFlowInBuilder(smsOnlyFlowLabel);
        cy.logoutOfVoto();
    });

    it.skip('Clean up - delete SMS-only flow', () => {
        cy.loginToVoto();
        flow.deleteFlow(smsOnlyFlowLabel);
        cy.logoutOfVoto();
    });
});
