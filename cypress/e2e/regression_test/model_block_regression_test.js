import ModelBlock_Objects from "../../support/page_objects/model_block_objects";

///<reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
});

describe('Model Blocks - Tree Creation and AI Simulator', () => {
    let data;
    const model = new ModelBlock_Objects();
    const timestamp = Date.now();

    before(() => {
        cy.fixture('model_block_details').then((d) => {
            data = d;
        });
    });

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Should create a tree, add Model Input block, and configure LLM agent', () => {
        model.visitTreesPage();
        cy.wait(2000);
        model.createTree(data.flow_label + ' ' + timestamp);

        // Add Model Input block
        model.addModelInputBlock(data.model_input_label);

        // Configure with Ask Me Anything Service agent
        model.selectLlmAgent('ASK_ME_ANYTHING_SERVICE');

        // Verify simulator button is visible for service-based agents
        model.assertSimulatorButtonVisible();

        model.saveTree();
        cy.logoutOfVoto();
    });

    it('Should open the simulator modal and verify its UI elements', () => {
        model.editTreeByName(data.flow_label + ' ' + timestamp);

        // Click on the Model Input block to open its editor
        model.clickBlockOnCanvas('ModelInputBlock');

        model.openSimulator();
        // Verify modal elements
        cy.get('#block-llm-simulator-modal').within(() => {
            cy.contains(/language/i).should('exist');
            cy.contains(/channel/i).should('exist');
            cy.get('textarea').should('exist');
        });
        model.closeSimulator();
        cy.logoutOfVoto();
    });

    it('Should send a question via simulator and get a text response', () => {
        model.editTreeByName(data.flow_label + ' ' + timestamp);
        model.clickBlockOnCanvas('ModelInputBlock');

        model.openSimulator();
        model.uncheckGenerateAudio();
        model.typeSimulatorQuestion(data.simulator_question_1);

        cy.intercept('POST', '**/resource/ai/simulator/call-llm').as('simulatorCall');
        model.runSimulator();
        cy.wait('@simulatorCall', { timeout: 30000 }).its('response.statusCode').should('eq', 200);
        model.assertSimulatorResponse(30000);
        model.assertResponseHasTranscript();
        model.closeSimulator();
        cy.logoutOfVoto();
    });

    it('Should generate audio response when audio checkbox is checked', () => {
        model.editTreeByName(data.flow_label + ' ' + timestamp);
        model.clickBlockOnCanvas('ModelInputBlock');

        model.openSimulator();
        cy.get('#block-llm-simulator-modal').then(($modal) => {
            const checkbox = $modal.find('input[name="generate-audio-response"]');
            if (checkbox.length > 0 && !checkbox.is(':checked')) {
                cy.wrap(checkbox).click({ force: true });
            }
        });
        model.typeSimulatorQuestion(data.simulator_question_sms);

        cy.intercept('POST', '**/resource/ai/simulator/call-llm').as('simulatorCall');
        model.runSimulator();
        cy.wait('@simulatorCall', { timeout: 60000 }).its('response.statusCode').should('eq', 200);
        model.assertSimulatorResponse(30000);
        model.assertResponseHasAudio();
        model.closeSimulator();
        cy.logoutOfVoto();
    });

    it('Should add a Model Response block and verify voice speed slider', () => {
        model.editTreeByName(data.flow_label + ' ' + timestamp);

        model.addModelResponseBlock();
        model.assertVoiceSpeedSliderExists();
        model.saveTree();
        cy.logoutOfVoto();
    });

    // Skipped: darkmatter org requires a tag for publishing trees
    it.skip('Should publish the tree with model blocks', () => {
        model.editTreeByName(data.flow_label + ' ' + timestamp);

        model.publishTree();
        cy.logoutOfVoto();
    });

    it('Clean up - delete the model blocks tree', () => {
        model.deleteTree(data.flow_label + ' ' + timestamp);
        cy.logoutOfVoto();
    });
});
