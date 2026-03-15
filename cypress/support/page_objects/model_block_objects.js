import { ContentNavigation } from "../navigations";

class ModelBlock_Objects {

    visitFlowsPage() {
        cy.navigateTo(ContentNavigation.TREE);
    }

    // Create a flow with IVR + SMS channels (needed for voice simulator)
    createFlow(label, languages = ['English'], channels = ['IVR', 'SMS']) {
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

    // Helper to add a block by its data-block-type attribute
    // The flow builder has category dropdowns (Content, Contact, Branching, Advanced)
    // Each category is a Bootstrap-style dropdown that opens on mouseover
    addBlockByType(blockType) {
        // First, find the block item (it's in the DOM but hidden inside a dropdown)
        // and get its parent dropdown category
        cy.get(`[data-cy="blocks--menu"] a[data-block-type="${blockType}"]`, { timeout: 10000 })
            .should('exist')
            .parents('.nav-item.dropdown')
            .find('a.nav-link.dropdown-toggle')
            .trigger('mouseover');

        // Now the dropdown is open, click the block
        cy.get(`[data-cy="blocks--menu"] a[data-block-type="${blockType}"]`)
            .should('be.visible')
            .click();
        cy.wait(1000);
    }

    // ─── Add Model Input Block ───
    addModelInputBlock(label) {
        this.addBlockByType('ModelInputBlock');

        // Wait for the block editor sidebar to appear
        cy.get('.tree-sidebar-edit-block[data-block-type="ModelInputBlock"]', { timeout: 10000 })
            .should('be.visible');

        // Type the block label
        cy.get('[data-cy="label--editor"]')
            .find('textarea')
            .type(label);
    }

    // Select LLM Agent type
    selectLlmAgent(agentValue = 'ASK_ME_ANYTHING_SERVICE') {
        cy.get('#llmAgent', { timeout: 10000 }).select(agentValue);
        cy.wait(1000);
    }

    // Verify the simulator button appears (only for service-based agents)
    assertSimulatorButtonVisible() {
        cy.get('.tree-sidebar-edit-block[data-block-type="ModelInputBlock"]')
            .find('button')
            .filter(':visible')
            .contains(/simulate/i)
            .should('exist');
    }

    // Open the simulator modal
    openSimulator() {
        cy.get('.tree-sidebar-edit-block[data-block-type="ModelInputBlock"]')
            .find('button')
            .filter(':visible')
            .contains(/simulate/i)
            .click();
        cy.wait(2000);

        // Verify modal is open
        cy.get('#block-llm-simulator-modal', { timeout: 10000 })
            .should('be.visible');
    }

    // Select language in simulator
    selectSimulatorLanguage(languageName) {
        cy.get('#block-llm-simulator-modal')
            .contains('button', /select a language|english/i)
            .click();
        cy.get('#block-llm-simulator-modal')
            .find('.via-dropdown-item, .dropdown-item')
            .contains(languageName)
            .click();
        cy.wait(500);
    }

    // Select channel in simulator
    selectSimulatorChannel(channelName) {
        cy.get('#block-llm-simulator-modal')
            .contains('button', /select a channel|voice|sms/i)
            .click();
        cy.get('#block-llm-simulator-modal')
            .find('.via-dropdown-item, .dropdown-item')
            .contains(channelName)
            .click();
        cy.wait(500);
    }

    // Uncheck "Generate Audio Response" for faster text-only testing
    uncheckGenerateAudio() {
        cy.get('#block-llm-simulator-modal').then(($modal) => {
            const checkbox = $modal.find('[name="generate-audio-response"]');
            if (checkbox.length > 0 && checkbox.is(':checked')) {
                cy.wrap(checkbox).click({ force: true });
            }
        });
    }

    // Type a question into the simulator
    typeSimulatorQuestion(question) {
        cy.get('#block-llm-simulator-modal')
            .find('textarea')
            .last()
            .clear()
            .type(question);
    }

    // Click the Run button in the simulator
    runSimulator() {
        cy.get('#block-llm-simulator-modal')
            .find('button[type="submit"]')
            .click();
    }

    // Wait for and verify a response appears in the response log
    assertSimulatorResponse(timeout = 120000) {
        cy.get('.block-llm-simulator-response', { timeout })
            .should('exist')
            .and('be.visible');
    }

    // Verify the response has a transcript (text response from LLM)
    assertResponseHasTranscript() {
        cy.get('.block-llm-simulator-response')
            .first()
            .find('p')
            .should('exist')
            .and('not.be.empty');
    }

    // Verify the response has an audio player
    assertResponseHasAudio() {
        cy.get('.block-llm-simulator-response')
            .first()
            .find('audio')
            .should('exist');
    }

    // Verify evaluation results are shown
    assertResponseHasEvaluations() {
        cy.get('.block-llm-simulator-response__code')
            .should('exist')
            .and('not.be.empty');
    }

    // Close simulator modal
    closeSimulator() {
        cy.get('#block-llm-simulator-modal')
            .find('.close, [aria-label="Close"]')
            .first()
            .click({ force: true });
        cy.wait(500);
    }

    // ─── Add Model Response Block ───
    addModelResponseBlock() {
        this.addBlockByType('ModelResponseBlock');

        cy.get('.tree-sidebar-edit-block[data-block-type="ModelResponseBlock"]', { timeout: 10000 })
            .should('be.visible');
    }

    // Verify voice speed slider exists
    assertVoiceSpeedSliderExists() {
        cy.get('.tree-sidebar-edit-block[data-block-type="ModelResponseBlock"]')
            .find('[name="llmVoiceSpeed"], input[type="range"]')
            .should('exist');
    }

    // ─── Save Flow ───
    saveFlow() {
        cy.get('[data-cy="save--btn"]')
            .should('not.have.attr', 'disabled');
        cy.get('[data-cy="save--btn"]').click({ force: true });
        cy.wait(3000);
    }

    // ─── Publish Flow ───
    publishFlow() {
        cy.contains('a', 'Publish', { timeout: 15000 })
            .should('not.have.class', 'disabled')
            .click();
        cy.wait(500);
        cy.contains('button', 'Publish').click();
        cy.wait(3000);
    }

    // ─── Delete Flow ───
    deleteFlow() {
        this.visitFlowsPage();
        cy.wait(2000);
        cy.contains('a', 'More').first().click();
        cy.wait(500);
        cy.get('a.js-delete').first().click({ force: true });
        cy.wait(500);
        cy.contains('button', 'Delete').click();
        cy.wait(2000);
    }
}

export default ModelBlock_Objects;
