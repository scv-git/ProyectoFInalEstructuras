# API del SGA

Base: `http://localhost:8080/api`. Fechas `2026-12-20`, horas `15:00`.
Los errores llegan con estado 400 y cuerpo `{ "tipo": "...", "mensaje": "..." }`.

Primero llamar `POST /datos/cargar` para cargar el escenario de prueba.

## Sistema
| Método | Ruta | Cuerpo / parámetros |
|---|---|---|
| POST | /datos/cargar | sin cuerpo carga escenario.txt, o texto plano con otro escenario |
| GET | /navegacion | pantalla actual |
| POST | /navegacion/ir | `{ "pantalla": "RESERVAS" }` |
| POST | /navegacion/atras | devuelve la pantalla anterior |

## Apartamentos
| Método | Ruta | Cuerpo / parámetros |
|---|---|---|
| GET | /apartamentos | `?orden=precio\|capacidad\|dormitorios\|reservas` opcional |
| GET | /apartamentos/{codigo} | |
| POST | /apartamentos | `{ codigo, nombre, bloque, piso, dormitorios, capacidad, caracteristicas, tarifaBaja, tarifaMedia, tarifaAlta }` |
| PUT | /apartamentos/{codigo} | igual que POST, también define tarifas |
| DELETE | /apartamentos/{codigo} | |
| PUT | /apartamentos/{codigo}/estado | `{ "estado": "FUERA_DE_SERVICIO", "motivo": "..." }` o `{ "estado": "PENDIENTE_PREPARACION" }` |
| GET | /apartamentos/{codigo}/reservas | ordenadas por fecha de entrada |
| GET | /apartamentos/calendario | `?anio=2026&mes=11`, cada fila trae `noches[]` con LIBRE, OCUPADA o BLOQUEADA |

Estados y colores: PREPARADO verde, OCUPADO azul, PENDIENTE_PREPARACION y EN_PREPARACION amarillo, FUERA_DE_SERVICIO rojo.

## Huéspedes
| Método | Ruta | Cuerpo / parámetros |
|---|---|---|
| GET | /huespedes | |
| GET | /huespedes/{doc} | |
| POST | /huespedes | `{ documento, nombre, fechaNacimiento, telefono, correo, foto }` foto opcional |
| PUT | /huespedes/{doc} | igual que POST |
| DELETE | /huespedes/{doc} | |
| GET | /huespedes/{doc}/reservas | cada reserva trae `saldo` y `folio` |
| GET | /huespedes/{doc}/historial | estancias finalizadas |
| GET | /huespedes/{doc}/favoritos | |
| POST | /huespedes/{doc}/favoritos/{codigo} | |
| DELETE | /huespedes/{doc}/favoritos/{codigo} | |

## Reservas
| Método | Ruta | Cuerpo / parámetros |
|---|---|---|
| GET | /reservas | |
| GET | /reservas/{id} | |
| GET | /reservas/disponibilidad | `?entrada=&salida=&personas=&orden=precio\|capacidad\|dormitorios` |
| POST | /reservas/cotizar | ver cuerpo de reserva abajo, devuelve desglose noche por noche |
| POST | /reservas | cuerpo de reserva, `canal` PORTAL o DIRECTA |
| POST | /reservas/{id}/anticipo | paga el 30 % y confirma |
| GET | /reservas/{id}/devolucion | cuánto se devolvería si cancela |
| POST | /reservas/{id}/cancelar | |
| POST | /reservas/{id}/checkin | solo si el apartamento está PREPARADO |
| POST | /reservas/{id}/checkout | el apartamento pasa a la cola de preparación |
| POST | /reservas/{id}/no-show | |
| GET | /reservas/{id}/folio | |
| POST | /reservas/{id}/folio/cargos | `{ "concepto": "Minibar", "valor": 20000 }` |
| POST | /reservas/{id}/folio/pagos | igual |
| POST | /reservas/{id}/folio/deshacer | registra el movimiento contrario |
| GET | /reservas/grupo | `?entrada=&salida=&personas=` combinación mínima de apartamentos |
| POST | /reservas/vencimientos | cancela pendientes vencidas, también corre solo cada minuto |
| GET | /reservas/externas | cola FIFO del canal externo |
| POST | /reservas/externas | simula una solicitud externa, mismo cuerpo de reserva sin canal |
| POST | /reservas/externas/procesar | procesa la siguiente: ACEPTADA, CONFLICTO o RECHAZADA |
| GET | /reservas/conflictos | |

Cuerpo de reserva:
```json
{
  "documentoTitular": "1001",
  "codigoApartamento": "A101",
  "canal": "PORTAL",
  "entrada": "2026-12-13",
  "salida": "2026-12-17",
  "horaLlegada": "15:00",
  "ocupantes": [
    { "nombre": "Laura Gómez", "fechaNacimiento": "1990-04-12" },
    { "nombre": "Sofía Gómez", "fechaNacimiento": "2023-01-15" }
  ]
}
```

## Preparación
| Método | Ruta | Cuerpo / parámetros |
|---|---|---|
| GET | /preparacion | cola en orden de prioridad |
| POST | /preparacion/despachar | el de mayor prioridad pasa a EN_PREPARACION |
| POST | /preparacion/{codigo}/terminar | pasa a PREPARADO |
| GET | /preparacion/ruta | `{ camino: [...], distancia }` desde recepción |

## Mapa
| Método | Ruta | Cuerpo / parámetros |
|---|---|---|
| GET | /mapa | `{ nodos: [{id, tipo, nombre, x, y, bloque, estado}], pasillos: [{origen, destino, peso, habilitada}] }` |
| GET | /mapa/ruta | `?origen=REC&destino=A203` Dijkstra |
| POST | /mapa/pasillos/cerrar | `{ "origen": "ESC-B", "destino": "B201" }` devuelve inalcanzables |
| POST | /mapa/pasillos/abrir | igual |
| GET | /mapa/inalcanzables | |
| GET | /mapa/bfs | `?origen=` opcional |
| GET | /mapa/dfs | `?origen=` opcional |
| GET | /mapa/bloques | apartamentos agrupados por bloque |

## Administración
| Método | Ruta | Cuerpo / parámetros |
|---|---|---|
| GET | /empleados | |
| POST | /empleados | `{ documento, nombre, rol }` rol RECEPCIONISTA, PREPARACION o ADMINISTRADOR |
| PUT | /empleados/{doc} | |
| DELETE | /empleados/{doc} | |
| GET | /turnos | |
| GET | /turnos/actual | |
| POST | /turnos/rotar | |
| GET | /temporadas | |
| POST | /temporadas | `{ "temporada": "ALTA", "inicio": "2026-12-15", "fin": "2027-01-15" }` |
| DELETE | /temporadas/{indice} | |
| GET | /reportes | `?desde=&hasta=` opcional, por defecto el mes actual |
