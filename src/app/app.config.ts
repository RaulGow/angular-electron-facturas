import { ApplicationConfig, provideBrowserGlobalErrorListeners, LOCALE_ID } from '@angular/core';
import { provideRouter, withHashLocation  } from '@angular/router';
import { routes } from './app.routes';

// --- PASO 1: Importar funciones y datos de idioma ---
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

// Registramos los datos de idioma español
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()),
    { provide: LOCALE_ID, useValue: 'es-ES' },
  ]
};
