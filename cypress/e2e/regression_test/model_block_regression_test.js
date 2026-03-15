import ModelBlock_Objects from "../../support/page_objects/model_block_objects";

///<reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
});

describe.skip('Model Blocks - Flow Creation and AI Simulator — SKIPPED: Model blocks not available in test org block menu', () => {
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

    it('Should create a flow, add Model Input block, and configure LLM agent', () => {
        model.visitFlowsPage();
        cy.wait(2000);
        model.createFlow(data.flow_label + ' ' + timestamp);

        // Add Model Input block
        model.addModelInputBlock(data.model_input_label);

        // Configure with Ask Me Anything Service agent
        model.selectLlmAgent('ASK_ME_ANYTHING_SERVICE');

        // Verify simulator button is visible for service-based agents
        model.assertSimulatorButtonVisible();

        model.saveFlow();
        cy.logoutOfVoto();
    });

    it('Should open the simulator modal and verify its UI elements', () => {
        // Navigate to the flow and edit it
        model.visitFlowsPage();
        cy.wait(2000);
        cy.get('[data-icon="edit"]').first().click();
        cy.wait(3000);

        // Click on the Model Input block to open its editor
        cy.get('[data-block-type="ModelInputBlock"]', { timeout: 10000 }).first().click();
        cy.wait(1000);

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

    it('Should send a question via simulator (SMS channel) and get a text response', () => {
        model.visitFlowsPage();
        cy.wait(2000);
        cy.get('[data-icon="edit"]').first().click();
        cy.wait(3000);

        cy.get('[data-block-type="ModelInputBlock"]', { timeout: 10000 }).first().click();
        cy.wait(1000);

        model.openSimulator();
        model.selectSimulatorChannel('SMS');
        model.typeSimulatorQuestion(data.simulator_question_sms);
        model.runSimulator();
        model.assertSimulatorResponse(120000);
        model.assertResponseHasTranscript();
        model.closeSimulator();
        cy.logoutOfVoto();
    });

    it('Should send a question via simulator (Voice channel) and get a text response', () => {
        model.visitFlowsPage();
        cy.wait(2000);
        cy.get('[data-icon="edit"]').first().click();
        cy.wait(3000);

        cy.get('[data-block-type="ModelInputBlock"]', { timeout: 10000 }).first().click();
        cy.wait(1000);

        model.openSimulator();
        model.selectSimulatorChannel('Voice');
        model.uncheckGenerateAudio();
        model.typeSimulatorQuestion(data.simulator_question_1);
        model.runSimulator();
        model.assertSimulatorResponse(120000);
        model.assertResponseHasTranscript();
        model.closeSimulator();
        cy.logoutOfVoto();
    });

    it('Should generate audio response on Voice channel when audio checkbox is checked', () => {
        model.visitFlowsPage();
        cy.wait(2000);
        cy.get('[data-icon="edit"]').first().click();
        cy.wait(3000);

        cy.get('[data-block-type="ModelInputBlock"]', { timeout: 10000 }).first().click();
        cy.wait(1000);

        model.openSimulator();
        model.selectSimulatorChannel('Voice');
        // Ensure audio generation is checked
        cy.get('#block-llm-simulator-modal').then(($modal) => {
            const checkbox = $modal.find('[name="generate-audio-response"]');
            if (checkbox.length > 0 && !checkbox.is(':checked')) {
                cy.wrap(checkbox).click({ force: true });
            }
        });
        model.typeSimulatorQuestion(data.simulator_question_sms);
        model.runSimulator();
        model.assertSimulatorResponse(120000);
        model.assertResponseHasAudio();
        model.closeSimulator();
        cy.logoutOfVoto();
    });

    it('Should add a Model Response block and verify voice speed slider', () => {
        model.visitFlowsPage();
        cy.wait(2000);
        cy.get('[data-icon="edit"]').first().click();
        cy.wait(3000);

        model.addModelResponseBlock();
        model.assertVoiceSpeedSliderExists();
        model.saveFlow();
        cy.logoutOfVoto();
    });

    it('Should publish the flow with model blocks', () => {
        model.visitFlowsPage();
        cy.wait(2000);
        cy.get('[data-icon="edit"]').first().click();
        cy.wait(3000);

        model.saveFlow();
        model.publishFlow();
        cy.logoutOfVoto();
    });

    it('Clean up - delete the model blocks flow', () => {
        model.deleteFlow();
        cy.logoutOfVoto();
    });
});
