import { Routes } from '@angular/router';
import { MainPage } from './pages/main-page/main-page'; // Ajusta las rutas de importación
import { GenerationDataPage } from './pages/generation-data-page/generation-data-page';
import { FacturaPage } from './pages/factura-page/factura-page';
import { ArticulosPage } from './pages/articulos-page/articulos-page';
import { ClientesPage } from './pages/clientes-page/clientes-page';
import { FacturasPage } from './pages/facturas-page/facturas-page';
import { GraficosPage } from './pages/graficos-page/graficos-page';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: MainPage },
  { path: 'generar', component: GenerationDataPage },
  { path: 'factura', component: FacturaPage },
  { path: 'articulos', component: ArticulosPage },
  { path: 'clientes', component: ClientesPage },
  { path: 'facturas', component: FacturasPage },
  { path: 'graficos', component: GraficosPage },
  { path: '**', redirectTo: 'dashboard' } // Comodín para errores
];
