import { Routes } from '@angular/router';

export const REPORTES_ROUTES: Routes = [
  {
    path: 'ventas-por-categoria',
    loadComponent: () =>
      import('./pages/ventas-categoria/ventas-categoria')
        .then(m => m.VentasCategoria),
    title: 'Reporte de ventas por categoría'
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'ventas-por-categoria'
  }
];