
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth-service';

/**
 * Agrega el token JWT a las peticiones del backend.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  // No agregar token si no existe, si es otra API
  // o si la petición corresponde al login.
  if (
    !token ||
    !req.url.startsWith(environment.apiUrl) ||
    req.url.endsWith('/auth/login')
  ) {
    return next(req);
  }

  // Agregar Authorization: Bearer TOKEN
  const requestAutenticada = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(requestAutenticada);
};
