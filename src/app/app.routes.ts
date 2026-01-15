import { Routes } from '@angular/router';
import { MainPage } from './pages/main-page/main-page'; // Ajusta las rutas de importación
import { GenerationDataPage } from './pages/generation-data-page/generation-data-page';
import { FacturaPage } from './pages/factura-page/factura-page';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: MainPage },
  { path: 'generar', component: GenerationDataPage },
  { path: 'factura', component: FacturaPage },
  { path: '**', redirectTo: 'dashboard' } // Comodín para errores
];
