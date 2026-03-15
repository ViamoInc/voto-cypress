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

    // ─── Add Model Input Block ───
    addModelInputBlock(label) {
        cy.get('[data-cy="blocks--menu"]')
            .contains('[data-cy="blocks--menu-item"]', 'Model Input')
            .click({ force: true });
        cy.wait(1000);

        // Type the block label
        cy.get('[data-block-type="ModelInputBlock"]', { timeout: 10000 })
            .should('be.visible');

        cy.get('[data-cy="label--editor"]')
            .find('textarea')
            .type(label);
    }

    // Select LLM Agent type
    selectLlmAgent(agentValue = 'ASK_ME_ANYTHING_SERVICE') {
        cy.get('#llmAgent').select(agentValue);
        cy.wait(1000);
    }

    // Verify the simulator button appears (only for service-based agents)
    assertSimulatorButtonVisible() {
        cy.get('[data-block-type="ModelInputBlock"]')
            .find('.via-button, button')
            .filter(':visible')
            .contains(/simulate/i)
            .should('exist');
    }

    // Open the simulator modal
    openSimulator() {
        cy.get('[data-block-type="ModelInputBlock"]')
            .find('.via-button, button')
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
            .find('button[type="submit"], .via-button[type="submit"]')
            .contains(/run/i)
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

    // Get the transcript text from the response
    getResponseTranscript() {
        return cy.get('.block-llm-simulator-response')
            .first()
            .find('section')
            .eq(1) // transcript section (after question)
            .find('p');
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
        cy.get('[data-cy="blocks--menu"]')
            .contains('[data-cy="blocks--menu-item"]', 'Model Response')
            .click({ force: true });
        cy.wait(1000);

        cy.get('[data-block-type="ModelResponseBlock"]', { timeout: 10000 })
            .should('be.visible');
    }

    // Select input block in Model Response block
    selectInputBlock(inputBlockLabel) {
        cy.get('[data-block-type="ModelResponseBlock"]')
            .find('select')
            .first()
            .select(inputBlockLabel, { force: true });
        cy.wait(500);
    }

    // Adjust voice speed slider
    assertVoiceSpeedSliderExists() {
        cy.get('[data-block-type="ModelResponseBlock"]')
            .find('[name="llmVoiceSpeed"], input[type="range"]')
            .should('exist');
    }

    // ─── Add Extra Prompt Content ───
    addExtraPromptContent(promptText) {
        // The extra prompt section is collapsible — look for section header and expand
        cy.get('[data-block-type="ModelInputBlock"]').within(() => {
            cy.contains(/extra prompt|additional prompt|system prompt/i).click({ force: true });
            cy.wait(500);
            // Find the textarea for the active channel/language and type
            cy.get('textarea').filter(':visible').first().type(promptText);
        });
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

    // ─── Add Evaluation ───
    addEvaluation(name, datatype, description) {
        cy.get('[data-block-type="ModelInputBlock"]').within(() => {
            // Click "Add Evaluation" button
            cy.contains('button', /add.*eval/i).click({ force: true });
            cy.wait(500);
        });
        // Fill eval fields — they appear at the end of the evals list
        cy.get('[data-block-type="ModelInputBlock"]')
            .find('input[placeholder*="name" i], input[name*="eval" i]')
            .last()
            .type(name);

        cy.get('[data-block-type="ModelInputBlock"]')
            .find('select')
            .last()
            .select(datatype, { force: true });

        cy.get('[data-block-type="ModelInputBlock"]')
            .find('textarea')
            .last()
            .type(description);
    }
}

export default ModelBlock_Objects;
