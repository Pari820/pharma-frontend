import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mensajeError } from '../../../../core/utils/http-error';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { Cliente } from '../../models/cliente.model';
import {
  ClienteService,
  DireccionOrden,
  OrdenCliente,
} from '../../services/cliente-service';

@Component({
  selector: 'app-cliente-list',
  imports: [RouterLink],
  templateUrl: './cliente-list.html',
  styleUrl: './cliente-list.css',
})
export class ClienteList implements OnInit {
  private readonly clienteService = inject(ClienteService);

  protected readonly pagina = signal<PaginaResponse<Cliente> | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly filtro = signal('');

  protected readonly paginaActual = signal(0);
  protected readonly tamanio = signal(10);
  protected readonly ordenarPor = signal<OrdenCliente>('apellidos');
  protected readonly direccion = signal<DireccionOrden>('asc');
  private readonly ordenTocado = signal(false);

  protected readonly clientesFiltrados = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    const clientes = this.pagina()?.contenido ?? [];

    if (!texto) {
      return clientes;
    }

    return clientes.filter(cliente => {
      const nombreCompleto = `${cliente.nombres} ${cliente.apellidos}`.toLowerCase();
      const apellidoNombre = `${cliente.apellidos} ${cliente.nombres}`.toLowerCase();
      return (
        cliente.dni.toLowerCase().includes(texto) ||
        nombreCompleto.includes(texto) ||
        apellidoNombre.includes(texto)
      );
    });
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.clienteService
      .listar(
        this.paginaActual(),
        this.tamanio(),
        this.ordenarPor(),
        this.direccion()
      )
      .subscribe({
        next: respuesta => {
          this.pagina.set(respuesta);
          this.paginaActual.set(respuesta.pagina);
          this.cargando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(mensajeError(err));
          this.cargando.set(false);
        },
      });
  }

  protected cambiarTamanio(event: Event): void {
    const valor = Number((event.target as HTMLSelectElement).value);
    this.tamanio.set(valor);
    this.paginaActual.set(0);
    this.cargar();
  }

  protected anterior(): void {
    if (this.paginaActual() === 0) {
      return;
    }

    this.paginaActual.update(valor => valor - 1);
    this.cargar();
  }

  protected siguiente(): void {
    if (this.pagina()?.ultima ?? true) {
      return;
    }

    this.paginaActual.update(valor => valor + 1);
    this.cargar();
  }

  protected ordenar(campo: 'dni' | 'apellidos'): void {
    if (!this.ordenTocado() || this.ordenarPor() !== campo) {
      this.ordenarPor.set(campo);
      this.direccion.set('asc');
      this.ordenTocado.set(true);
    } else {
      this.direccion.update(valor => (valor === 'asc' ? 'desc' : 'asc'));
    }

    this.paginaActual.set(0);
    this.cargar();
  }

  protected indicadorOrden(campo: 'dni' | 'apellidos'): string {
    if (this.ordenarPor() !== campo || !this.ordenTocado()) {
      return '';
    }

    return this.direccion() === 'asc' ? ' ↑' : ' ↓';
  }

  protected darDeBaja(cliente: Cliente): void {
    if (!confirm(`¿Dar de baja al cliente "${cliente.nombres} ${cliente.apellidos}"?`)) {
      return;
    }

    this.error.set(null);

    this.clienteService.eliminar(cliente.id).subscribe({
      next: () => this.cargar(),
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
  }
}
