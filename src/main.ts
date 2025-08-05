import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { appConfig } from './app/app.config';
import { ErrorHandler, isDevMode } from '@angular/core';
import { GlobalErrorHandler } from './app/features/services/global-error-handler';
import { provideServiceWorker, SwUpdate } from '@angular/service-worker';
import { ConfirmationService } from 'primeng/api';

// ✅ Patch console.error to suppress NavigatorLockAcquireTimeoutError
const originalConsoleError = console.error;
console.error = function (...args) {
  const firstArg = args?.[0];

  // Convert the first argument to a string safely
  let msg = '';
  if (firstArg instanceof Error) {
    msg = firstArg.message;
  } else if (typeof firstArg === 'string') {
    msg = firstArg;
  } else if (firstArg?.toString) {
    msg = firstArg.toString();
  }

  // Check if the message contains the specific lock error
  if (msg.includes('Acquiring an exclusive Navigator LockManager lock')) {
    return; // Suppress this known error
  }
  originalConsoleError.apply(console, args);
};

// Optional: Also patch console.warn
const originalConsoleWarn = console.warn;
console.warn = function (...args) {
  const firstArg = args?.[0];

  // Convert the first argument to a string safely
  let msg = '';
  if (firstArg instanceof Error) {
    msg = firstArg.message;
  } else if (typeof firstArg === 'string') {
    msg = firstArg;
  } else if (firstArg?.toString) {
    msg = firstArg.toString();
  }

  // Check if the message contains the specific lock error
  if (msg.includes('Acquiring an exclusive Navigator LockManager lock')) {
    return; // Suppress this known error
  }
  originalConsoleWarn.apply(console, args);
};

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    provideRouter(routes),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    ...(appConfig.providers || []),
    provideServiceWorker('ngsw-worker.js', {
        registrationStrategy: 'registerWhenStable:30000'
    }),
    ConfirmationService
]
})
.catch((err) => console.error(err));
