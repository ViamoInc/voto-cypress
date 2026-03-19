import ModelBlock_Objects from "../../support/page_objects/model_block_objects";

///<reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
});

// ─── Language definitions ────────────────────────────────────────────────────
// supported: false → test is skipped until the language is added to the
// organisation's language configuration in the database.
// Questions are phrased in the target language so the LLM responds in kind.
const LANGUAGES = [
    {
        name: 'English',
        displayMatch: /english/i,
        question: 'What is the capital of Ghana?',
        supported: true,
    },
    {
        name: 'French',
        displayMatch: /fran[cç]/i,
        question: 'Quelle est la capitale du Sénégal?',
        supported: true,
    },
    {
        name: 'Urdu',
        displayMatch: /urdu|اردو/i,
        question: 'پاکستان کا دارالحکومت کیا ہے؟',
        supported: true,
    },
    {
        // Skipped: Kinyarwanda must be added to the org language configuration first
        name: 'Kinyarwanda',
        displayMatch: /kinyarwanda/i,
        question: 'Ni iki umurwa mukuru wa Rwanda?',
        supported: false,
    },
    {
        // Skipped: Pashto must be added to the org language configuration first
        name: 'Pashto',
        displayMatch: /pashto|پښتو/i,
        question: 'د افغانستان پلازمینه کومه ده؟',
        supported: false,
    },
    {
        // Skipped: Sindhi must be added to the org language configuration first
        name: 'Sindhi',
        displayMatch: /sindhi|سنڌي/i,
        question: 'پاڪستان جي گاديءَ جو هنڌ ڪهڙو آهي؟',
        supported: false,
    },
    {
        // Skipped: Punjabi must be added to the org language configuration first
        name: 'Punjabi',
        displayMatch: /punjabi|ਪੰਜਾਬੀ/i,
        question: 'ਭਾਰਤ ਦੀ ਰਾਜਧਾਨੀ ਕਿਹੜੀ ਹੈ?',
        supported: false,
    },
];

// Stable timestamp for the shared tree name across all suites in this file
const TIMESTAMP = Date.now();

// ─── Suite 1: Tree setup ─────────────────────────────────────────────────────
describe('Model Response Block - Tree Setup', () => {
    let data;
    const model = new ModelBlock_Objects();

    before(() => {
        cy.fixture('model_response_details').then((d) => {
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
        cy.fixture('model_response_details').then((d) => {
            model.visitTreesPage();
            cy.wait(2000);
            model.createTree(d.flow_label + ' ' + TIMESTAMP);

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

// ─── Suite 2: Text response per language ─────────────────────────────────────
describe('Model Response Block - Text Response per Language', () => {
    const model = new ModelBlock_Objects();

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    LANGUAGES.forEach(({ name, displayMatch, question, supported }) => {
        // Use it.skip for languages not yet configured in the org
        const testFn = supported ? it : it.skip;

        testFn(`Should receive a text response in ${name}`, () => {
            cy.fixture('model_response_details').then((d) => {
                model.editTreeByName(d.flow_label + ' ' + TIMESTAMP);
                model.clickBlockOnCanvas('ModelInputBlock');

                model.openSimulator();

                // Select language
                model.selectSimulatorLanguage(displayMatch.source.replace(/[/i]/g, '').split('|')[0]);

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

// ─── Suite 3: Audio response per language ────────────────────────────────────
describe('Model Response Block - Audio Response per Language (Voice channel)', () => {
    const model = new ModelBlock_Objects();

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    LANGUAGES.forEach(({ name, displayMatch, question, supported }) => {
        const testFn = supported ? it : it.skip;

        testFn(`Should receive an audio response in ${name}`, () => {
            cy.fixture('model_response_details').then((d) => {
                model.editTreeByName(d.flow_label + ' ' + TIMESTAMP);
                model.clickBlockOnCanvas('ModelInputBlock');

                model.openSimulator();

                // Select language
                model.selectSimulatorLanguage(displayMatch.source.replace(/[/i]/g, '').split('|')[0]);

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

// ─── Suite 4: Voice speed configuration ──────────────────────────────────────
describe('Model Response Block - Voice Speed Configuration', () => {
    const model = new ModelBlock_Objects();

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Should allow voice speed to be increased on the Model Response block', () => {
        cy.fixture('model_response_details').then((d) => {
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
        cy.fixture('model_response_details').then((d) => {
            model.editTreeByName(d.flow_label + ' ' + TIMESTAMP);
            model.clickBlockOnCanvas('ModelResponseBlock');

            model.adjustVoiceSpeed(1.0);
            model.assertVoiceSpeedValue(1.0);

            model.saveTree();
        });
        cy.logoutOfVoto();
    });

    it('Should allow voice speed to be set to maximum (2.0)', () => {
        cy.fixture('model_response_details').then((d) => {
            model.editTreeByName(d.flow_label + ' ' + TIMESTAMP);
            model.clickBlockOnCanvas('ModelResponseBlock');

            model.adjustVoiceSpeed(2.0);
            model.assertVoiceSpeedValue(2.0);

            model.saveTree();
        });
        cy.logoutOfVoto();
    });
});

// ─── Suite 5: SMS channel coverage ───────────────────────────────────────────
describe('Model Response Block - SMS Channel Response', () => {
    const model = new ModelBlock_Objects();

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Should receive a text-only response via SMS channel in English', () => {
        cy.fixture('model_response_details').then((d) => {
            model.editTreeByName(d.flow_label + ' ' + TIMESTAMP);
            model.clickBlockOnCanvas('ModelInputBlock');

            model.openSimulator();
            model.selectSimulatorLanguage('english');
            model.selectSimulatorChannel('sms');

            // Generate audio checkbox should be hidden for SMS — verify it does not appear
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
        cy.fixture('model_response_details').then((d) => {
            model.editTreeByName(d.flow_label + ' ' + TIMESTAMP);
            model.clickBlockOnCanvas('ModelInputBlock');

            model.openSimulator();
            model.selectSimulatorLanguage('fran');
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

// ─── Suite 6: Cleanup ────────────────────────────────────────────────────────
describe('Model Response Block - Cleanup', () => {
    const model = new ModelBlock_Objects();

    beforeEach(() => {
        cy.loginToVoto();
    });

    afterEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Clean up - delete the model response language test tree', () => {
        cy.fixture('model_response_details').then((d) => {
            model.deleteTree(d.flow_label + ' ' + TIMESTAMP);
        });
        cy.logoutOfVoto();
    });
});
