const { defineConfig } = require("cypress");

module.exports = defineConfig({
  defaultCommandTimeout: 10000,  // 10 seconds
  pageLoadTimeout: 100000,  
  reporter: 'cypress-mochawesome-reporter',
  video: false,
  e2e: {
    setupNodeEvents(on, config) {
      try {
        require("cypress-mochawesome-reporter/plugin")(on)
      } catch (e) {
        console.warn('[cypress] mochawesome reporter plugin not installed; skipping')
      }
    },
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx,feature}",
    excludeSpecPattern: "cypress/e2e/other/**",
    supportFile: 'cypress/support/commands.js',
    experimentalRunAllSpecs: true,
    //reporter: 'mochawesome',
    
  },
});
