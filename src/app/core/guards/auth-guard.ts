
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth-service';

/**
 * Protege las rutas que requieren iniciar sesión.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);

  if (auth.autenticado()) {
    return true;
  }

  return inject(Router).createUrlTree(['/login'], {
    queryParams: {
      returnUrl: state.url
    }
  });
};

/**
 * Impide que un usuario autenticado
 * vuelva a la pantalla de login.
 */
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);

  return auth.autenticado()
    ? inject(Router).createUrlTree(['/inicio'])
    : true;
};
