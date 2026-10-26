
import { Component, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth-service';
import { mensajeError } from '../../../../core/utils/http-error';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // Página solicitada antes del inicio de sesión.
  readonly returnUrl = input<string>();

  // Indica si la sesión anterior expiró.
  readonly expirada = input<string>();

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly verClave = signal(false);

  // Formulario de inicio de sesión.
  protected readonly form = this.fb.group({
    username: [
      '',
      [Validators.required, Validators.maxLength(50)]
    ],
    password: [
      '',
      [Validators.required, Validators.maxLength(72)]
    ]
  });

  ingresar(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.error.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({

      next: () => {
        this.router.navigateByUrl(this.destino());
      },

      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        this.form.controls.password.reset();

        // No revelar si falló el usuario o la contraseña.
        this.error.set(
          err.status === 401
            ? 'Usuario o contraseña incorrectos'
            : mensajeError(err)
        );
      }
    });
  }

  // Solo permite redirecciones internas de PharmaSoft.
  private destino(): string {
    const url = this.returnUrl();

    return url &&
      url.startsWith('/') &&
      !url.startsWith('//')
        ? url
        : '/inicio';
  }
}
