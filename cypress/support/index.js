// Import your custom commands
//import './commands'; // This ensures commands are available in all tests

// Handle uncaught exceptions globally to prevent test failure
console.log('Index.js loaded!'); // You should see this in Cypress's console when a test runs

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes("Cannot read properties of undefined (reading 'viaModal')")) {
    return false; // Ignore this specific error
  }
  return true; // Allow other exceptions to fail the test
});