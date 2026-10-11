\# MATRIZ DE PRUEBAS – SESIÓN 9



\*\*Proyecto:\*\* PharmaSoft  

\*\*Alumno:\*\* Pari  

\*\*Rama:\*\* feature/pruebas-reporte-ventas-pari  

\*\*Fecha de ejecución:\*\* 11/10/2026  



\## Resumen



\- Total de pruebas: 21

\- Pruebas aprobadas: 20

\- Pruebas fallidas: 1

\- Hallazgos: 1

\- Hallazgo principal: V-05 – La API acepta el mismo producto repetido en dos líneas de una venta.



\---



\## Matriz de pruebas



| ID | Grupo | Precondición | Datos / Acción | Resultado esperado | Resultado obtenido | Estado | Evidencia |

|---|---|---|---|---|---|---|---|

| B-01 | Buscadores | Existen clientes activos e inactivos | Buscar DNI `12345678` del cliente inactivo y luego `Diaz` sin tilde | El cliente inactivo no debe mostrarse. El cliente activo Diego Díaz debe encontrarse aun sin tilde | El cliente inactivo no apareció y Diego Diaz fue encontrado correctamente | PASA | B-01a / B-01b |

| B-02 | Buscadores | Existen productos activos con stock | Buscar `para`, buscar categoría `Analgésicos` y presionar Enter | Deben aparecer coincidencias por nombre/categoría y Enter debe agregar el primer producto | Se encontraron los productos esperados y Enter agregó Diclofenaco 50mg | PASA | B-02 |

| C-01 | Cálculos | Producto Jabón líquido 500ml disponible | Precio S/ 12.50, cantidad 3 | `12.50 × 3 = 37.50` | Subtotal y total mostrados: S/ 37.50 | PASA | C-01 |

| C-02 | Cálculos | Producto Decimal S9 disponible | Precio S/ 18.90, cantidad 3 | `18.90 × 3 = 56.70` exactamente | Subtotal y total mostrados: S/ 56.70 | PASA | C-02 |

| C-03 | Cálculos | Tres productos agregados | Decimal S9 S/18.90 + Diclofenaco S/7.00 + Jabón S/12.50. Luego eliminar Diclofenaco | Antes: `18.90 + 7.00 + 12.50 = 38.40`. Después: `18.90 + 12.50 = 31.40` | Total inicial S/38.40 y después de eliminar la línea media S/31.40 | PASA | C-03a / C-03b |

| C-04 | Cálculos | Cliente Diego Diaz y dos productos de C-03 | Registrar venta con total estimado S/31.40 | El servidor debe calcular el total definitivo y coincidir con S/31.40 | API creó venta N000021 y devolvió total 31.40 | PASA | C-04a / C-04b |

| V-01 | Validaciones | Formulario de nueva venta vacío | Presionar Revisar sin cliente ni productos | Mostrar validaciones y no abrir resumen ni enviar POST | Se mostraron mensajes de cliente y productos requeridos. No se realizó POST | PASA | V-01 |

| V-02 | Validaciones | Cliente Carla Castro y producto Ibuprofeno | Probar cantidad 0 y luego 2.5 | Solo se permiten cantidades enteras mayores que cero | En ambos casos se mostró el mensaje de validación y no se realizó POST | PASA | V-02a / V-02b |

| V-03 | Validaciones | Producto Stock 2 S9 con stock 2 | Ingresar cantidad 3 | Debe impedir continuar y mostrar que supera el stock disponible | Se mostró `Supera el stock (2)` y no hubo POST | PASA | V-03 |

| V-04 | Validaciones | Producto Stock 2 S9 ya agregado con cantidad 1 | Buscar nuevamente el mismo producto y agregarlo | No debe crear otra fila. Debe aumentar la cantidad de la línea existente | Se mantuvo una sola fila y la cantidad aumentó de 1 a 2 | PASA | V-04 |

| V-05 | Validaciones | API disponible y producto Decimal S9 activo | Enviar por Postman dos detalles con el mismo `productoId: 26`, cantidad 1 cada uno | Regla definida: la API debería rechazar o consolidar el producto repetido en una sola línea | API respondió `201 Created` y creó dos detalles independientes del mismo producto | FALLA | V-05 / Hallazgo H-01 |

| F-01 | Confirmación | Venta preparada con cliente Carla Castro e Ibuprofeno | Abrir resumen y luego pulsar Volver | Debe cerrar el resumen, conservar los datos y no registrar la venta | El resumen se cerró, los datos permanecieron y no se realizó POST | PASA | F-01a / F-01b |

| F-02 | Confirmación | Venta válida preparada | Hacer doble clic en Confirmar | Debe registrarse una sola venta | Solo se observó un POST `/api/v1/ventas` con 201 Created y se creó una venta | PASA | F-02 |

| M-01 | Mensajes | Dos pestañas con producto de stock 2, ambas con cantidad 2 | Confirmar primero en una pestaña y después en la segunda | Primera venta exitosa. Segunda debe responder 409 por stock insuficiente y permitir corregir sin recargar | Primera venta N000024 exitosa. Segunda respondió 409 con mensaje de stock disponible 0 y el formulario permaneció abierto | PASA | M-01a / M-01b |

| M-02 | Mensajes | Cliente Luis Mendoza inactivo, id 7 | POST por Postman con `clienteId: 7` | API debe rechazar la venta con 409 | API respondió 409: `No se puede registrar una venta para un cliente inactivo` | PASA | M-02 |

| I-01 | Impresión | Existen ventas registradas y anuladas | Imprimir al registrar, imprimir venta anulada e imprimir consulta filtrada | Los comprobantes deben imprimirse sin menú/botones, mostrar DNI y pie; anulada debe mostrar sello; consulta debe mostrar filtros y resumen | Se verificaron los tres tipos de impresión correctamente | PASA | I-01a / I-01b / I-01c |

| X-01 | Consistencia | Venta N000024 registrada con Producto Stock 2 S9 | Revisar producto y consulta de ventas después de registrar | El stock debe disminuir y la venta debe conservar el mismo total/cantidad | Producto quedó con stock 0 y la venta N000024 aparece registrada con 1 ítem y S/20.00 | PASA | X-01 |

| B-03 | Buscadores | Formulario de venta abierto | Buscar producto inexistente `ProductoXYZ999` | No debe mostrar productos y debe informar que no existen coincidencias | Apareció `Ningún producto activo con stock coincide con la búsqueda` | PASA | B-03 |

| C-05 | Cálculos | Productos Decimal S9 y Paracetamol disponibles | Decimal S9: `18.90 × 2 = 37.80`; Paracetamol: `5.50 × 3 = 16.50` | Total esperado: `37.80 + 16.50 = 54.30` | La SPA mostró total S/54.30 | PASA | C-05 |

| V-06 | Validaciones | Venta con Producto Decimal S9 y Paracetamol | Cambiar cantidad de Paracetamol a -1 | Debe bloquear la venta porque la cantidad no es mayor que cero | Mostró mensaje de validación y no realizó POST | PASA | V-06 |

| F-03 | Confirmación | Formulario con una venta válida preparada | Pulsar Cancelar antes de confirmar | Debe cancelar la operación sin crear una venta | Se regresó a Consulta de ventas y Network mostró solo GET, sin POST de venta | PASA | F-03 |



\---



\## Resumen por grupo



| Grupo | Total | Pasan | Fallan |

|---|---:|---:|---:|

| Buscadores | 3 | 3 | 0 |

| Cálculos | 5 | 5 | 0 |

| Validaciones | 6 | 5 | 1 |

| Confirmación | 3 | 3 | 0 |

| Mensajes | 2 | 2 | 0 |

| Impresión | 1 | 1 | 0 |

| Consistencia | 1 | 1 | 0 |

| \*\*TOTAL\*\* | \*\*21\*\* | \*\*20\*\* | \*\*1\*\* |



\---



\## Hallazgo H-01



\*\*Caso relacionado:\*\* V-05  

\*\*Severidad:\*\* Media  



\*\*Descripción:\*\*  

La API permite registrar una venta en la que el mismo producto aparece repetido en dos líneas diferentes.



\*\*Resultado esperado:\*\*  

El backend debería rechazar la solicitud o consolidar las cantidades del mismo producto en una sola línea.



\*\*Resultado obtenido:\*\*  

La API respondió `201 Created` y registró dos detalles independientes para el mismo `productoId`.



\*\*Impacto:\*\*  

Aunque el total y la disminución de stock se procesan, se generan detalles duplicados que pueden complicar el comprobante, la lectura de la venta y futuras operaciones de reporte.



\*\*Corrección propuesta:\*\*  

Validar en la capa de negocio del backend que un `productoId` no se repita dentro de los detalles de una misma venta. Como alternativa, consolidar las cantidades antes de registrar la operación.



\---



\## Evidencias del reporte de ventas por categoría



\### R-01 – Reporte histórico sin filtros

La aplicación muestra el reporte completo sin fechas, con categorías, unidades vendidas, montos, barras proporcionales y totales.



Resultado observado:

\- 14 unidades vendidas.

\- Monto total PEN 139.20.



\### R-02 – Reporte filtrado por fechas

Filtro utilizado:

\- Desde: 11/10/2026

\- Hasta: 11/10/2026



Resultado observado:

\- 7 unidades vendidas.

\- Monto total PEN 97.70.

\- Se muestran únicamente datos correspondientes al periodo indicado.



\### R-03 – Validación del rango de fechas

Filtro utilizado:

\- Desde: 12/10/2026

\- Hasta: 11/10/2026



Resultado:

`La fecha desde no puede ser posterior a la fecha hasta.`



La validación se realiza en la SPA antes de efectuar la consulta.



\### R-04 – Estado sin resultados

Filtro utilizado:

\- Desde: 01/10/2026

\- Hasta: 02/10/2026



Resultado:

`No hay ventas en el periodo seleccionado.`



\### R-05 – Error de comunicación con backend

Se detuvo temporalmente el backend y se intentó generar el reporte.



Resultado:

`Failed to fetch`



La vista presenta correctamente un estado de error cuando el servicio no está disponible.



\---



\## Resultado general



Se ejecutaron los 21 casos requeridos.



\*\*20 casos PASAN.\*\*  

\*\*1 caso FALLA.\*\*



El único hallazgo corresponde al caso V-05, relacionado con productos repetidos en distintas líneas enviadas directamente a la API.

