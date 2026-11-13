
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Permiso } from '../auth/auth.model';
import { AuthService } from '../auth/auth-service';

/**
 * Verifica que el usuario tenga el permiso
 * necesario para acceder a una ruta.
 */
export const permisoGuard: CanActivateFn = (route) => {
  const permiso = route.data['permiso'] as Permiso | undefined;

  const auth = inject(AuthService);

  if (!permiso || auth.tienePermiso(permiso)) {
    return true;
  }

  // Si no tiene permiso, mostrar acceso denegado.
  return inject(Router).createUrlTree([
    '/acceso-denegado'
  ]);
};
