import { ContentNavigation } from "../navigations";

class ModelBlock_Objects {

    visitTreesPage() {
        cy.navigateTo(ContentNavigation.TREE);
    }

    // Create a tree (not a flow) — Model blocks are only available in the tree builder
    // languages: array of language names to enable (e.g. ['English', 'French', 'Urdu'])
    createTree(title, languages = []) {
        cy.get('[href="/trees/create"]', { timeout: 10000 }).click();
        cy.wait(2000);

        // Fill in the title
        cy.get('input[name="details[title]"]').type(title);

        // Select languages — check each requested language by its label text
        if (languages.length > 0) {
            // First uncheck all language checkboxes
            cy.get('input.tree-language-toggle-checkbox').each(($cb) => {
                if ($cb.is(':checked')) {
                    cy.wrap($cb).uncheck({ force: true });
                }
            });
            // Then check the requested ones
            languages.forEach((lang) => {
                cy.contains('label', lang)
                    .find('input.tree-language-toggle-checkbox')
                    .check({ force: true });
            });
        }

        // Voice is checked by default; also check SMS
        cy.get('input[name="details[hasSms]"]').check();

        // Submit the form — "Save and Continue"
        cy.contains('button', 'Save').click();
        cy.wait(5000);
    }

    // Open the "Add Block" dropdown in the tree builder toolbar
    openAddBlockDropdown() {
        cy.contains('button', 'Add Block', { timeout: 10000 }).click();
        cy.wait(500);
    }

    // Add a block by clicking its menu item in the tree builder
    addBlockByType(blockType) {
        this.openAddBlockDropdown();
        cy.get(`a.tree-add-block[data-block-type="${blockType}"]`, { timeout: 5000 })
            .click({ force: true });
        cy.wait(2000);
    }

    // ─── Add Model Input Block ───
    addModelInputBlock(label) {
        this.addBlockByType('ModelInputBlock');

        // Click the block on the canvas to open its editor sidebar
        this.clickBlockOnCanvas('ModelInputBlock');

        // Wait for the block editor sidebar to exist
        cy.get('.tree-sidebar-edit-block', { timeout: 10000 })
            .should('exist');

        // Type the block title (BlockTitleInput renders a textarea)
        cy.get('.tree-sidebar-edit-block')
            .find('textarea.form-control')
            .first()
            .clear({ force: true })
            .type(label, { force: true });
    }

    // Select LLM Agent type
    selectLlmAgent(agentValue = 'ASK_ME_ANYTHING_SERVICE') {
        cy.get('#llmAgent', { timeout: 10000 })
            .scrollIntoView()
            .select(agentValue);
        cy.wait(1000);
    }

    // Verify the simulator button appears (only for service-based agents)
    assertSimulatorButtonVisible() {
        cy.get('[data-testid="simulate-button"]', { timeout: 10000 })
            .should('exist');
    }

    // Open the simulator modal
    openSimulator() {
        cy.get('[data-testid="simulate-button"]')
            .scrollIntoView()
            .click({ force: true });
        cy.wait(2000);

        // Verify modal is open
        cy.get('#block-llm-simulator-modal', { timeout: 10000 })
            .should('be.visible');
    }

    // Select language in simulator
    selectSimulatorLanguage(languageName) {
        cy.get('[data-testid="simulator-language"]')
            .find('button')
            .first()
            .scrollIntoView()
            .click({ force: true });
        cy.wait(500);
        // Dropdown items may render outside the modal — search globally
        cy.get('[data-testid="simulator-language-option"]')
            .contains(languageName, { matchCase: false })
            .first()
            .click({ force: true });
        cy.wait(500);
    }

    // Select channel in simulator
    selectSimulatorChannel(channelName) {
        cy.get('[data-testid="simulator-channel"]')
            .find('button')
            .first()
            .scrollIntoView()
            .click({ force: true });
        cy.wait(500);
        cy.get('[data-testid="simulator-channel-option"]')
            .contains(channelName, { matchCase: false })
            .first()
            .click({ force: true });
        cy.wait(500);
    }

    // Uncheck "Generate Audio Response" for faster text-only testing
    uncheckGenerateAudio() {
        cy.get('#block-llm-simulator-modal').then(($modal) => {
            const checkbox = $modal.find('input[name="generate-audio-response"]');
            if (checkbox.length > 0 && checkbox.is(':checked')) {
                cy.wrap(checkbox).click({ force: true });
            }
        });
    }

    // Type a question into the simulator
    typeSimulatorQuestion(question) {
        cy.get('[data-testid="simulator-question"]')
            .find('textarea')
            .clear()
            .type(question);
    }

    // Click the Run button in the simulator
    runSimulator() {
        cy.get('[data-testid="simulator-run"]').click();
    }

    // Wait for and verify a response appears in the response log
    assertSimulatorResponse(timeout = 120000) {
        cy.get('.block-llm-simulator-response', { timeout })
            .should('exist');
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

    // Close simulator modal
    closeSimulator() {
        cy.get('#block-llm-simulator-modal .via-modal-header button.via-button')
            .click({ force: true });
        cy.wait(2000);
    }

    // ─── Add Model Response Block ───
    addModelResponseBlock() {
        this.addBlockByType('ModelResponseBlock');

        // Click the block on the canvas to open its editor sidebar
        this.clickBlockOnCanvas('ModelResponseBlock');

        cy.get('.tree-sidebar-edit-block', { timeout: 10000 })
            .should('exist');
    }

    // Verify voice speed slider exists
    assertVoiceSpeedSliderExists() {
        cy.get('[data-testid="voice-speed-slider"]', { timeout: 10000 })
            .should('exist');
    }

    // ─── Save Tree ───
    saveTree() {
        cy.get('.tree-save-tree', { timeout: 10000 })
            .should('not.have.attr', 'disabled');
        cy.get('.tree-save-tree').click({ force: true });
        cy.wait(3000);
    }

    // ─── Publish Tree ───
    publishTree() {
        cy.contains('a', 'Publish', { timeout: 15000 })
            .should('not.have.class', 'disabled')
            .click();
        cy.wait(500);
        cy.contains('button', 'Publish').click();
        cy.wait(3000);
    }

    // ─── Delete Tree ───
    deleteTree(treeName) {
        this.visitTreesPage();
        cy.wait(2000);
        if (treeName) {
            cy.contains('a', treeName, { timeout: 10000 }).parents('tr, .list-group-item').first()
                .find('a:contains("More")').click();
        } else {
            cy.contains('a', 'More', { timeout: 10000 }).first().click();
        }
        cy.wait(500);
        cy.get('a.js-delete').first().click({ force: true });
        cy.wait(500);
        cy.contains('button', 'Delete').click();
        cy.wait(2000);
    }

    // Adjust the voice speed slider on the Model Response block editor
    adjustVoiceSpeed(value) {
        cy.get('[data-testid="voice-speed-slider"]')
            .find('input[type="range"]')
            .first()
            .scrollIntoView()
            .invoke('val', value)
            .trigger('input')
            .trigger('change');
        cy.wait(500);
    }

    // Assert the voice speed slider shows a specific value
    assertVoiceSpeedValue(value) {
        cy.get('[data-testid="voice-speed-slider"]')
            .find('input[type="range"]')
            .first()
            .should('have.value', String(value));
    }

    // Click on a block in the tree canvas to open its editor sidebar
    clickBlockOnCanvas(blockType) {
        cy.get(`[data-testid="block-target-${blockType}"]`, { timeout: 10000 })
            .first()
            .click({ force: true });
        cy.wait(1000);
    }

    // Navigate to a tree's edit page by name
    editTreeByName(treeName) {
        this.visitTreesPage();
        cy.wait(2000);
        cy.contains('td, .list-group-item', treeName, { timeout: 10000 })
            .parents('tr')
            .find('[data-icon="edit"], a[href*="/edit"]')
            .first()
            .click();
        cy.contains('button', 'Add Block', { timeout: 15000 }).should('exist');
        cy.wait(3000);
    }
}

export default ModelBlock_Objects;
