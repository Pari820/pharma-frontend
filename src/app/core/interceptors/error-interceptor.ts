
import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth-service';

/**
 * Interceptor para gestionar errores de seguridad.
 *
 * 401: sesión inválida o expirada.
 * 403: usuario sin permisos suficientes.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {

      // Error 401: cerrar sesión y volver al login.
      // Se excluye /auth/login para mostrar el error
      // de credenciales en el formulario.
      if (
        err.status === 401 &&
        !req.url.endsWith('/auth/login')
      ) {
        auth.cerrarSesion('expirada', router.url);
      }

      // Error 403: mantener la sesión.
      // El componente mostrará el acceso denegado.

      return throwError(() => err);
    })
  );
};
