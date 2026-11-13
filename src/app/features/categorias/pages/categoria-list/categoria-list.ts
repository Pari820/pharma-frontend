
import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { Categoria } from '../../models/categoria.model';
import { CategoriaService } from '../../services/categoria-service';
import { mensajeError } from '../../../../core/utils/http-error';

import { AuthService } from '../../../../core/auth/auth-service';
import { SiPermiso } from '../../../../shared/directives/si-permiso';

@Component({
  selector: 'app-categoria-list',
  imports: [RouterLink, SiPermiso],
  templateUrl: './categoria-list.html',
  styleUrl: './categoria-list.css'
})
export class CategoriaList implements OnInit {

  private readonly categoriaService = inject(CategoriaService);
  private readonly auth = inject(AuthService);

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly filtro = signal('');

  // Cantidad de columnas según los permisos.
  protected readonly columnas = computed(() =>
    this.auth.tienePermiso('CATALOGO_ESCRIBIR') ? 5 : 4
  );

  // Mantiene la búsqueda por nombre.
  protected readonly filtradas = computed(() => {
    const texto = this.filtro().trim().toLowerCase();

    return this.categorias().filter(c =>
      c.nombre.toLowerCase().includes(texto)
    );
  });

  ngOnInit(): void {
    this.cargar();
  }

  // Consulta las categorías del backend.
  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.categoriaService.listar().subscribe({
      next: datos => {
        this.categorias.set(datos);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      }
    });
  }

  // Elimina una categoría si el usuario tiene permiso.
  eliminar(categoria: Categoria): void {

    if (!this.auth.tienePermiso('CATALOGO_ESCRIBIR')) {
      this.error.set(
        'No tiene permiso para eliminar categorías.'
      );
      return;
    }

    const confirmado = confirm(
      `¿Eliminar la categoría "${categoria.nombre}"?`
    );

    if (!confirmado) {
      return;
    }

    this.categoriaService.eliminar(categoria.id).subscribe({
      next: () => {
        this.categorias.update(lista =>
          lista.filter(c => c.id !== categoria.id)
        );
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
      }
    });
  }
}
