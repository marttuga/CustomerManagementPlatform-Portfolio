import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Bootstrap the root application component with the global configuration
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));