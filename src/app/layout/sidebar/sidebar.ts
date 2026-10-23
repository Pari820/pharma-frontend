
import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MENU } from '../../core/config/menu';
import { AuthService } from '../../core/auth/auth-service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  private readonly auth = inject(AuthService);

  /**
   * Muestra únicamente los módulos para los
   * que el usuario tiene permisos.
   *
   * Se actualiza automáticamente cuando
   * cambia la sesión.
   */
  protected readonly menu = computed(() =>
    MENU.filter(
      item =>
        !item.permiso ||
        this.auth.tienePermiso(item.permiso)
    )
  );

}
