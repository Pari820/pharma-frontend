
import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';

import { Permiso } from '../../core/auth/auth.model';
import { AuthService } from '../../core/auth/auth-service';

/**
 * Directiva que muestra elementos únicamente
 * cuando el usuario tiene el permiso requerido.
 *
 * Ejemplo:
 * <a *appSiPermiso="'CATALOGO_ESCRIBIR'">
 *   Nuevo producto
 * </a>
 */
@Directive({
  selector: '[appSiPermiso]'
})
export class SiPermiso {

  private readonly auth = inject(AuthService);

  private readonly plantilla = inject(TemplateRef);

  private readonly contenedor = inject(ViewContainerRef);

  private visible = false;

  readonly appSiPermiso = input.required<Permiso>();

  constructor() {

    effect(() => {

      const permitido = this.auth.tienePermiso(
        this.appSiPermiso()
      );

      if (permitido && !this.visible) {

        // Mostrar el elemento.
        this.contenedor.createEmbeddedView(
          this.plantilla
        );

        this.visible = true;

      } else if (!permitido && this.visible) {

        // Ocultar el elemento.
        this.contenedor.clear();

        this.visible = false;
      }

    });
  }
}
