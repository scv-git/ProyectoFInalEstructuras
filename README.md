# SGA, Sistema de Gestión de Alojamiento

Aplicación de escritorio para administrar el alojamiento turístico **Aparta-Suites UQ** en Salento, Quindío. Gestiona apartamentos, huéspedes, reservas de tres canales, folios, preparación de apartamentos y el mapa del edificio, apoyándose en estructuras de datos genéricas implementadas por el equipo, sin usar las colecciones de `java.util`.

Proyecto final de Estructura de Datos, 2026-2.

## Integrantes

- Miguel Angel Maya Colorado
- Santiago Vega Cifuentes

## Tecnologías

| Parte | Tecnología |
|---|---|
| Backend | Java 17, Spring Boot 3, Maven |
| Frontend | React, TypeScript, Vite, Electron |
| Datos | En memoria, sobre las estructuras propias. Escenario inicial en archivo plano |

## Estructura del repositorio

```
├── pom.xml
├── API.md                      Endpoints del backend
├── diagrama-estructuras.md     Diagrama de estructuras propias
├── src/main/java/co/edu/uniquindio/sga/
│   ├── estructuras/            Estructuras de datos propias y genéricas
│   ├── excepciones/            Excepciones propias del sistema
│   ├── modelo/                 Entidades, enumeraciones y comparadores
│   ├── dto/request/            Datos que recibe la API
│   ├── dto/response/           Datos que devuelve la API
│   ├── datos/                  Base de datos en memoria y carga del escenario
│   ├── servicio/               Reglas de negocio
│   └── controlador/            Endpoints REST
├── src/main/resources/
│   └── escenario.txt           Escenario de prueba
└── frontend/
    ├── electron/               Arranque de la aplicación de escritorio
    └── src/                    Interfaz gráfica en React
```

## Cómo ejecutar

### Backend

1. Abrir el proyecto en IntelliJ desde el `pom.xml`.
2. Ejecutar `SgaApplication`. También sirve `mvn spring-boot:run` desde la raíz.
3. El backend queda en `http://localhost:8080`.

### Aplicación de escritorio

El backend debe estar corriendo antes de abrir la aplicación.

```bash
cd frontend
npm install
npm run electron:dev
```

Para generar el instalador:

```bash
npm run electron:build
```

El instalador queda en `frontend/release`.

### Frontend en el navegador

Para desarrollo también se puede abrir sin Electron:

```bash
cd frontend
npm run dev
```

La interfaz queda en `http://localhost:5173` y se conecta sola al backend.

### Cargar datos de prueba

Desde la interfaz, con el botón **Cargar escenario**, o con `POST http://localhost:8080/api/datos/cargar`.

El escenario trae 10 apartamentos en dos bloques, el mapa del edificio con 15 nodos y 17 pasillos, 6 huéspedes, 6 empleados, 11 reservas en distintos estados y 3 solicitudes del canal externo. Las fechas son relativas al día en que se carga, así siempre hay llegadas programadas para hoy.

### Usuarios de prueba

| Rol | Documento | Contraseña |
|---|---|---|
| Huésped | 1001 o 1002 | 1234 |
| Recepcionista | 2001 o 2002 | 1234 |
| Administrador | 2006 | 1234 |

## Estructuras de datos propias

Todas son genéricas, implementan `Iterable<T>` con su propio `Iterator<T>` y no dependen de ninguna clase del dominio. El diagrama está en [diagrama-estructuras.md](diagrama-estructuras.md).

| Estructura | Clase | Uso en el SGA |
|---|---|---|
| Grafo | `Grafo<T>` | Mapa del edificio, rutas con Dijkstra, conectividad con BFS y DFS |
| Cola de prioridad | `ColaPrioridad<T>` | Cola de preparación y reservas Pendientes por hora de vencimiento |
| Cola | `Cola<T>` | Solicitudes del canal externo en orden de llegada, recorrido BFS |
| Pila | `Pila<T>` | Deshacer en el folio y navegación atrás entre pantallas |
| Lista doblemente enlazada | `ListaDoble<T>` | Historial de estancias, ocupantes, desglose de noches y listas generales |
| Lista circular | `ListaCircular<T>` | Rotación de turnos de los recepcionistas |
| Árbol binario de búsqueda | `ArbolBinarioBusqueda<T extends Comparable<T>>` | Apartamentos por código, huéspedes y empleados por documento, reservas de cada apartamento por fecha de entrada |
| Conjunto | `Conjunto<T>` | Apartamentos favoritos de cada huésped sin repetidos |

## Conceptos de Java

| Concepto | Dónde está |
|---|---|
| Genéricos | Paquete `estructuras` |
| Comparable | `Apartamento` por código, `Huesped` y `Empleado` por documento, `Reserva` por fecha de entrada |
| Comparator | `modelo/Comparadores`: precio, capacidad, dormitorios, número de reservas, prioridad de preparación con `thenComparing` y vencimiento |
| Iterable e Iterator | Todas las estructuras y `Estancia`, que recorre las noches con `for (LocalDate noche : estancia)` |
| Recursividad | Operaciones y recorridos del árbol, detección de solapamientos en `buscarConPoda`, DFS, liquidación noche por noche en `ReservaServicio.liquidar` y backtracking en `ReservaServicio.mejorCombinacion` |
| Excepciones propias | `ReservaSolapadaException`, `CapacidadExcedidaException`, `FechasInvalidasException`, `TransicionInvalidaException`, `EstructuraVaciaException` |

## Reglas de negocio

- Cada apartamento se alquila completo a un solo grupo.
- Se cobra por persona y por noche. Los menores de 6 años ocupan cupo pero no pagan.
- La noche de salida no se cobra. Si la estancia cruza temporadas, se liquida noche por noche. Las fechas sin temporada definida son temporada Baja.
- Un apartamento no puede tener dos reservas activas que compartan una noche, sin importar el canal.
- Al hacer check-out el apartamento queda Pendiente de preparación y solo recibe huéspedes cuando vuelve a estar Preparado.
- Las reservas del portal quedan Pendientes hasta pagar el 30 % de anticipo y se cancelan solas a las 24 horas.
- Los movimientos del folio nunca se borran, deshacer registra el movimiento contrario.
- Devolución al cancelar: 100 % de lo pagado si faltan más de 7 días para la entrada, 50 % entre 2 y 7 días, y nada si faltan menos de 2.

## API

La lista completa de endpoints está en [API.md](API.md).

## Convención de commits

Los commits siguen [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/):

| Tipo | Uso |
|---|---|
| `feat:` | Funcionalidad nueva |
| `fix:` | Corrección de un error |
| `docs:` | Documentación y diagramas |
| `test:` | Pruebas |
| `refactor:` | Reorganizar código sin cambiar su comportamiento |
| `chore:` | Configuración y mantenimiento |
