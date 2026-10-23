import ModelBlock_Objects from "../../support/page_objects/model_block_objects";

///<reference types="cypress" />

Cypress.on('uncaught:exception', () => false);

const TIMESTAMP = Date.now();
const TOPIC_NAME = 'Cypress Expert Topic';
const EXTRA_PROMPT = 'Answer in one sentence and mention voter registration.';
const TTS_INSTRUCTION = 'Speak warmly and clearly.';
const SIMULATOR_QUESTION = 'How do I register to vote?';
const VOICE_SPEED = 1.7;

describe('Model Blocks - Configuration Regression', () => {
    const model = new ModelBlock_Objects();

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Should create a voice-only tree with linked model blocks', () => {
        cy.fixture('model_block_details').then((data) => {
            cy.intercept('GET', '**/resource/ai/simulator/system-prompts', {
                statusCode: 200,
                body: {
                    'DN-1': 'Primary prompt',
                },
            }).as('systemPrompts');

            model.visitTreesPage();
            cy.wait(2000);
            model.createTree(`${data.flow_label} Config ${TIMESTAMP}`, ['English'], { hasSms: false });

            model.addModelInputBlock(data.model_input_label);
            cy.wait('@systemPrompts');
            model.selectLlmAgent('ASK_ME_ANYTHING_SERVICE');
            model.assertSimulatorButtonVisible();

            model.addModelResponseBlock();
            model.selectModelResponseInputSource(data.model_input_label);
            model.adjustVoiceSpeed(VOICE_SPEED);
            model.assertVoiceSpeedValue(VOICE_SPEED);

            model.saveTree();
        });

        cy.logoutOfVoto();
    });

    it('Should persist model configuration and send the expected simulator payload', () => {
        cy.fixture('model_block_details').then((data) => {
            cy.intercept('GET', '**/resource/ai/aae/topics', {
                statusCode: 200,
                body: {
                    data: [{ name: TOPIC_NAME }],
                },
            }).as('aaeTopics');
            cy.intercept('GET', '**/resource/ai/simulator/system-prompts', {
                statusCode: 200,
                body: {
                    'DN-1': 'Primary prompt',
                },
            }).as('systemPromptsInitial');

            model.editTreeByName(`${data.flow_label} Config ${TIMESTAMP}`);
            model.clickBlockOnCanvas('ModelInputBlock');
            cy.wait('@aaeTopics');
            cy.wait('@systemPromptsInitial');

            model.selectLlmAgent('ASK_AN_EXPERT');
            model.selectAskAnExpertTopic(TOPIC_NAME);
            model.setAllowOfftopicQuestions(true);
            model.setVoiceExtraPrompt(EXTRA_PROMPT);
            model.setVoiceTtsInstruction(TTS_INSTRUCTION);

            model.openEvalsModal();
            model.fillFirstEvalRow({
                name: data.eval_name,
                datatypeLabel: 'Text',
                description: data.eval_description,
            });
            model.confirmModal('block-llm-evals-modal');
            model.saveTree();

            cy.intercept('GET', '**/resource/ai/aae/topics', {
                statusCode: 200,
                body: {
                    data: [{ name: TOPIC_NAME }],
                },
            }).as('aaeTopicsReload');
            cy.intercept('GET', '**/resource/ai/simulator/system-prompts', {
                statusCode: 200,
                body: {
                    'DN-1': 'Primary prompt',
                    'DN-2': 'Secondary prompt',
                },
            }).as('systemPrompts');
            cy.intercept('POST', '**/resource/ai/simulator/call-llm', (req) => {
                expect(req.body.topic).to.eq(TOPIC_NAME);
                expect(req.body.allowOfftopicQuestions).to.eq(true);
                expect(req.body.extraPrompt).to.eq(EXTRA_PROMPT);
                expect(req.body.deliveryNode).to.eq('DN-2');
                expect(req.body.generateAudioResponse).to.eq(true);
                expect(req.body.ttsInstruction).to.eq(TTS_INSTRUCTION);
                expect(req.body.voiceSpeed).to.eq(String(VOICE_SPEED));
                expect(req.body.evals).to.have.length.at.least(1);
                expect(req.body.evals[0]).to.include({
                    name: data.eval_name,
                    datatype: 'string',
                    description: data.eval_description,
                });

                req.reply({
                    statusCode: 200,
                    body: {
                        metadata: {
                            input_text: SIMULATOR_QUESTION,
                            localized_output: 'You can register at your local office.',
                            translated_output: null,
                            model_output: 'You can register at your local office.',
                            eval_extra_results: {
                                [data.eval_name]: {
                                    value: 'neutral',
                                },
                            },
                            rag_facts: 'Bring identification to the local office.',
                        },
                        audio: 'ZmFrZUF1ZGlv',
                    },
                });
            }).as('simulatorCall');

            model.editTreeByName(`${data.flow_label} Config ${TIMESTAMP}`);
            model.clickBlockOnCanvas('ModelInputBlock');
            cy.wait('@aaeTopicsReload');
            cy.wait('@systemPrompts');

            model.assertVoiceExtraPromptValue(EXTRA_PROMPT);
            model.assertVoiceTtsInstructionValue(TTS_INSTRUCTION);

            model.openSimulator();
            model.selectSimulatorDeliveryNode('DN-2');
            model.assertSimulatorTtsInstructionValue(TTS_INSTRUCTION);
            model.typeSimulatorQuestion(SIMULATOR_QUESTION);
            model.runSimulator();
            cy.wait('@simulatorCall');

            model.assertResponseHasTranscript();
            model.assertResponseHasAudio();
            model.assertSimulatorContainsText(data.eval_name);
            model.assertSimulatorContainsText('neutral');
            model.assertSimulatorContainsText('Bring identification to the local office.');
            model.closeSimulator();
        });

        cy.logoutOfVoto();
    });

    it('Should persist Ask-an-Expert configuration after reload', () => {
        cy.fixture('model_block_details').then((data) => {
            cy.intercept('GET', '**/resource/ai/aae/topics', {
                statusCode: 200,
                body: {
                    data: [{ name: TOPIC_NAME }],
                },
            }).as('aaeTopics');
            cy.intercept('GET', '**/resource/ai/simulator/system-prompts', {
                statusCode: 200,
                body: {
                    'DN-1': 'Primary prompt',
                },
            }).as('systemPrompts');

            model.editTreeByName(`${data.flow_label} Config ${TIMESTAMP}`);
            model.clickBlockOnCanvas('ModelInputBlock');
            cy.wait('@aaeTopics');
            cy.wait('@systemPrompts');

            cy.get('#llmAgent').should('have.value', 'ASK_AN_EXPERT');
            cy.get('#llmTopicSelect').should('have.value', TOPIC_NAME);
            cy.get('input[name="allow_offtopic_questions"]').should('be.checked');
            cy.get('.block-llm-evals-config').should('contain.text', data.eval_name);
            model.assertVoiceExtraPromptValue(EXTRA_PROMPT);
            model.assertVoiceTtsInstructionValue(TTS_INSTRUCTION);
        });

        cy.logoutOfVoto();
    });

    it('Clean up - delete the model block configuration tree', () => {
        cy.fixture('model_block_details').then((data) => {
            model.deleteTree(`${data.flow_label} Config ${TIMESTAMP}`);
        });

        cy.logoutOfVoto();
    });
});
