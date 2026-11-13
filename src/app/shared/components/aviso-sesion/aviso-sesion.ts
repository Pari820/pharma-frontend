import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth-service';

@Component({
  selector: 'app-aviso-sesion',
  standalone: true,
  templateUrl: './aviso-sesion.html',
  styleUrl: './aviso-sesion.css'
})
export class AvisoSesion {
  readonly auth = inject(AuthService);

  readonly tiempoRestante = computed(() => {
    const segundos = this.auth.segundosRestantes();

    const minutos = Math.floor(segundos / 60);
    const resto = segundos % 60;

    return `${String(minutos).padStart(2, '0')}:${String(resto).padStart(2, '0')}`;
  });

  cerrarSesion(): void {
    this.auth.cerrarSesion();
  }

  ocultarAviso(): void {
    this.auth.ocultarAviso();
  }
}