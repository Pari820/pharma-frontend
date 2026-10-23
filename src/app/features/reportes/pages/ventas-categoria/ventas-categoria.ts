import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { VentaPorCategoria } from '../../models/reporte.model';
import { ReporteService } from '../../services/reporte-service';

@Component({
  selector: 'app-ventas-categoria',
  standalone: true,
  imports: [
    FormsModule,
    CurrencyPipe
  ],
  templateUrl: './ventas-categoria.html',
  styleUrl: './ventas-categoria.css'
})
export class VentasCategoria implements OnInit {
  private readonly reporteService = inject(ReporteService);

  desde = '';
  hasta = '';

  readonly datos = signal<VentaPorCategoria[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');

  readonly totalUnidades = computed(() =>
    this.datos().reduce(
      (total, item) => total + item.cantidadVendida,
      0
    )
  );

  readonly montoGeneral = computed(() =>
    this.datos().reduce(
      (total, item) => total + item.montoTotal,
      0
    )
  );

  readonly montoMayor = computed(() => {
    const montos = this.datos().map(item => item.montoTotal);

    return montos.length > 0
      ? Math.max(...montos)
      : 0;
  });

  ngOnInit(): void {
    this.generar();
  }

  generar(): void {
    this.error.set('');

    if (
      this.desde &&
      this.hasta &&
      this.desde > this.hasta
    ) {
      this.error.set(
        'La fecha desde no puede ser posterior a la fecha hasta.'
      );
      this.datos.set([]);
      return;
    }

    this.cargando.set(true);

    this.reporteService
      .ventasPorCategoria(
        this.desde || null,
        this.hasta || null
      )
      .pipe(
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: respuesta => {
          this.datos.set(respuesta);
        },
        error: err => {
          const mensaje =
            err?.error?.message ??
            err?.error?.mensaje ??
            'No se pudo generar el reporte de ventas por categoría.';

          this.error.set(mensaje);
          this.datos.set([]);
        }
      });
  }

  limpiar(): void {
    this.desde = '';
    this.hasta = '';
    this.generar();
  }

  porcentaje(monto: number): number {
    const mayor = this.montoMayor();

    if (mayor <= 0) {
      return 0;
    }

    return (monto / mayor) * 100;
  }
}