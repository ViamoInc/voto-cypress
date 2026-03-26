import ModelBlock_Objects from "../../support/page_objects/model_block_objects";

///<reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
});

// ─── Language definitions ────────────────────────────────────────────────────
// searchTerm must match the language name shown in the simulator dropdown.
// supportsAudio: false → audio response tests are skipped (TTS not available).
const LANGUAGES = [
    {
        name: 'English',
        searchTerm: 'English',
        question: 'What is the capital of Ghana?',
        supportsAudio: true,
    },
    {
        name: 'French',
        searchTerm: 'French',
        question: 'Quelle est la capitale du Sénégal?',
        supportsAudio: true,
    },
    {
        name: 'Urdu',
        searchTerm: 'Urdu',
        question: 'پاکستان کا دارالحکومت کیا ہے؟',
        supportsAudio: false,
    },
    {
        name: 'Kinyarwanda',
        searchTerm: 'Kinyarwanda',
        question: 'Ni iki umurwa mukuru wa Rwanda?',
        supportsAudio: false,
    },
    {
        name: 'Pashto',
        searchTerm: 'Pashto',
        question: 'د افغانستان پلازمینه کومه ده؟',
        supportsAudio: false,
    },
    {
        name: 'Sindhi',
        searchTerm: 'Sindhi',
        question: 'پاڪستان جي گاديءَ جو هنڌ ڪهڙو آهي؟',
        supportsAudio: false,
    },
    {
        name: 'Punjabi',
        searchTerm: 'Punjabi',
        question: 'ਭਾਰਤ ਦੀ ਰਾਜਧਾਨੀ ਕਿਹੜੀ ਹੈ?',
        supportsAudio: false,
    },
];

// Collect all language names for tree creation
const LANGUAGE_NAMES = LANGUAGES.map(l => l.name);

// Stable timestamp for the shared tree name across all suites in this file
const TIMESTAMP = Date.now();

// ─── Suite 1: Tree setup ─────────────────────────────────────────────────────
describe('Model Blocks - Tree Setup', () => {
    let data;
    const model = new ModelBlock_Objects();

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

    it('Should create a tree with Model Input block (ASK_ME_ANYTHING_SERVICE) and Model Response block', () => {
        cy.fixture('model_block_details').then((d) => {
            model.visitTreesPage();
            cy.wait(2000);
            model.createTree(d.flow_label + ' ' + TIMESTAMP, LANGUAGE_NAMES);

            // Add and configure Model Input block
            model.addModelInputBlock(d.model_input_label);
            model.selectLlmAgent('ASK_ME_ANYTHING_SERVICE');
            model.assertSimulatorButtonVisible();

            // Add Model Response block
            model.addModelResponseBlock();
            model.assertVoiceSpeedSliderExists();

            model.saveTree();
        });
        cy.logoutOfVoto();
    });
});

// ─── Suite 2: Simulator UI verification ──────────────────────────────────────
describe.skip('Model Blocks - Simulator UI', () => {
    const model = new ModelBlock_Objects();

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Should open the simulator modal and verify its UI elements', () => {
        cy.fixture('model_block_details').then((d) => {
            model.editTreeByName(d.flow_label + ' ' + TIMESTAMP);
            model.clickBlockOnCanvas('ModelInputBlock');

            model.openSimulator();
            cy.get('#block-llm-simulator-modal').within(() => {
                cy.contains(/language/i).should('exist');
                cy.contains(/channel/i).should('exist');
                cy.get('textarea').should('exist');
            });
            model.closeSimulator();
        });
        cy.logoutOfVoto();
    });
});

// ─── Suite 3: Text response per language ─────────────────────────────────────
describe.skip('Model Blocks - Text Response per Language', () => {
    const model = new ModelBlock_Objects();

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    LANGUAGES.forEach(({ name, searchTerm, question }) => {
        it(`Should receive a text response in ${name}`, () => {
            cy.fixture('model_block_details').then((d) => {
                model.editTreeByName(d.flow_label + ' ' + TIMESTAMP);
                model.clickBlockOnCanvas('ModelInputBlock');

                model.openSimulator();

                // Select language
                model.selectSimulatorLanguage(searchTerm);

                // Disable audio for a faster text-only check
                model.uncheckGenerateAudio();
                model.typeSimulatorQuestion(question);

                cy.intercept('POST', '**/resource/ai/simulator/call-llm').as('simulatorCall');
                model.runSimulator();
                cy.wait('@simulatorCall', { timeout: 60000 })
                    .its('response.statusCode')
                    .should('eq', 200);

                model.assertSimulatorResponse(30000);
                model.assertResponseHasTranscript();

                model.closeSimulator();
            });
            cy.logoutOfVoto();
        });
    });
});

// ─── Suite 4: Audio response per language ────────────────────────────────────
describe.skip('Model Blocks - Audio Response per Language (Voice channel)', () => {
    const model = new ModelBlock_Objects();

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    LANGUAGES.forEach(({ name, searchTerm, question, supportsAudio }) => {
        const testFn = supportsAudio ? it : it.skip;

        testFn(`Should receive an audio response in ${name}`, () => {
            cy.fixture('model_block_details').then((d) => {
                model.editTreeByName(d.flow_label + ' ' + TIMESTAMP);
                model.clickBlockOnCanvas('ModelInputBlock');

                model.openSimulator();

                // Select language
                model.selectSimulatorLanguage(searchTerm);

                // Select Voice channel so audio response is available
                model.selectSimulatorChannel('voice');

                // Ensure generate audio is checked
                cy.get('#block-llm-simulator-modal').then(($modal) => {
                    const checkbox = $modal.find('input[name="generate-audio-response"]');
                    if (checkbox.length > 0 && !checkbox.is(':checked')) {
                        cy.wrap(checkbox).click({ force: true });
                    }
                });

                model.typeSimulatorQuestion(question);

                cy.intercept('POST', '**/resource/ai/simulator/call-llm').as('simulatorCall');
                model.runSimulator();
                cy.wait('@simulatorCall', { timeout: 60000 })
                    .its('response.statusCode')
                    .should('eq', 200);

                model.assertSimulatorResponse(60000);
                model.assertResponseHasTranscript();
                model.assertResponseHasAudio();

                model.closeSimulator();
            });
            cy.logoutOfVoto();
        });
    });
});

// ─── Suite 5: Voice speed configuration ──────────────────────────────────────
describe.skip('Model Blocks - Voice Speed Configuration', () => {
    const model = new ModelBlock_Objects();

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Should allow voice speed to be increased on the Model Response block', () => {
        cy.fixture('model_block_details').then((d) => {
            model.editTreeByName(d.flow_label + ' ' + TIMESTAMP);
            model.clickBlockOnCanvas('ModelResponseBlock');

            model.assertVoiceSpeedSliderExists();
            model.adjustVoiceSpeed(1.5);
            model.assertVoiceSpeedValue(1.5);

            model.saveTree();
        });
        cy.logoutOfVoto();
    });

    it('Should allow voice speed to be set back to default (1.0)', () => {
        cy.fixture('model_block_details').then((d) => {
            model.editTreeByName(d.flow_label + ' ' + TIMESTAMP);
            model.clickBlockOnCanvas('ModelResponseBlock');

            model.adjustVoiceSpeed(1.0);
            model.assertVoiceSpeedValue(1.0);

            model.saveTree();
        });
        cy.logoutOfVoto();
    });

    it('Should allow voice speed to be set to maximum (2.0)', () => {
        cy.fixture('model_block_details').then((d) => {
            model.editTreeByName(d.flow_label + ' ' + TIMESTAMP);
            model.clickBlockOnCanvas('ModelResponseBlock');

            model.adjustVoiceSpeed(2.0);
            model.assertVoiceSpeedValue(2.0);

            model.saveTree();
        });
        cy.logoutOfVoto();
    });
});

// ─── Suite 6: SMS channel coverage ───────────────────────────────────────────
describe.skip('Model Blocks - SMS Channel Response', () => {
    const model = new ModelBlock_Objects();

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Should receive a text-only response via SMS channel in English', () => {
        cy.fixture('model_block_details').then((d) => {
            model.editTreeByName(d.flow_label + ' ' + TIMESTAMP);
            model.clickBlockOnCanvas('ModelInputBlock');

            model.openSimulator();
            model.selectSimulatorLanguage('English');
            model.selectSimulatorChannel('sms');

            // Generate audio checkbox should be hidden for SMS
            cy.get('#block-llm-simulator-modal')
                .find('input[name="generate-audio-response"]')
                .should('not.exist');

            model.typeSimulatorQuestion('What is the capital of Ghana?');

            cy.intercept('POST', '**/resource/ai/simulator/call-llm').as('simulatorCall');
            model.runSimulator();
            cy.wait('@simulatorCall', { timeout: 60000 })
                .its('response.statusCode')
                .should('eq', 200);

            model.assertSimulatorResponse(30000);
            model.assertResponseHasTranscript();

            model.closeSimulator();
        });
        cy.logoutOfVoto();
    });

    it('Should receive a text-only response via SMS channel in French', () => {
        cy.fixture('model_block_details').then((d) => {
            model.editTreeByName(d.flow_label + ' ' + TIMESTAMP);
            model.clickBlockOnCanvas('ModelInputBlock');

            model.openSimulator();
            model.selectSimulatorLanguage('French');
            model.selectSimulatorChannel('sms');

            model.typeSimulatorQuestion('Quelle est la capitale du Sénégal?');

            cy.intercept('POST', '**/resource/ai/simulator/call-llm').as('simulatorCall');
            model.runSimulator();
            cy.wait('@simulatorCall', { timeout: 60000 })
                .its('response.statusCode')
                .should('eq', 200);

            model.assertSimulatorResponse(30000);
            model.assertResponseHasTranscript();

            model.closeSimulator();
        });
        cy.logoutOfVoto();
    });
});

// ─── Suite 7: Cleanup ────────────────────────────────────────────────────────
describe('Model Blocks - Cleanup', () => {
    const model = new ModelBlock_Objects();

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Clean up - delete the model blocks tree', () => {
        cy.fixture('model_block_details').then((d) => {
            model.deleteTree(d.flow_label + ' ' + TIMESTAMP);
        });
        cy.logoutOfVoto();
    });
});
