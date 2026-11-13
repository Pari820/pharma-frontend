
import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { PaginaResponse } from '../../../../core/models/pagina-response';
import { mensajeError } from '../../../../core/utils/http-error';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { Paginador } from '../../../../shared/components/paginador/paginador';

import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente-service';

import {
  EstadoVenta,
  FiltroVentas,
  Venta
} from '../../models/venta.model';

import { VentaService } from '../../services/venta-service';

@Component({
  selector: 'app-venta-list',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CurrencyPipe,
    DatePipe,
    SiPermiso,
    Paginador
  ],
  templateUrl: './venta-list.html',
  styleUrl: './venta-list.css'
})
export class VentaList implements OnInit {

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly ventaService = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly resultado = signal<PaginaResponse<Venta> | null>(null);
  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(10);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly filtros = this.fb.group({
    clienteId: this.fb.control<number | null>(null),
    estado: this.fb.control<EstadoVenta | null>(null),
    desde: this.fb.control<string | null>(null),
    hasta: this.fb.control<string | null>(null)
  });

  protected readonly ahora = signal(new Date());

  // Calcula el total de las ventas registradas.
  protected readonly totalPagina = computed(() =>
    (this.resultado()?.contenido ?? [])
      .filter(v => v.estado === 'REGISTRADA')
      .reduce((suma, v) => suma + v.total, 0)
  );

  // Genera el resumen de los filtros utilizados.
  protected resumenFiltros(): string {
    const f = this.filtros.getRawValue();

    const cliente = this.clientes().find(
      c => c.id === f.clienteId
    );

    const partes = [
      cliente
        ? `cliente ${cliente.apellidos}, ${cliente.nombres}`
        : '',
      f.estado ? `estado ${f.estado}` : '',
      f.desde ? `desde ${f.desde}` : '',
      f.hasta ? `hasta ${f.hasta}` : ''
    ].filter(Boolean);

    return partes.length
      ? partes.join(' · ')
      : 'ninguno (todas las ventas)';
  }

  // Imprime el resultado de la consulta.
  imprimirConsulta(): void {
    this.ahora.set(new Date());
    setTimeout(() => window.print());
  }

  ngOnInit(): void {
    this.clienteService.listar(0, 100).subscribe({
      next: p => this.clientes.set(p.contenido),
      error: (err: HttpErrorResponse) =>
        this.error.set(mensajeError(err))
    });

    this.route.queryParamMap.subscribe(params => {
      const p = Number(params.get('pagina') ?? 0);
      const t = Number(params.get('tamanio') ?? 10);

      this.pagina.set(Number.isInteger(p) && p >= 0 ? p : 0);
      this.tamanio.set([10, 20, 50].includes(t) ? t : 10);
      this.cargar();
    });
  }

  // Busca ventas con los filtros seleccionados.
  buscar(): void {
    const { desde, hasta } = this.filtros.getRawValue();

    if (desde && hasta && desde > hasta) {
      this.error.set(
        'La fecha «desde» no puede ser posterior a la fecha «hasta».'
      );
      return;
    }

    this.pagina.set(0);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pagina: 0 },
      queryParamsHandling: 'merge'
    }).then(() => this.cargar());
  }

  // Limpia los filtros.
  limpiar(): void {
    this.filtros.reset();
    this.buscar();
  }

  // Cambia de página.
  irA(pagina: number): void {
    if (pagina < 0 || pagina >= (this.resultado()?.totalPaginas ?? 0)) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pagina },
      queryParamsHandling: 'merge'
    });
  }

  cambiarTamanio(tamanio: number): void {
    if (![10, 20, 50].includes(tamanio)) return;

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pagina: 0, tamanio },
      queryParamsHandling: 'merge'
    });
  }

  // Consulta las ventas desde el backend.
  private cargar(): void {
    const filtro: FiltroVentas = this.filtros.getRawValue();

    this.cargando.set(true);
    this.error.set(null);

    this.ventaService.buscar(
      filtro,
      this.pagina(),
      this.tamanio()
    ).subscribe({
      next: r => {
        this.resultado.set(r);
        this.cargando.set(false);
      },

      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      }
    });
  }
}

