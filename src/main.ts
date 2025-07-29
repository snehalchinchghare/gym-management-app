import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { appConfig } from './app/app.config';
import { ErrorHandler, isDevMode } from '@angular/core';
import { GlobalErrorHandler } from './app/features/services/global-error-handler';
import { provideServiceWorker } from '@angular/service-worker';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: true, // Enable in all environments
    }),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    ...(appConfig.providers || []),
    provideServiceWorker('ngsw-worker.js', {
        enabled: !isDevMode(),
        registrationStrategy: 'registerWhenStable:30000'
    })
]
}).catch((err) => console.error(err));
