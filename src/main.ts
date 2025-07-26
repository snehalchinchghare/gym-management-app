import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { appConfig } from './app/app.config';
import { ErrorHandler } from '@angular/core';
import { GlobalErrorHandler } from './app/features/services/global-error-handler';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    provideRouter(routes),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    ...(appConfig.providers || [])
  ]
}).catch((err) => console.error(err));
