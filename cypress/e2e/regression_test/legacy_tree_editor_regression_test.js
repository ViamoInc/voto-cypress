import LegacyTreeEditor_Objects from '../../support/page_objects/legacy_tree_editor_objects';

///<reference types="cypress" />

// E2E coverage for the legacy tree editor, whose block wiring sits in
// global-scope ES5 under public/ui3/js/trees/ and so is unreachable by Jest.
// The FLOIP flow builder is a separate editor — see flow_regression_test.js.
//
// Self-contained: creates its own tree and deletes it at the end. Independent of
// the numbered, order-dependent smoke chain.

Cypress.on('uncaught:exception', () => false);

// Shared across the suites in this file so the tree is created once. Suites 2
// and 3 depend on suite 1 having run — the same pattern the model block
// regression spec uses.
const TIMESTAMP = Date.now();
let treeTitle;
let editorUrl;

const editor = new LegacyTreeEditor_Objects();

const login = () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.loginToVoto();
};

describe('Legacy Tree Editor - Tree Creation', () => {
    before(() => {
        cy.fixture('legacy_tree_editor_details').then((data) => {
            treeTitle = `${data.tree_title} ${TIMESTAMP}`;
        });
    });

    beforeEach(login);

    it('creates a tree from the tree list and opens the legacy editor', () => {
        cy.fixture('legacy_tree_editor_details').then((data) => {
            editor.createTreeFromList(treeTitle, { languages: data.languages, hasSms: false });

            // Remember where the editor landed so the later suites can go
            // straight back to this tree.
            cy.url().then((url) => {
                editorUrl = url;
            });

            // A newly created tree starts empty, and the toolbar is in its
            // editable state.
            cy.get('[data-testid^="block-target-"]').should('not.exist');
            cy.get('button.tree-save-tree').should('exist');
        });
    });
});

describe('Legacy Tree Editor - Block Authoring', () => {
    beforeEach(login);

    it('adds the main legacy block types, titles them and saves', () => {
        cy.fixture('legacy_tree_editor_details').then((data) => {
            editor.openEditor(editorUrl);

            data.blocks.forEach((block) => {
                editor.addBlockWithTitle(block.type, block.label);
            });

            editor.saveTree();

            data.blocks.forEach((block) => {
                editor.assertBlockCount(block.type, 1);
                editor.assertBlockTitleOnCanvas(block.label);
            });
        });
    });

    it('persists every block and its title across a reload', () => {
        cy.fixture('legacy_tree_editor_details').then((data) => {
            editor.openEditor(editorUrl);

            data.blocks.forEach((block) => {
                editor.assertBlockCount(block.type, 1);
                editor.assertBlockTitleOnCanvas(block.label);
            });

            // Nothing changed, so the tree is already in its saved state.
            editor.assertSaved();
        });
    });

    it('renames a block and persists the new title across a reload', () => {
        cy.fixture('legacy_tree_editor_details').then((data) => {
            const renamed = data.renamed_block;
            const original = data.blocks.find((block) => block.type === renamed.type);

            editor.openEditor(editorUrl);
            editor.selectBlock(renamed.type);
            editor.setSelectedBlockTitle(renamed.label);
            editor.saveTree();

            editor.openEditor(editorUrl);
            editor.assertBlockTitleOnCanvas(renamed.label);
            editor.assertBlockTitleAbsentFromCanvas(original.label);
        });
    });

    it('deletes a block and persists the deletion across a reload', () => {
        cy.fixture('legacy_tree_editor_details').then((data) => {
            const disposable = data.disposable_block;

            editor.openEditor(editorUrl);
            editor.assertBlockCount(disposable.type, 1);

            editor.selectBlock(disposable.type);
            editor.deleteSelectedBlock();
            editor.assertBlockCount(disposable.type, 0);
            editor.saveTree();

            editor.openEditor(editorUrl);
            editor.assertBlockCount(disposable.type, 0);
            editor.assertBlockTitleAbsentFromCanvas(disposable.label);

            // The blocks that were not deleted are still there.
            data.blocks
                .filter((block) => block.type !== disposable.type && block.type !== data.renamed_block.type)
                .forEach((block) => {
                    editor.assertBlockCount(block.type, 1);
                });
        });
    });
});

describe('Legacy Tree Editor - Cleanup', () => {
    beforeEach(login);

    it('deletes the tree from the tree list', () => {
        editor.deleteTreeByTitle(treeTitle);
        editor.assertTreeAbsentFromList(treeTitle);
    });
});
