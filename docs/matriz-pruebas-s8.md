# Matriz de pruebas - Sesión 8 Autónoma

| ID | Grupo | Operación | Precondición | Datos | Resultado esperado | Resultado obtenido (SPA/HTTP) | Estado | Evidencia |
|---|---|---|---|---|---|---|---|---|
| A-01 | Alta | Registrar producto válido en categoría activa | Categoría activa disponible | Jabón líquido 500ml; Cuidado Personal; S/12.50; stock 15 | 201 y aparece en listado | SPA: producto creado; HTTP 201 Created | Pasa | A-01_spa.png |
| A-02 | Alta | Registrar producto sin categoría | Formulario y API disponibles | Producto A-02 sin categoriaId | SPA no envía; API 400 | SPA bloqueó y Red quedó vacía; API 400 con categoriaId obligatorio | Pasa | A-02_spa.png / A-02_postman.png |
| A-03 | Alta | Registrar con categoriaId inexistente | API disponible | categoriaId=999 | 404 Categoria no encontrada | HTTP 404 Not Found; Categoria no encontrada con id 999 | Pasa | A-03_postman.png |
| A-04 | Alta | Registrar en categoría inactiva | Dermocosmética id 7 inactiva | categoriaId=7 | API debería rechazar con 409 | HTTP 201 Created; producto quedó asociado a Dermocosmética | Falla | A-04_postman.png |
| A-05 | Alta | Registrar nombre existente con otra capitalización | Existe Vitamina C 500mg | vitamina c 500mg | 409 Ya existe un producto | SPA mostró error; HTTP 409 Conflict | Pasa | A-05_spa.png |
| A-06 | Alta | Registrar precio 0 y stock -1 | Categoría activa id 6 | precio=0; stock=-1 | SPA bloquea; API 400 con ambos campos | SPA bloqueó; API 400 con errores de precio y stock | Pasa | A-06_spa.png / A-06_postman.png |
| C-01 | Cambio | Cambiar producto a otra categoría activa | Jabón líquido 500ml activo | Cambiar a Vitaminas | 200 y nueva categoría visible | HTTP 200 OK; listado mostró Vitaminas | Pasa | C-01_spa.png |
| C-02 | Cambio | Cambiar producto a categoría inactiva | Dermocosmética id 7 inactiva | PUT producto 15 con categoriaId=7 | SPA impide; API debería rechazar 409 | SPA no ofrece inactiva; API respondió 200 OK y guardó categoría inactiva | Falla | C-02_spa.png / C-02_postman.png |
| C-03 | Cambio | Desactivar categoría con productos activos | Cuidado Personal tenía producto activo | Desactivar categoría id 8 | Regla elegida: impedir desactivación | HTTP 200 OK; categoría quedó Inactivo | Falla | C-03_spa.png |
| C-04 | Cambio | Dos pestañas: categoría se desactiva antes de registrar | Temporal S8 seleccionada en formulario y luego desactivada | Registrar Producto C-04 | Producto no debe quedar en categoría inactiva | HTTP 201 Created; Producto C-04 quedó en Temporal S8 inactiva | Falla | C-04_spa.png |
| B-01 | Baja | Dar de baja producto activo | Shampoo neutro 250ml activo | DELETE producto 13 | 204; fila pasa a Inactivo | HTTP 204 No Content; fila quedó Inactivo | Pasa | B-01_spa.png |
| B-02 | Baja | Dar de baja otra vez el mismo producto | Producto 13 ya inactivo | DELETE producto 13 | 409 ya se encuentra inactivo | HTTP 404 Not Found; Producto no encontrado con id 13 | Falla | B-02_postman.png |
| B-03 | Baja | Eliminar categoría sin productos | Categoría Temporal B03 vacía | DELETE categoría 10 | 204 y desaparece | HTTP 204 No Content; desapareció | Pasa | B-03_spa.png |
| B-04 | Baja | Eliminar categoría cuyos productos están dados de baja | Cuidado Personal con producto dado de baja | DELETE categoría 8 | Regla elegida: impedir eliminación para conservar historial | HTTP 204 No Content; categoría fue eliminada | Falla | B-04_spa.png |
| A-07 | Alta propio | Nombre demasiado corto | Categoría Vitaminas activa | nombre=AB | SPA bloquea; API 400 | SPA bloqueó; API 400 con validación de longitud | Pasa | A-07_spa.png / A-07_postman.png |
| C-05 | Cambio propio | Cambiar nombre por uno ya existente | Existe Vitamina C 500mg | Editar producto 8 a Vitamina C 500mg | 409 Conflict | HTTP 409 Conflict; mensaje de nombre existente | Pasa | C-05_spa.png |
| B-05 | Baja propio | Dar de baja producto inexistente | ID 999 inexistente | DELETE producto 999 | 404 Not Found | HTTP 404; Producto no encontrado con id 999 | Pasa | B-05_postman.png |
| C-06 | Cambio propio | Editar producto inexistente | ID 999 inexistente | PUT producto 999 | 404 Not Found | HTTP 404; Producto no encontrado con id 999 | Pasa | C-06_postman.png |

## Resumen

- Total ejecutados: 18.
- Pasan: 12.
- Fallan: 6.
- Hallazgos: A-04, C-02, C-03, C-04, B-02 y B-04.
- Casos propios: A-07, C-05, B-05 y C-06.