
import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  Permiso,
  Sesion
} from './auth.model';

const CLAVE_SESION = 'pharmasoft.sesion';

export type PerfilUsuario = Pick<
  Sesion,
  'username' | 'nombreCompleto' | 'roles' | 'permisos'
>;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly url = `${environment.apiUrl}/auth`;

  private readonly sesionActual = signal<Sesion | null>(
    this.leerSesionGuardada()
  );

  private temporizador?: ReturnType<typeof setTimeout>;
  private intervalo?: ReturnType<typeof setInterval>;

  readonly sesion = this.sesionActual.asReadonly();

  readonly autenticado = computed(
    () => this.sesionActual() !== null
  );

  // Tiempo restante de sesión en segundos.
  readonly segundosRestantes = signal(0);

  // El aviso aparece cuando quedan dos minutos o menos.
  readonly porVencer = computed(
    () =>
      this.autenticado() &&
      this.segundosRestantes() > 0 &&
      this.segundosRestantes() <= 120
  );

  // Permite ocultar el aviso durante la sesión actual.
  readonly avisoOculto = signal(false);

  constructor() {
    const sesion = this.sesionActual();

    if (sesion) {
      this.programarExpiracion(sesion);
    }
  }

  login(credenciales: LoginRequest): Observable<Sesion> {
    return this.http
      .post<LoginResponse>(`${this.url}/login`, credenciales)
      .pipe(
        map(r => ({
          token: r.token,
          expiraEn: Date.now() + r.expiraEnSegundos * 1000,
          username: r.username,
          nombreCompleto: r.nombreCompleto,
          roles: r.roles,
          permisos: r.permisos
        })),
        tap(sesion => this.iniciar(sesion))
      );
  }

  // Obtiene el perfil real desde PharmaBackend.
  obtenerPerfil(): Observable<PerfilUsuario> {
    return this.http.get<PerfilUsuario>(
      `${this.url}/me`
    );
  }

  cerrarSesion(
    motivo?: 'expirada',
    volverA?: string
  ): void {
    this.limpiarTemporizadores();

    sessionStorage.removeItem(CLAVE_SESION);

    this.sesionActual.set(null);
    this.segundosRestantes.set(0);
    this.avisoOculto.set(false);

    const queryParams: Record<string, string> = {};

    if (motivo) {
      queryParams['expirada'] = '1';
    }

    if (volverA && volverA !== '/login') {
      queryParams['returnUrl'] = volverA;
    }

    this.router.navigate(['/login'], {
      queryParams
    });
  }

  token(): string | null {
    const sesion = this.sesionActual();

    return sesion && Date.now() < sesion.expiraEn
      ? sesion.token
      : null;
  }

  tienePermiso(permiso: Permiso): boolean {
    return this.sesionActual()
      ?.permisos.includes(permiso) ?? false;
  }

  // Oculta el aviso hasta el siguiente inicio de sesión.
  ocultarAviso(): void {
    this.avisoOculto.set(true);
  }

  private iniciar(sesion: Sesion): void {
    sessionStorage.setItem(
      CLAVE_SESION,
      JSON.stringify(sesion)
    );

    this.sesionActual.set(sesion);
    this.avisoOculto.set(false);

    this.programarExpiracion(sesion);
  }

  private actualizarSegundos(sesion: Sesion): void {
    const segundos = Math.max(
      0,
      Math.floor((sesion.expiraEn - Date.now()) / 1000)
    );

    this.segundosRestantes.set(segundos);
  }

  private programarExpiracion(sesion: Sesion): void {
    this.limpiarTemporizadores();

    const restante = Math.max(
      sesion.expiraEn - Date.now(),
      0
    );

    this.actualizarSegundos(sesion);

    // Actualiza la cuenta regresiva cada segundo.
    this.intervalo = setInterval(() => {
      this.actualizarSegundos(sesion);
    }, 1000);

    // Conserva el cierre automático de sesión.
    this.temporizador = setTimeout(() => {
      this.cerrarSesion(
        'expirada',
        this.router.url
      );
    }, restante);
  }

  private limpiarTemporizadores(): void {
    if (this.temporizador !== undefined) {
      clearTimeout(this.temporizador);
      this.temporizador = undefined;
    }

    if (this.intervalo !== undefined) {
      clearInterval(this.intervalo);
      this.intervalo = undefined;
    }
  }

  private leerSesionGuardada(): Sesion | null {
    try {
      const texto = sessionStorage.getItem(CLAVE_SESION);

      if (!texto) {
        return null;
      }

      const sesion = JSON.parse(texto) as Sesion;

      if (
        !sesion ||
        !sesion.token ||
        Date.now() >= sesion.expiraEn
      ) {
        sessionStorage.removeItem(CLAVE_SESION);
        return null;
      }

      return sesion;
    } catch {
      sessionStorage.removeItem(CLAVE_SESION);
      return null;
    }
  }
}
