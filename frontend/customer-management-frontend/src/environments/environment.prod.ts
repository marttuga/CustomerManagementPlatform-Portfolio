// Production environment configuration.
// This file replaces environment.ts when running: ng build --configuration production
// Update apiBaseUrl before deploying to the client's machine.
export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:5201/api' //Update if backend moves to a different port or host
};