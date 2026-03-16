import { ContentNavigation } from "../navigations";

class ModelBlock_Objects {

    visitTreesPage() {
        cy.navigateTo(ContentNavigation.TREE);
    }

    // Create a tree (not a flow) — Model blocks are only available in the tree builder
    createTree(title) {
        cy.get('[href="/trees/create"]', { timeout: 10000 }).click();
        cy.wait(2000);

        // Fill in the title
        cy.get('input[name="details[title]"]').type(title);

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
    // Tree builder uses a single "Add Block" dropdown with data-block-type=className
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

        // Wait for the block editor sidebar to exist (may not be "visible" due to position:fixed overflow)
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
        cy.get('.tree-sidebar-edit-block')
            .contains('button', /simulate/i)
            .should('exist');
    }

    // Open the simulator modal
    openSimulator() {
        cy.get('.tree-sidebar-edit-block')
            .contains('button', /simulate/i)
            .scrollIntoView()
            .click({ force: true });
        cy.wait(2000);

        // Verify modal is open
        cy.get('#block-llm-simulator-modal', { timeout: 10000 })
            .should('be.visible');
    }

    // Select channel in simulator (ViaDropdown component)
    selectSimulatorChannel(channelName) {
        // Find the Channel section and click its dropdown button
        cy.get('#block-llm-simulator-modal')
            .contains('button', /voice|sms|select a channel/i)
            .scrollIntoView()
            .click({ force: true });
        cy.wait(500);
        // Click the dropdown item with the channel name
        cy.contains(channelName).click({ force: true });
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

    // Type a question into the simulator (ViaTextarea component)
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
        // Click the ViaModal close button (tertiary icon button in modal header)
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
        cy.get('.tree-sidebar-edit-block')
            .find('[name="llmVoiceSpeed"], input[type="range"]')
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

    // Click on a block in the tree canvas to open its editor sidebar
    // Blocks on the canvas have a .block-item-target child that triggers selection
    clickBlockOnCanvas(blockType) {
        // The canvas block has the block type name as text content
        // Find the block and click its .block-item-target to select it
        cy.get('.block-item-target', { timeout: 10000 })
            .first()
            .click({ force: true });
        cy.wait(1000);
    }

    // Navigate to a tree's edit page by name
    editTreeByName(treeName) {
        this.visitTreesPage();
        cy.wait(2000);
        // Find the row containing the tree name and click its edit icon
        cy.contains('td, .list-group-item', treeName, { timeout: 10000 })
            .parents('tr')
            .find('[data-icon="edit"], a[href*="/edit"]')
            .first()
            .click();
        // Wait for the tree builder to load (Add Block button is a reliable indicator)
        cy.contains('button', 'Add Block', { timeout: 15000 }).should('exist');
        cy.wait(3000);
    }
}

export default ModelBlock_Objects;
