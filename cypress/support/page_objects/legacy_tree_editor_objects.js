// Page object for the legacy tree editor at /trees/{id}/interaction-designer/edit.
// Not the FLOIP flow builder (/flows/new) — see flow_regression_test.js.
//
// The editor emits one test hook, [data-testid="block-target-<Type>"]. The other
// selectors here are class names the app's own jQuery delegation binds to
// (.tree-add-block, .tree-save-tree, .tree-delete-block, .tree-sidebar-edit-block),
// so they are load-bearing rather than cosmetic. The tree list has no test hooks,
// so it is driven by data-analytics-click-tracker instead.

let saveCounter = 0;

class LegacyTreeEditor_Objects {
    base() {
        return Cypress.env('baseUrl');
    }

    // ─── Tree list ───

    visitTreeList() {
        cy.visit(this.base() + '/trees');
        // The listing is a lazily-loaded Vue chunk; the New Tree button is the
        // first thing that proves the chunk resolved rather than bouncing to /.
        cy.get('[data-analytics-click-tracker="flowTree__index__new-tree__btn__click"]', { timeout: 40000 })
            .should('exist');
    }

    // ─── Create ───

    startNewTree() {
        cy.get('[data-analytics-click-tracker="flowTree__index__new-tree__btn__click"]')
            .click({ force: true });
        cy.get('input[name="details[title]"]', { timeout: 30000 }).should('be.visible');
    }

    // languages are matched by the label text wrapping each checkbox.
    // Only the org's enabled languages are rendered, so asking for one the org
    // does not have will fail here rather than silently do nothing.
    fillCreateForm(title, { languages = [], hasSms = false } = {}) {
        cy.get('input[name="details[title]"]').clear().type(title);

        if (languages.length > 0) {
            cy.get('input.tree-language-toggle-checkbox').each(($cb) => {
                if ($cb.is(':checked')) {
                    cy.wrap($cb).uncheck({ force: true });
                }
            });
            languages.forEach((language) => {
                cy.contains('label', language)
                    .find('input.tree-language-toggle-checkbox')
                    .check({ force: true });
            });
        }

        // Prefer the name attribute: .tree-enable-sms is reused by the USSD and
        // clipboard checkboxes too.
        cy.get('input[name="details[hasSms]"]').then(($sms) => {
            if (hasSms !== $sms.is(':checked')) {
                cy.wrap($sms).click({ force: true });
            }
        });
    }

    submitCreateForm() {
        cy.contains('button', 'Save and continue').click();
    }

    createTreeFromList(title, options) {
        this.visitTreeList();
        this.startNewTree();
        this.fillCreateForm(title, options);
        this.submitCreateForm();
        this.assertEditorReady();
    }

    // ─── Editor ───

    assertEditorReady() {
        // POST /trees/create redirects to /trees/{id}/edit, which the client
        // router then rewrites to the interaction-designer URL.
        cy.url({ timeout: 40000 }).should('include', '/interaction-designer/edit');
        cy.contains('button', 'Add Block', { timeout: 40000 }).should('exist');
        cy.get('#tree-workspace', { timeout: 30000 }).should('exist');
    }

    openEditor(url) {
        cy.visit(url);
        this.assertEditorReady();
    }

    // Root-menu block types only. Branching and Advanced blocks live behind
    // submenu toggles that have to be opened first.
    addBlock(blockType) {
        cy.contains('button', 'Add Block').click();
        cy.get(`a.tree-add-block[data-block-type="${blockType}"]`, { timeout: 15000 })
            .click({ force: true });
        cy.get(`[data-testid="block-target-${blockType}"]`, { timeout: 30000 }).should('exist');
    }

    // Clicking .block-item-target selects the block and opens its sidebar.
    // Clicking canvas whitespace deselects, so never click the workspace.
    selectBlock(blockType, index = 0) {
        cy.get(`[data-testid="block-target-${blockType}"]`, { timeout: 30000 })
            .eq(index)
            .click({ force: true });
        cy.get('.tree-sidebar-edit-block', { timeout: 30000 }).should('exist');
    }

    // BlockTitleInput renders the title as the first textarea.form-control in
    // the sidebar for every block type that has a title.
    setSelectedBlockTitle(title) {
        cy.get('.tree-sidebar-edit-block')
            .find('textarea.form-control')
            .first()
            .clear({ force: true })
            .type(title, { force: true });
        // The title is committed on keyup; give the store a beat to register the
        // change so the Save button leaves its disabled state.
        cy.get('button.tree-save-tree', { timeout: 15000 }).should('not.be.disabled');
    }

    addBlockWithTitle(blockType, title) {
        this.addBlock(blockType);
        this.selectBlock(blockType);
        this.setSelectedBlockTitle(title);
    }

    // ─── Save ───

    // Save posts to /ajax/trees/save/{id}. An autosave repeater posts to the
    // same URL on a timer, so the request alone is weak evidence; the button
    // flipping to a disabled "Saved" is what proves *our* changes were accepted.
    saveTree() {
        saveCounter += 1;
        const alias = `treeSave${saveCounter}`;
        cy.intercept('POST', '**/ajax/trees/save/*').as(alias);

        cy.get('button.tree-save-tree', { timeout: 20000 }).should('not.be.disabled').click({ force: true });
        cy.wait(`@${alias}`, { timeout: 40000 }).its('response.statusCode').should('eq', 200);
        this.assertSaved();
    }

    assertSaved() {
        cy.get('button.tree-save-tree', { timeout: 30000 })
            .should('be.disabled')
            .and('contain.text', 'Saved');
    }

    // ─── Assertions on the canvas ───

    assertBlockTitleOnCanvas(title) {
        cy.contains('.tree-block-item-title', title, { timeout: 30000 }).should('exist');
    }

    // Substring match: a replacement title that contains the old one as a
    // prefix will never register as absent.
    assertBlockTitleAbsentFromCanvas(title) {
        cy.get('#tree-workspace', { timeout: 30000 }).should('not.contain.text', title);
    }

    assertBlockCount(blockType, count) {
        if (count === 0) {
            cy.get(`[data-testid="block-target-${blockType}"]`).should('not.exist');
            return;
        }
        cy.get(`[data-testid="block-target-${blockType}"]`).should('have.length', count);
    }

    // ─── Block deletion ───

    // Deletes whichever block is currently selected. No confirmation modal.
    deleteSelectedBlock() {
        cy.get('button.tree-delete-block', { timeout: 20000 })
            .should('not.be.disabled')
            .click({ force: true });
    }

    // ─── Tree deletion ───

    // The row's More dropdown holds a.js-delete, which only opens
    // #confirm-delete-tree-set; the modal is what posts to /trees/deleteset.
    deleteTreeByTitle(title) {
        this.visitTreeList();
        cy.contains('tbody tr', title, { timeout: 40000 }).within(() => {
            cy.contains('a.dropdown-toggle', 'More').click({ force: true });
            cy.get('a.js-delete').click({ force: true });
        });
        cy.get('#confirm-delete-tree-set', { timeout: 20000 })
            .should('be.visible')
            .contains('button', 'Delete')
            .click({ force: true });
    }

    assertTreeAbsentFromList(title) {
        this.visitTreeList();
        cy.get('tbody', { timeout: 40000 }).should('not.contain.text', title);
    }
}

export default LegacyTreeEditor_Objects;
