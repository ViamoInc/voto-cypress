import ModelBlock_Objects from "../../support/page_objects/model_block_objects";

///<reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
});

describe('Model Blocks - Flow Creation with AI Blocks', () => {
    let data;
    const model = new ModelBlock_Objects();
    const timestamp = Date.now();

    before(() => {
        cy.fixture('model_block_details').then((d) => {
            data = d;
        });
    });

    it('Should create a flow and add a Model Input block', () => {
        cy.loginToVoto();
        cy.navigateTo({
            categoryLinkSelector: "[data-test='nav-main-menu-item--content']",
            linkSelector: "[data-test='nav-menu-item--trees-and-flows']"
        });
        cy.wait(2000);
        model.createFlow(data.flow_label + ' ' + timestamp);
        model.addModelInputBlock(data.model_input_label);
        model.saveFlow();
    });

    it('Should configure the Model Input block with Ask Me Anything Service agent', () => {
        model.selectLlmAgent('ASK_ME_ANYTHING_SERVICE');
        model.assertSimulatorButtonVisible();
        model.saveFlow();
    });

    it('Should open the simulator modal and verify it loads', () => {
        model.openSimulator();
        // Verify modal elements are present
        cy.get('#block-llm-simulator-modal').within(() => {
            // Language dropdown should exist
            cy.contains(/language/i).should('exist');
            // Channel dropdown should exist
            cy.contains(/channel/i).should('exist');
            // Question textarea should exist
            cy.get('textarea').should('exist');
            // Run button should exist
            cy.contains('button', /run/i).should('exist');
        });
        model.closeSimulator();
    });

    it('Should send a question via simulator and get a text response (SMS channel)', () => {
        model.openSimulator();
        model.selectSimulatorChannel('SMS');
        model.typeSimulatorQuestion(data.simulator_question_sms);
        model.runSimulator();
        // LLM responses can take up to 2 minutes
        model.assertSimulatorResponse(120000);
        model.assertResponseHasTranscript();
        model.closeSimulator();
    });

    it('Should send a question via simulator on Voice channel', () => {
        model.openSimulator();
        model.selectSimulatorChannel('Voice');
        // Uncheck audio generation for faster response
        model.uncheckGenerateAudio();
        model.typeSimulatorQuestion(data.simulator_question_1);
        model.runSimulator();
        model.assertSimulatorResponse(120000);
        model.assertResponseHasTranscript();
        model.closeSimulator();
    });

    it('Should send a second question and see multiple responses in the log', () => {
        model.openSimulator();
        model.selectSimulatorChannel('SMS');
        model.typeSimulatorQuestion(data.simulator_question_1);
        model.runSimulator();
        model.assertSimulatorResponse(120000);
        // Send a second question
        model.typeSimulatorQuestion(data.simulator_question_2);
        model.runSimulator();
        // Should now have 2 responses in the log
        cy.get('.block-llm-simulator-response', { timeout: 120000 })
            .should('have.length.at.least', 2);
        model.closeSimulator();
    });

    it('Should generate audio response on Voice channel when checkbox is checked', () => {
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
    });

    it('Should add a Model Response block and link it to the Model Input block', () => {
        model.addModelResponseBlock();
        model.assertVoiceSpeedSliderExists();
        model.saveFlow();
    });

    it('Should save and publish the flow with model blocks', () => {
        model.saveFlow();
        model.publishFlow();
        cy.logoutOfVoto();
    });

    it('Clean up - delete the model blocks flow', () => {
        cy.loginToVoto();
        model.deleteFlow();
        cy.logoutOfVoto();
    });
});
