import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PaginaResponse } from '../../../../core/models/pagina-response';
import { Categoria } from '../../../categorias/models/categoria.model';
import { CategoriaService } from '../../../categorias/services/categoria-service';
import {
  Direccion,
  OrdenProducto,
  Producto
} from '../../models/producto.model';
import { ProductoService } from '../../services/producto-service';

@Component({
  selector: 'app-producto-list',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './producto-list.html',
  styleUrl: './producto-list.css'
})
export class ProductoList implements OnInit {

  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);

  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(10);
  protected readonly ordenarPor = signal<OrdenProducto>('nombre');
  protected readonly direccion = signal<Direccion>('asc');

  protected readonly resultado =
    signal<PaginaResponse<Producto> | null>(null);

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly categoriaFiltro = signal<number | null>(null);

  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly productos = computed(() => {
    const filtro = this.categoriaFiltro();
    const lista = this.resultado()?.contenido ?? [];

    return filtro === null
      ? lista
      : lista.filter(producto => producto.categoriaId === filtro);
  });

  ngOnInit(): void {
    this.categoriaService.listar().subscribe({
      next: datos => {
        this.categorias.set(datos);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(this.mensajeError(err));
      }
    });

    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.productoService
      .listar(
        this.pagina(),
        this.tamanio(),
        this.ordenarPor(),
        this.direccion()
      )
      .subscribe({
        next: pagina => {
          this.resultado.set(pagina);
          this.cargando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(this.mensajeError(err));
          this.cargando.set(false);
        }
      });
  }

  irA(pagina: number): void {
    if (pagina < 0) {
      return;
    }

    this.pagina.set(pagina);
    this.cargar();
  }

  cambiarTamanio(valor: string): void {
    this.tamanio.set(Number(valor));
    this.irA(0);
  }

  ordenar(campo: OrdenProducto): void {
    if (this.ordenarPor() === campo) {
      this.direccion.update(direccion =>
        direccion === 'asc' ? 'desc' : 'asc'
      );
    } else {
      this.ordenarPor.set(campo);
      this.direccion.set('asc');
    }

    this.irA(0);
  }

  filtrarPorCategoria(valor: string): void {
    this.categoriaFiltro.set(
      valor ? Number(valor) : null
    );
  }

  darDeBaja(producto: Producto): void {
    const confirmar = confirm(
      `¿Dar de baja el producto "${producto.nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    this.productoService.darDeBaja(producto.id).subscribe({
      next: () => {
        const actual = this.resultado();

        if (!actual) {
          return;
        }

        const contenidoActualizado = actual.contenido.map(p =>
          p.id === producto.id
            ? {
                ...p,
                estado: false
              }
            : p
        );

        this.resultado.set({
          ...actual,
          contenido: contenidoActualizado
        });
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(this.mensajeError(err));
      }
    });
  }

  private mensajeError(err: HttpErrorResponse): string {
    return (
      err.error?.mensaje ??
      err.error?.message ??
      (typeof err.error === 'string'
        ? err.error
        : null) ??
      `Error ${err.status}: no se pudo completar la operación.`
    );
  }
}