# README #
### What is this repository for? ###
* Quick summary

This repository contains end-to-end (e2e) tests for the VOTO5 app, utilizing the Cypress testing framework. The tests are organized following the Page Object Model design pattern to enhance maintainability and readability. The repository also includes a comprehensive reporting functionality to facilitate test analysis.


* Version

### How do I get set up? ###

* Summary of set up

After cloning the repository
- Make a copy of example.cypress.env.json file as cypress.env.json
- Provide target environment details in the cypress.env.json file
- run yarn install or npm install to install all the dependencies in the project
* How to run tests
- yarn cy_open    to start cypress

### File Structure
- cypress/
    - e2e/
        - regression-test/
            Contains regression test files.
        - smoke-test/
            Contains smoke test files.
    - fixtures/
        Contains fixture files providing data sources for corresponding test files.
    - cypress.env.json
        Git-ignored file containing essential environment data for tests.


### Usage
    Prerequisites
        - Node.js installed
        - Cypress installed (npm install cypress)
### Running Tests
    - Clone the repository.
    - Install dependencies with 'npm install'.
    - Run Cypress with 'npm test'.
    - Use this script to run all the tests under smoke_test with report "triggerAll-Smoke-tests"
    - Use this script to run all the tests under regression_test with report "triggerAll-Regression-tests"
### Test Data
- Update test data in the 'fixtures/' folder to match your testing scenarios.
### Environment Configuration
- Modify the cypress.env.json file to set up your environment variables.
### Reporting
- The repository supports reporting for better test analysis. View reports in the reports/ directory after test execution.

### Who do I talk to? ###
For further clarification or inquiries, please reach out to the Automation Initiative team.

* Repo owner or admin
* Other community or team contact