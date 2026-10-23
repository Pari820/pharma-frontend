
import { Component, inject, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, DatePipe],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

  protected readonly auth = inject(AuthService);

  // Permite mostrar u ocultar el menú lateral.
  readonly toggleMenu = output<void>();

  // Cierra la sesión del usuario.
  salir(): void {
    this.auth.cerrarSesion();
  }

}
