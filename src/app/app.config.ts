import {
  ApplicationConfig,
  LOCALE_ID,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// --- IMPORTS DE LOCALIZAÇÃO (PT-BR) ---
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { MAT_DATE_LOCALE } from '@angular/material/core';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { httpLoaderInterceptor } from './core/interceptors/http-loader.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        httpLoaderInterceptor,
        authInterceptor,
        errorInterceptor,
      ]),
    ),


    { provide: LOCALE_ID, useValue: 'pt-BR' },


    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
  ],
};
