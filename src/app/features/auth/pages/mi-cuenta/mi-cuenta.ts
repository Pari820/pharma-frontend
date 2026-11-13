
import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AuthService,
  PerfilUsuario
} from '../../../../core/auth/auth-service';
import { Permiso } from '../../../../core/auth/auth.model';

interface ModuloPermisos {
  nombre: string;
  permisos: {
    codigo: Permiso;
    descripcion: string;
  }[];
}

@Component({
  selector: 'app-mi-cuenta',
  standalone: true,
  templateUrl: './mi-cuenta.html',
  styleUrl: './mi-cuenta.css'
})
export class MiCuenta implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly perfil = signal<PerfilUsuario | null>(null);
  readonly cargando = signal(true);
  readonly error = signal('');

  readonly modulos: ModuloPermisos[] = [
    {
      nombre: 'Catálogo',
      permisos: [
        {
          codigo: 'CATALOGO_LEER',
          descripcion: 'Consultar productos y categorías'
        },
        {
          codigo: 'CATALOGO_ESCRIBIR',
          descripcion: 'Crear, editar y dar de baja'
        }
      ]
    },
    {
      nombre: 'Clientes',
      permisos: [
        {
          codigo: 'CLIENTES_LEER',
          descripcion: 'Consultar clientes'
        },
        {
          codigo: 'CLIENTES_ESCRIBIR',
          descripcion: 'Registrar y modificar clientes'
        }
      ]
    },
    {
      nombre: 'Ventas',
      permisos: [
        {
          codigo: 'VENTAS_LEER',
          descripcion: 'Consultar ventas'
        },
        {
          codigo: 'VENTAS_REGISTRAR',
          descripcion: 'Registrar nuevas ventas'
        }
      ]
    },
    {
      nombre: 'Reportes',
      permisos: [
        {
          codigo: 'REPORTES_VER',
          descripcion: 'Consultar reportes'
        }
      ]
    },
    {
      nombre: 'Usuarios',
      permisos: [
        {
          codigo: 'USUARIOS_ADMINISTRAR',
          descripcion: 'Administrar usuarios'
        }
      ]
    }
  ];

  readonly permisosModificados = computed(() => {
    const perfil = this.perfil();
    const sesion = this.auth.sesion();

    if (!perfil || !sesion) {
      return false;
    }

    const permisosServidor = [...perfil.permisos].sort();
    const permisosSesion = [...sesion.permisos].sort();

    return JSON.stringify(permisosServidor) !==
      JSON.stringify(permisosSesion);
  });

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.cargando.set(true);
    this.error.set('');

    this.auth.obtenerPerfil()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: perfil => {
          this.perfil.set(perfil);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set(
            'No se pudo obtener el perfil desde el servidor.'
          );
          this.cargando.set(false);
        }
      });
  }
}
