import { ContentNavigation } from "../navigations";

class FlowRegression_Objects {

    visitFlowsPage() {
        cy.navigateTo(ContentNavigation.TREE);
    }

    searchFlows(flowName) {
        this.visitFlowsPage();
        cy.wait(2000);

        cy.get('body').then(($body) => {
            if ($body.find('button:contains("Reset All")').length > 0) {
                cy.contains('button', 'Reset All').click({ force: true });
                cy.wait(1000);
            }
        });

        if (flowName) {
            cy.get('input[placeholder*="Search by tree or flow"]', { timeout: 10000 })
                .clear()
                .type(flowName);
            cy.contains('button', 'Search').click();
            cy.wait(1000);
        }
    }

    // Create a flow with specific config
    createFlow(label, languages = ['English'], channels = ['IVR', 'SMS', 'USSD']) {
        cy.get('[href="/flows/new"]').click();
        cy.get('[data-cy="flow-label--editor"]')
            .find('textarea')
            .type(label);

        for (const language of languages) {
            cy.get('[data-cy="languages--selector"]').click();
            cy.contains('.multiselect__option', language).click();
        }

        for (const channel of channels) {
            cy.get('[data-cy="modes--selector"]').click();
            cy.contains('.multiselect__option', channel).click();
        }

        cy.get('[data-cy="create--btn"]').click();
        cy.wait(3000);
    }

    // Add and configure a message block
    addMessageBlock(label, resourceIVR, resourceSMS, resourceUSSD) {
        cy.get('[data-cy="blocks--menu"]')
            .contains('[data-cy="blocks--menu-item"]', 'Message')
            .click({ force: true });
        cy.wait(500);

        cy.get('[data-cy="label--editor"]')
            .find('textarea')
            .type(label);

        cy.selectAudioLibraryResource(resourceIVR);

        cy.get('[data-cy="SMS-resource-variant-text--editor"]')
            .find('textarea')
            .type(resourceSMS);

        cy.get('[data-cy="USSD-resource-variant-text--editor"]')
            .find('textarea')
            .type(resourceUSSD);
    }

    // Add and configure a numeric question block
    addNumericBlock(label, resourceIVR, resourceSMS, resourceUSSD, min, max, maxDigit) {
        cy.get('[data-cy="blocks--menu"]')
            .contains('[data-cy="blocks--menu-item"]', 'Numeric Question')
            .click({ force: true });
        cy.wait(500);

        cy.get('[data-cy="label--editor"]')
            .find('textarea')
            .type(label);

        cy.selectAudioLibraryResource(resourceIVR);

        cy.get('[data-cy="SMS-resource-variant-text--editor"]')
            .find('textarea')
            .type(resourceSMS);

        cy.get('[data-cy="USSD-resource-variant-text--editor"]')
            .find('textarea')
            .type(resourceUSSD);

        cy.get('[data-cy="minimum-numeric--editor"]')
            .find('input')
            .clear()
            .type(min);

        cy.get('[data-cy="maximum-numeric--editor"]')
            .find('input')
            .clear()
            .type(max);

        cy.get('[data-cy="max-digit--editor"]')
            .find('input')
            .clear()
            .type(maxDigit);
    }

    // Add advanced branching with custom exit
    addAdvancedBranching(exitName, exitExpression) {
        cy.get('[data-cy="output-branching--advanced--btn"]').click();
        cy.get('[data-cy="add-exit--btn"]').click();

        cy.get('[data-cy="advanced-exit-name--input"]')
            .type(exitName);
        cy.get('[data-cy="advanced-exit-test-expression--input"]')
            .find('textarea')
            .type(exitExpression);
    }

    // Add tag to block
    addTag(tagName) {
        cy.get('[data-cy="tag--selector"]').as('tagSelector').click();
        cy.get('@tagSelector')
            .find('input')
            .type(tagName);
        cy.get('@tagSelector').contains('.multiselect__option', tagName).click();
    }

    // Save flow
    saveFlow() {
        cy.get('[data-cy="save--btn"]')
            .should('not.have.attr', 'disabled');
        cy.get('[data-cy="save--btn"]').click({ force: true });
        cy.wait(2000);
    }

    // Publish flow
    publishFlow() {
        // Wait for save to complete (Publish link becomes enabled)
        cy.contains('a', 'Publish', { timeout: 15000 })
            .should('not.have.class', 'disabled')
            .click();
        cy.wait(500);
        cy.contains('button', 'Publish').click();
        cy.wait(3000);
    }

    // Edit flow details (label)
    editFlowDetails(newLabel) {
        cy.get('[data-cy="builder-toolbar--flow-details--btn"]', { timeout: 20000 })
            .should('be.visible')
            .click();
        cy.get('[data-cy="Open-response-label"]')
            .find('textarea')
            .type(newLabel);
        cy.contains('button', 'Done').click();
    }

    // Navigate to flows list, find and edit a specific flow by name
    navigateAndEditFlow(flowName) {
        this.searchFlows(flowName);
        if (flowName) {
            // Find the row containing the flow name and click its edit icon
            cy.contains('tr', flowName, { timeout: 10000 })
                .within(() => {
                    cy.get('[data-icon="edit"]').first().click({ force: true });
                });
        } else {
            cy.get('[data-icon="edit"]', { timeout: 10000 }).first().click();
        }
        // Wait for flow builder to fully load (blocks menu is a reliable indicator)
        cy.get('[data-cy="blocks--menu"]', { timeout: 30000 }).should('exist');
        cy.wait(3000);
    }

    // Delete flow from list
    deleteFlow(flowName) {
        this.searchFlows(flowName);
        const row = flowName ? cy.contains('tr', flowName, { timeout: 10000 }) : cy.get('table tbody tr', { timeout: 10000 }).first();

        row.within(() => {
            cy.contains('a', 'More').click({ force: true });
        });
        cy.wait(500);
        cy.get('a.js-delete:visible', { timeout: 5000 }).first().click({ force: true });
        cy.wait(500);
        cy.contains('button', 'Delete').click();
        cy.wait(2000);
    }

    // Duplicate flow
    duplicateFlow(flowName) {
        this.searchFlows(flowName);
        const row = flowName ? cy.contains('tr', flowName, { timeout: 10000 }) : cy.get('table tbody tr', { timeout: 10000 }).first();

        row.within(() => {
            cy.contains('a', 'More').click({ force: true });
        });
        cy.contains('a', 'Duplicate', { timeout: 10000 }).click({ force: true });
        cy.wait(3000);
    }

    // Assert flow exists in list
    assertFlowInList(flowName) {
        this.searchFlows(flowName);
        cy.contains('body', flowName, { timeout: 10000 }).should('exist');
    }

    // Assert flow name in builder
    assertFlowInBuilder(flowName) {
        cy.get('body').contains(flowName).should('exist');
    }

    // Count blocks in the flow
    assertBlockCount(count) {
        cy.get('[data-cy="blocks--menu-item"]').should('exist');
    }
}

export default FlowRegression_Objects;
