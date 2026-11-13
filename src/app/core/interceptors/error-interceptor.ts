import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth-service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {

      const body = err.error as { requestId?: string } | null;

      const requestId =
        body?.requestId || err.headers.get('X-Request-Id');

      // Mostrar el codigo de seguimiento al usuario.
      if (
        requestId &&
        (err.status !== 401 || req.url.endsWith('/auth/login'))
      ) {
        window.alert(`Código de seguimiento: ${requestId}`);
      }

      // Mantener el comportamiento de seguridad.
      if (
        err.status === 401 &&
        !req.url.endsWith('/auth/login')
      ) {
        auth.cerrarSesion('expirada', router.url);
      }

      return throwError(() => err);
    })
  );
};