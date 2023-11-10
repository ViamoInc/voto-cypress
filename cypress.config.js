const { defineConfig } = require("cypress");

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      require("cypress-mochawesome-reporter/plugin")(on);
    },
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx,feature}",
    excludeSpecPattern: "cypress/e2e/other/*.js",
    supportFile: 'cypress/support/commands.js'
    //reporter: 'mochawesome',
    
  },
});
