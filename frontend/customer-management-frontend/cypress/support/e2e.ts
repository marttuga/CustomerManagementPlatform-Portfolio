import './commands';

Cypress.on('uncaught:exception', (err) => {
  // Ignore Chart.js and canvas errors
  if (
    err.message.includes('Canvas') ||
    err.message.includes('canvas') ||
    err.message.includes('chart') ||
    err.message.includes('Chart') ||
    err.message.includes('document') ||
    err.message.includes('null')
  ) {
    return false;
  }
  return true;
});