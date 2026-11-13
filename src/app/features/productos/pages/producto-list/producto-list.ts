
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  inject,
  OnInit,
  OnDestroy,
  signal
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../../core/auth/auth-service';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { Paginador } from '../../../../shared/components/paginador/paginador';

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
  imports: [
    RouterLink,
    CurrencyPipe,
    SiPermiso,
    Paginador
  ],
  templateUrl: './producto-list.html',
  styleUrl: './producto-list.css'
})
export class ProductoList implements OnInit, OnDestroy {

  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private rutaSub?: Subscription;
  private cargaSub?: Subscription;

  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(20);
  protected readonly ordenarPor = signal<OrdenProducto>('nombre');
  protected readonly direccion = signal<Direccion>('asc');

  protected readonly resultado =
    signal<PaginaResponse<Producto> | null>(null);

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly categoriaFiltro = signal<number | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  // Ajusta las columnas según el permiso del usuario.
  protected readonly columnas = computed(() =>
    this.auth.tienePermiso('CATALOGO_ESCRIBIR') ? 6 : 5
  );

  // Filtra los productos por categoría.
  protected readonly productos = computed(() => {
    const lista = this.resultado()?.contenido ?? [];
    const filtro = this.categoriaFiltro();

    if (filtro === null) {
      return lista;
    }

    return lista.filter(
      producto => producto.categoriaId === filtro
    );
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

    this.rutaSub = this.route.queryParamMap.subscribe(params => {
      const p = Number(params.get('pagina') ?? 0);
      const t = Number(params.get('tamanio') ?? 20);
      const orden = params.get('orden');

      this.pagina.set(Number.isInteger(p) && p >= 0 ? p : 0);
      this.tamanio.set([10, 20, 50].includes(t) ? t : 20);
      this.ordenarPor.set(
        orden === 'precio' || orden === 'stock' ? orden : 'nombre'
      );
      this.direccion.set(params.get('dir') === 'desc' ? 'desc' : 'asc');
      this.cargar();
    });
  }

  ngOnDestroy(): void {
    this.rutaSub?.unsubscribe();
    this.cargaSub?.unsubscribe();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.cargaSub?.unsubscribe();
    this.cargaSub = this.productoService.listar(
      this.pagina(),
      this.tamanio(),
      this.ordenarPor(),
      this.direccion()
    ).subscribe({
      next: respuesta => {
        this.resultado.set(respuesta);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(this.mensajeError(err));
        this.cargando.set(false);
      }
    });
  }

  irA(pagina: number): void {
    const total = this.resultado()?.totalPaginas ?? 0;
    if (pagina < 0 || (total > 0 && pagina >= total)) return;

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pagina },
      queryParamsHandling: 'merge'
    });
  }

  cambiarTamanio(valor: string | number): void {
    const tamanio = Number(valor);
    if (![10, 20, 50].includes(tamanio)) return;

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tamanio, pagina: 0 },
      queryParamsHandling: 'merge'
    });
  }

  ordenar(campo: OrdenProducto): void {
    const dir: Direccion =
      this.ordenarPor() === campo && this.direccion() === 'asc'
        ? 'desc' : 'asc';

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { orden: campo, dir, pagina: 0 },
      queryParamsHandling: 'merge'
    });
  }
  filtrarPorCategoria(valor: string): void {
    this.categoriaFiltro.set(
      valor ? Number(valor) : null
    );
  }

  // Da de baja un producto.
  darDeBaja(producto: Producto): void {
    const confirmado = confirm(
      `¿Dar de baja el producto "${producto.nombre}"?`
    );

    if (!confirmado) {
      return;
    }

    this.productoService.darDeBaja(producto.id).subscribe({
      next: () => {
        const actual = this.resultado();

        if (!actual) {
          return;
        }

        const contenido = actual.contenido.map(p =>
          p.id === producto.id
            ? { ...p, estado: false }
            : p
        );

        this.resultado.set({
          ...actual,
          contenido
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

