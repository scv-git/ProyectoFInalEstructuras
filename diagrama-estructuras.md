# Diagrama de estructuras propias

Todas las estructuras están en `co.edu.uniquindio.sga.estructuras`, son genéricas e implementan `Iterable<T>`. Ninguna usa colecciones de `java.util`. Las clases `Nodo`, `Vertice` y `Arista` son internas y privadas.

## Diagrama de clases de las estructuras

```mermaid
classDiagram
    direction TB

    class Iterable~T~ {
        <<interface>>
        +iterator() Iterator~T~
    }

    class ListaDoble~T~ {
        -Nodo~T~ cabeza
        -Nodo~T~ cola
        -int tamanio
        +agregar(T dato)
        +agregarInicio(T dato)
        +insertarOrdenado(T dato, Comparator comparador)
        +obtener(int indice) T
        +primero() T
        +ultimo() T
        +eliminarPrimero() T
        +eliminarUltimo() T
        +eliminar(T dato) boolean
        +contiene(T dato) boolean
        +buscar(Predicate condicion) T
        +filtrar(Predicate condicion) ListaDoble~T~
        +copia() ListaDoble~T~
        +ordenar(Comparator comparador) ListaDoble~T~
        +comoArreglo() Object[]
        +tamanio() int
        +estaVacia() boolean
    }
    class NodoDoble~T~ {
        T dato
        NodoDoble~T~ anterior
        NodoDoble~T~ siguiente
    }

    class Pila~T~ {
        -Nodo~T~ tope
        -int tamanio
        +apilar(T dato)
        +desapilar() T
        +cima() T
        +tamanio() int
        +estaVacia() boolean
    }

    class Cola~T~ {
        -Nodo~T~ frente
        -Nodo~T~ fin
        -int tamanio
        +encolar(T dato)
        +desencolar() T
        +frente() T
        +comoArreglo() Object[]
        +tamanio() int
        +estaVacia() boolean
    }

    class ListaCircular~T~ {
        -Nodo~T~ ultimo
        -int tamanio
        +agregar(T dato)
        +actual() T
        +avanzar() T
        +eliminar(T dato) boolean
        +comoArreglo() Object[]
        +tamanio() int
        +estaVacia() boolean
    }
    class NodoSimple~T~ {
        T dato
        NodoSimple~T~ siguiente
    }

    class ColaPrioridad~T~ {
        -ListaDoble~T~ elementos
        -Comparator comparador
        +encolar(T dato)
        +desencolar() T
        +frente() T
        +comoArreglo() Object[]
        +tamanio() int
        +estaVacia() boolean
    }

    class Conjunto~T~ {
        -ListaDoble~T~ elementos
        +agregar(T dato) boolean
        +eliminar(T dato) boolean
        +contiene(T dato) boolean
        +comoArreglo() Object[]
        +tamanio() int
        +estaVacia() boolean
    }

    class ArbolBinarioBusqueda~T~ {
        <<T extends Comparable>>
        -NodoArbol~T~ raiz
        -int tamanio
        +insertar(T dato) boolean
        +buscar(T clave) T
        +buscarConPoda(Predicate superaLimite, Predicate condicion) T
        +eliminar(T clave) boolean
        +altura() int
        +inorden() ListaDoble~T~
        +preorden() ListaDoble~T~
        +postorden() ListaDoble~T~
        +tamanio() int
        +estaVacia() boolean
    }
    class NodoArbol~T~ {
        T dato
        NodoArbol~T~ izquierdo
        NodoArbol~T~ derecho
    }

    class Grafo~T~ {
        -ListaDoble~Vertice~ vertices
        -ListaDoble~Conexion~ conexiones
        +agregarVertice(T dato)
        +agregarArista(T origen, T destino, double peso)
        +cambiarEstadoArista(T a, T b, boolean habilitada)
        +contiene(T dato) boolean
        +bfs(T origen) ListaDoble~T~
        +dfs(T origen) ListaDoble~T~
        +dijkstra(T origen, T destino) Ruta~T~
        +conexiones() ListaDoble~Conexion~
        +tamanio() int
    }
    class Vertice~T~ {
        T dato
        int indice
        ListaDoble~Arista~ adyacentes
    }
    class Arista~T~ {
        Vertice~T~ destino
        Conexion~T~ conexion
    }
    class Conexion~T~ {
        T origen
        T destino
        double peso
        boolean habilitada
    }
    class Ruta~T~ {
        <<record>>
        ListaDoble~T~ camino
        double distancia
    }

    class EstructuraVaciaException {
        <<exception>>
    }

    Iterable <|.. ListaDoble
    Iterable <|.. Pila
    Iterable <|.. Cola
    Iterable <|.. ListaCircular
    Iterable <|.. ColaPrioridad
    Iterable <|.. Conjunto
    Iterable <|.. ArbolBinarioBusqueda
    Iterable <|.. Grafo

    ListaDoble *-- NodoDoble
    Pila *-- NodoSimple
    Cola *-- NodoSimple
    ListaCircular *-- NodoSimple
    ArbolBinarioBusqueda *-- NodoArbol

    ColaPrioridad o-- ListaDoble : guarda ordenado
    Conjunto o-- ListaDoble : guarda sin repetidos
    ArbolBinarioBusqueda ..> ListaDoble : devuelve recorridos

    Grafo *-- Vertice
    Grafo o-- Conexion : pasillos
    Vertice *-- Arista : adyacentes
    Arista --> Vertice : destino
    Arista --> Conexion
    Grafo ..> Cola : usa en BFS
    Grafo ..> Ruta : devuelve

    ListaDoble ..> EstructuraVaciaException : lanza
    Pila ..> EstructuraVaciaException : lanza
    Cola ..> EstructuraVaciaException : lanza
    ListaCircular ..> EstructuraVaciaException : lanza
    ColaPrioridad ..> EstructuraVaciaException : lanza
```

En el código, `NodoDoble`, `NodoSimple` y `NodoArbol` se llaman `Nodo` dentro de cada clase. Aquí tienen nombres distintos para que el diagrama se lea mejor.

## Cómo se enlazan los nodos

```mermaid
flowchart LR
    subgraph LD["ListaDoble"]
        direction LR
        c1["cabeza"] --> a1["A"]
        a1 <--> b1["B"] <--> d1["C"]
        cl1["cola"] --> d1
    end

    subgraph LC["ListaCircular"]
        direction LR
        a2["A, actual"] --> b2["B"] --> d2["C, ultimo"]
        d2 --> a2
    end

    subgraph P["Pila"]
        direction TB
        t3["tope"] --> c3["C"] --> b3["B"] --> a3["A"]
    end

    subgraph C["Cola"]
        direction LR
        f4["frente"] --> a4["A"] --> b4["B"] --> c4["C"]
        fin4["fin"] --> c4
    end
```

```mermaid
flowchart TB
    subgraph ABB["ArbolBinarioBusqueda, menores a la izquierda"]
        r["50"] --> i["30"]
        r --> d["70"]
        i --> ii["20"]
        i --> id["40"]
        d --> di["60"]
        d --> dd["80"]
    end
```

## Uso en el SGA

| Estructura | Dónde se usa | Tipo guardado |
|---|---|---|
| `ArbolBinarioBusqueda` | Catálogo de apartamentos por código | `Apartamento` |
| `ArbolBinarioBusqueda` | Huéspedes y empleados por documento | `Huesped`, `Empleado` |
| `ArbolBinarioBusqueda` | Reservas de cada apartamento por fecha de entrada, detección de solapamientos | `Reserva` |
| `Grafo` | Mapa del edificio, ruta de preparación, inalcanzables y bloques | `String` con el id del nodo |
| `ColaPrioridad` | Cola de preparación, entrada hoy primero y luego hora de llegada | `ItemPreparacion` |
| `ColaPrioridad` | Reservas Pendientes ordenadas por hora de vencimiento | `Reserva` |
| `Cola` | Solicitudes del canal externo en orden de llegada | `SolicitudExterna` |
| `Pila` | Deshacer la última operación del folio | `Movimiento` |
| `Pila` | Navegación atrás entre pantallas | `String` |
| `ListaDoble` | Ocupantes, desglose de noches, historial, todas las reservas | `Ocupante`, `NocheLiquidada`, `Reserva` |
| `ListaCircular` | Rotación de turnos de recepción | `Empleado` |
| `Conjunto` | Favoritos de cada huésped | `String` con el código del apartamento |

## Complejidad de las operaciones principales

| Estructura | Operación | Complejidad |
|---|---|---|
| `ListaDoble` | agregar al inicio o al final | O(1) |
| `ListaDoble` | buscar, eliminar, obtener | O(n) |
| `Pila` | apilar, desapilar | O(1) |
| `Cola` | encolar, desencolar | O(1) |
| `ColaPrioridad` | encolar | O(n), inserta en orden |
| `ColaPrioridad` | desencolar | O(1), el frente es el de mayor prioridad |
| `ListaCircular` | avanzar turno | O(1) |
| `Conjunto` | agregar, contiene | O(n) |
| `ArbolBinarioBusqueda` | insertar, buscar, eliminar | O(h), O(log n) si el árbol está balanceado |
| `Grafo` | BFS, DFS | O(V + E) |
| `Grafo` | Dijkstra | O(V²) |
