# PharmaFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Despliegue en producción

### 1. Arquitectura de PharmaSoft

```text
Usuarios de los 3 locales
         |
  Navegador web
         |
    HTTPS (443)
         |
   Nginx (8081)
         |
 PharmaBackend (8080)
       /      \
      /        \
Oracle (1522) Redis (6379)
```

Nginx sirve Angular y redirige las solicitudes /api al backend.
PharmaBackend consulta Oracle y utiliza Redis como caché.

Los puertos indicados corresponden al entorno local de pruebas.
En producción se recomienda HTTPS y mantener Oracle y Redis
accesibles únicamente desde la red privada.

### 2. Variables de entorno

| Variable | Propósito |
|---|---|
| SPRING_PROFILES_ACTIVE | Seleccionar el perfil prod |
| DB_URL | Dirección JDBC de Oracle |
| DB_USERNAME | Usuario de base de datos |
| DB_PASSWORD | Contraseña de Oracle |
| JWT_SECRET | Clave de firma de tokens JWT |
| REDIS_HOST | Servidor Redis |
| REDIS_PORT | Puerto Redis |
| FRONTEND_ORIGINS | Origen autorizado del frontend |
| CORS_ALLOWED_ORIGINS | Orígenes permitidos mediante CORS |

Nunca publicar contraseñas, claves JWT ni tokens reales en Git.

### 3. Construcción y despliegue

Backend, desde PharmaBackend:

```powershell
.\mvnw.cmd -DskipTests package
```

Configurar las variables de entorno requeridas y ejecutar:

```powershell
java -jar target\PhamaBackend-0.0.1-SNAPSHOT.jar
```

Frontend, desde pharma-frontend:

```cmd
ng build --configuration production --stats-json
docker compose -f deploy/docker-compose.yml up -d
```

Acceder a http://localhost:8081 y verificar:

- Inicio de sesión y navegación.
- GET /actuator/health con estado UP.
- Conexión a Oracle.
- Disponibilidad de Redis.
- Políticas Cache-Control de Nginx.

### 4. Reversión ante fallos

1. Conservar el JAR y la carpeta dist de la versión anterior.
2. Si falla el backend, detener el proceso y ejecutar el JAR anterior.
3. Si falla Angular, restaurar la carpeta dist anterior.
4. Verificar Nginx, Oracle y Redis.
5. Validar /actuator/health y las operaciones de PharmaSoft.
6. Restaurar la base de datos únicamente si existe una necesidad
   documentada, con respaldo comprobado y plan de recuperación.

### 5. Estado de buenas prácticas

| Práctica | Estado | Acción pendiente |
|---|---|---|
| Lazy Loading de rutas | Cumple | Mantener pruebas de navegación |
| Bloques @defer | Cumple | Verificar su comportamiento tras cambios |
| Budgets de Angular | Cumple | Revisar tamaños en cada compilación |
| Caché de archivos con hash | Cumple | Validar cada despliegue |
| Revalidación de index.html | Cumple | Mantener no-cache |
| Caché Redis | Parcial | Verificar claves y tasas de aciertos |
| Invalidación Redis | Parcial | Completar la matriz C-01 a C-06 |
| X-Request-Id en peticiones | Cumple | Agregarlo al cuerpo de errores |
| Seguridad de Actuator | Cumple | Mantener métricas restringidas |
| Logs sin secretos | Parcial | Ampliar auditoría a datos personales |
| HTTPS | No cumple | Configurar TLS y dominio |
| Copias de seguridad Oracle | No verificado | Implementar y probar restauración |
| Alertas de monitoreo | No cumple | Configurar alertas de disponibilidad |

### 6. Recomendaciones para los tres locales

**Prioridad 1: Seguridad.**
Configurar HTTPS, proteger los secretos en variables de entorno
y restringir el acceso directo a Oracle y Redis.

**Prioridad 2: Continuidad del servicio.**
Implementar copias de seguridad automáticas de Oracle,
probar restauraciones y conservar versiones anteriores para rollback.

**Prioridad 3: Arquitectura y monitoreo.**
Centralizar PharmaBackend, Oracle y Redis para los tres locales,
mediante una red privada o VPN segura. Configurar alertas de
/actuator/health, métricas y registros sin datos sensibles.

### 7. Limitaciones actuales

Las mediciones de precarga requieren una comparación controlada.
La caché Redis requiere verificar sus métricas, TTL e invalidaciones.
No considerar estas verificaciones como aprobadas sin evidencias.

