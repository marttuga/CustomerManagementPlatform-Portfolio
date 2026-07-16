import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { errorInterceptor } from './errorInterceptor/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      // Scrolls to the top of the page on every route navigation
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled'
      })
    ),
    // Registers the global HTTP error interceptor for all API calls
    provideHttpClient(withInterceptors([errorInterceptor]))
  ]
};