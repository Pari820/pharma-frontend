import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginaResponse } from '../../../core/models/pagina-response';
import { Direccion, OrdenProducto, Producto, ProductoRequest } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/productos`;

  listar(
    pagina: number,
    tamanio: number,
    ordenarPor: OrdenProducto,
    direccion: Direccion
  ): Observable<PaginaResponse<Producto>> {
    const params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio)
      .set('ordenarPor', ordenarPor)
      .set('direccion', direccion);

    // Soporta tanto el backend de la guía (paginado)
    // como el backend que devuelve un arreglo directo.
    return this.http
      .get<PaginaResponse<Producto> | Producto[]>(this.url, { params })
      .pipe(
        map(respuesta => {
          if (!Array.isArray(respuesta)) {
            return respuesta;
          }

          const ordenados = [...respuesta].sort((a, b) => {
            const av = a[ordenarPor];
            const bv = b[ordenarPor];

            if (typeof av === 'string' && typeof bv === 'string') {
              return av.localeCompare(bv, 'es', { sensitivity: 'base' });
            }
            return Number(av) - Number(bv);
          });

          if (direccion === 'desc') {
            ordenados.reverse();
          }

          const totalElementos = ordenados.length;
          const totalPaginas = Math.max(1, Math.ceil(totalElementos / tamanio));
          const inicio = pagina * tamanio;
          const contenido = ordenados.slice(inicio, inicio + tamanio);

          return {
            contenido,
            pagina,
            tamanio,
            totalElementos,
            totalPaginas,
            ultima: pagina >= totalPaginas - 1
          };
        })
      );
  }

  obtener(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.url}/${id}`);
  }

  crear(dto: ProductoRequest): Observable<Producto> {
    return this.http.post<Producto>(this.url, dto);
  }

  actualizar(id: number, dto: ProductoRequest): Observable<Producto> {
    return this.http.put<Producto>(`${this.url}/${id}`, dto);
  }

  darDeBaja(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
