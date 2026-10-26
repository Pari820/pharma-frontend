
import { Routes } from '@angular/router';

import { MainLayout } from './layout/main-layout/main-layout';

import {
  authGuard,
  invitadoGuard
} from './core/guards/auth-guard';

import { permisoGuard } from './core/guards/permiso-guard';

export const routes: Routes = [

  // LOGIN
  {
    path: 'login',
    title: 'Iniciar sesión',
    canActivate: [invitadoGuard],
    loadComponent: () =>
      import('./features/auth/pages/login/login')
        .then(m => m.Login)
  },

  // RUTAS PROTEGIDAS
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],

    children: [

      // REDIRECCIÓN INICIAL
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'inicio'
      },

      // INICIO
      {
        path: 'inicio',
        title: 'Inicio',
        loadComponent: () =>
          import('./features/inicio/inicio')
            .then(m => m.Inicio)
      },

      // MI CUENTA
      {
        path: 'mi-cuenta',
        title: 'Mi cuenta',
        loadComponent: () =>
          import('./features/auth/pages/mi-cuenta/mi-cuenta')
            .then(m => m.MiCuenta)
      },

      // CATEGORÍAS
      {
        path: 'categorias',
        canActivate: [permisoGuard],
        data: {
          permiso: 'CATALOGO_LEER'
        },
        loadChildren: () =>
          import('./features/categorias/categorias.routes')
            .then(m => m.CATEGORIAS_ROUTES)
      },

      // PRODUCTOS
      {
        path: 'productos',
        canActivate: [permisoGuard],
        data: {
          permiso: 'CATALOGO_LEER'
        },
        loadChildren: () =>
          import('./features/productos/productos.routes')
            .then(m => m.PRODUCTOS_ROUTES)
      },

      // CLIENTES
      {
        path: 'clientes',
        canActivate: [permisoGuard],
        data: {
          permiso: 'CLIENTES_LEER'
        },
        loadChildren: () =>
          import('./features/clientes/clientes.routes')
            .then(m => m.CLIENTES_ROUTES)
      },

      // VENTAS
      {
        path: 'ventas',
        canActivate: [permisoGuard],
        data: {
          permiso: 'VENTAS_LEER'
        },
        loadChildren: () =>
          import('./features/ventas/ventas.routes')
            .then(m => m.VENTAS_ROUTES)
      },

      // REPORTES
      {
        path: 'reportes',
        canActivate: [permisoGuard],
        data: {
          permiso: 'REPORTES_VER'
        },
        loadChildren: () =>
          import('./features/reportes/reportes.routes')
            .then(m => m.REPORTES_ROUTES)
      },

      // ACCESO DENEGADO
      {
        path: 'acceso-denegado',
        title: 'Acceso denegado',
        loadComponent: () =>
          import('./shared/pages/acceso-denegado/acceso-denegado')
            .then(m => m.AccesoDenegado)
      }

    ]
  },

  // PÁGINA NO ENCONTRADA
  {
    path: '**',
    title: 'Página no encontrada',
    loadComponent: () =>
      import('./shared/pages/no-encontrado/no-encontrado')
        .then(m => m.NoEncontrado)
  }

];
