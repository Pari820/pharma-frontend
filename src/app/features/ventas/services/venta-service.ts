import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { PaginaResponse } from '../../../core/models/pagina-response';

import {
  FiltroVentas,
  Venta,
  VentaRequest
} from '../models/venta.model';

/**
 * Forma real que devuelve actualmente PharmaBackend.
 *
 * La guía usa "fecha", pero este backend devuelve "fechaRegistro".
 */
type VentaBackend = Omit<Venta, 'fecha'> & {
  fecha?: string;
  fechaRegistro?: string;
};

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  private readonly http = inject(HttpClient);

  private readonly url =
    `${environment.apiUrl}/ventas`;

  /**
   * Convierte la respuesta real del backend
   * al modelo Venta usado por el frontend.
   */
  private normalizarVenta(
    venta: VentaBackend
  ): Venta {

    return {
      id: venta.id,

      fecha:
        venta.fecha ??
        venta.fechaRegistro ??
        '',

      clienteId:
        venta.clienteId,

      clienteNombre:
        venta.clienteNombre,

      estado:
        venta.estado,

      total:
        venta.total,

      detalles:
        venta.detalles,
    };
  }

  // =========================================================
  // REGISTRAR
  // =========================================================

  registrar(
    dto: VentaRequest
  ): Observable<Venta> {

    return this.http
      .post<VentaBackend>(
        this.url,
        dto
      )
      .pipe(
        map(
          venta =>
            this.normalizarVenta(venta)
        )
      );
  }

  // =========================================================
  // OBTENER POR ID
  // =========================================================

  obtener(
    id: number
  ): Observable<Venta> {

    return this.http
      .get<VentaBackend>(
        `${this.url}/${id}`
      )
      .pipe(
        map(
          venta =>
            this.normalizarVenta(venta)
        )
      );
  }

  // =========================================================
  // BUSCAR VENTAS
  // =========================================================

  buscar(
    filtro: FiltroVentas,
    pagina: number,
    tamanio: number
  ): Observable<PaginaResponse<Venta>> {

    let params =
      new HttpParams()
        .set(
          'pagina',
          pagina
        )
        .set(
          'tamanio',
          tamanio
        )
        .set(
          'ordenarPor',
          'fecha'
        )
        .set(
          'direccion',
          'desc'
        );

    /*
     * Solo se envían los filtros
     * que realmente tienen valor.
     */
    if (filtro.clienteId) {

      params =
        params.set(
          'clienteId',
          filtro.clienteId
        );
    }

    if (filtro.estado) {

      params =
        params.set(
          'estado',
          filtro.estado
        );
    }

    if (filtro.desde) {

      params =
        params.set(
          'desde',
          filtro.desde
        );
    }

    if (filtro.hasta) {

      params =
        params.set(
          'hasta',
          filtro.hasta
        );
    }

    /*
     * El backend actual puede devolver:
     *
     * 1) un arreglo:
     *    [ {...}, {...} ]
     *
     * o
     *
     * 2) una respuesta paginada:
     *    { contenido: [...], pagina: ... }
     *
     * Aceptamos ambas.
     */
    return this.http
      .get<
        VentaBackend[] |
        PaginaResponse<VentaBackend>
      >(
        `${this.url}/buscar`,
        { params }
      )
      .pipe(

        map(respuesta => {

          // =============================================
          // CASO REAL DE TU BACKEND: DEVUELVE UN ARRAY
          // =============================================

          if (
            Array.isArray(respuesta)
          ) {

            const todas =
              respuesta.map(
                venta =>
                  this.normalizarVenta(
                    venta
                  )
              );

            /*
             * Hacemos la paginación en el frontend,
             * ya que este backend devuelve directamente
             * el arreglo.
             */
            const inicio =
              pagina * tamanio;

            const fin =
              inicio + tamanio;

            const contenido =
              todas.slice(
                inicio,
                fin
              );

            const totalElementos =
              todas.length;

            const totalPaginas =
              Math.max(
                1,
                Math.ceil(
                  totalElementos /
                  tamanio
                )
              );

            return {
              contenido,
              pagina,
              tamanio,
              totalElementos,
              totalPaginas,
              ultima:
                pagina >=
                totalPaginas - 1,
            };
          }

          // =============================================
          // CASO PAGINADO DE LA GUÍA
          // =============================================

          return {
            contenido:
              respuesta.contenido.map(
                venta =>
                  this.normalizarVenta(
                    venta
                  )
              ),

            pagina:
              respuesta.pagina,

            tamanio:
              respuesta.tamanio,

            totalElementos:
              respuesta.totalElementos,

            totalPaginas:
              respuesta.totalPaginas,

            ultima:
              respuesta.ultima,
          };
        })
      );
  }
}