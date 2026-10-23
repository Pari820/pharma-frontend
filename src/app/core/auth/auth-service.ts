
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

  readonly sesion = this.sesionActual.asReadonly();

  readonly autenticado = computed(
    () => this.sesionActual() !== null
  );

  constructor() {
    const sesion = this.sesionActual();

    if (sesion) {
      this.programarExpiracion(sesion);
    }
  }

  /** Inicia sesión utilizando el backend. */
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

  /** Cierra la sesión y vuelve al login. */
  cerrarSesion(
    motivo?: 'expirada',
    volverA?: string
  ): void {
    clearTimeout(this.temporizador);

    sessionStorage.removeItem(CLAVE_SESION);

    this.sesionActual.set(null);

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

  /** Devuelve el token si todavía está vigente. */
  token(): string | null {
    const sesion = this.sesionActual();

    return sesion && Date.now() < sesion.expiraEn
      ? sesion.token
      : null;
  }

  /** Comprueba si el usuario tiene un permiso. */
  tienePermiso(permiso: Permiso): boolean {
    return this.sesionActual()
      ?.permisos.includes(permiso) ?? false;
  }

  /** Guarda la sesión en memoria y en el navegador. */
  private iniciar(sesion: Sesion): void {
    sessionStorage.setItem(
      CLAVE_SESION,
      JSON.stringify(sesion)
    );

    this.sesionActual.set(sesion);

    this.programarExpiracion(sesion);
  }

  /** Programa el cierre automático de la sesión. */
  private programarExpiracion(sesion: Sesion): void {
    clearTimeout(this.temporizador);

    const restante = sesion.expiraEn - Date.now();

    this.temporizador = setTimeout(
      () => this.cerrarSesion(
        'expirada',
        this.router.url
      ),
      Math.max(restante, 0)
    );
  }

  /** Recupera la sesión después de actualizar la página. */
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
