package co.edu.uniquindio.sga.estructuras;

import java.util.Iterator;

/**
 * Grafo no dirigido y ponderado, con listas de adyacencia.
 * Uso: mapa del edificio. Vértices = apartamentos, recepción, escaleras y cuartos de aseo.
 * Aristas = pasillos con peso en metros. Un pasillo puede cerrarse sin borrarlo.
 */
public class Grafo<T> implements Iterable<T> {

    /** Pasillo entre dos vértices. Se comparte entre las dos direcciones. */
    public static class Conexion<T> {
        private final T origen;
        private final T destino;
        private final double peso;
        private boolean habilitada = true;

        Conexion(T origen, T destino, double peso) {
            this.origen = origen;
            this.destino = destino;
            this.peso = peso;
        }

        public T getOrigen() { return origen; }
        public T getDestino() { return destino; }
        public double getPeso() { return peso; }
        public boolean isHabilitada() { return habilitada; }
    }

    /** Resultado de un camino. distancia = -1 si no hay camino. */
    public record Ruta<T>(ListaDoble<T> camino, double distancia) {
    }

    private static class Arista<T> {
        final Vertice<T> destino;
        final Conexion<T> conexion;

        Arista(Vertice<T> destino, Conexion<T> conexion) {
            this.destino = destino;
            this.conexion = conexion;
        }
    }

    private static class Vertice<T> {
        final T dato;
        final int indice;
        final ListaDoble<Arista<T>> adyacentes = new ListaDoble<>();

        Vertice(T dato, int indice) {
            this.dato = dato;
            this.indice = indice;
        }
    }

    private final ListaDoble<Vertice<T>> vertices = new ListaDoble<>();
    private final ListaDoble<Conexion<T>> conexiones = new ListaDoble<>();

    // ---------- Construcción ----------

    public void agregarVertice(T dato) {
        if (buscarVertice(dato) == null) {
            vertices.agregar(new Vertice<>(dato, vertices.tamanio()));
        }
    }

    public void agregarArista(T origen, T destino, double peso) {
        Vertice<T> a = obtenerVertice(origen);
        Vertice<T> b = obtenerVertice(destino);
        Conexion<T> conexion = new Conexion<>(origen, destino, peso);
        a.adyacentes.agregar(new Arista<>(b, conexion));
        b.adyacentes.agregar(new Arista<>(a, conexion));
        conexiones.agregar(conexion);
    }

    /** Abre o cierra un pasillo. */
    public void cambiarEstadoArista(T a, T b, boolean habilitada) {
        Conexion<T> conexion = conexiones.buscar(c ->
                (c.origen.equals(a) && c.destino.equals(b)) || (c.origen.equals(b) && c.destino.equals(a)));
        if (conexion == null) throw new IllegalArgumentException("No existe el pasillo " + a + " - " + b);
        conexion.habilitada = habilitada;
    }

    public ListaDoble<Conexion<T>> conexiones() {
        return conexiones;
    }

    public boolean contiene(T dato) {
        return buscarVertice(dato) != null;
    }

    public int tamanio() {
        return vertices.tamanio();
    }

    // ---------- Recorridos ----------

    /** Recorrido en anchura usando la Cola propia. */
    public ListaDoble<T> bfs(T origen) {
        Vertice<T> inicio = obtenerVertice(origen);
        boolean[] visitado = new boolean[vertices.tamanio()];
        ListaDoble<T> recorrido = new ListaDoble<>();
        Cola<Vertice<T>> cola = new Cola<>();
        cola.encolar(inicio);
        visitado[inicio.indice] = true;
        while (!cola.estaVacia()) {
            Vertice<T> actual = cola.desencolar();
            recorrido.agregar(actual.dato);
            for (Arista<T> arista : actual.adyacentes) {
                if (arista.conexion.habilitada && !visitado[arista.destino.indice]) {
                    visitado[arista.destino.indice] = true;
                    cola.encolar(arista.destino);
                }
            }
        }
        return recorrido;
    }

    /** Recorrido en profundidad recursivo. */
    public ListaDoble<T> dfs(T origen) {
        ListaDoble<T> recorrido = new ListaDoble<>();
        dfs(obtenerVertice(origen), new boolean[vertices.tamanio()], recorrido);
        return recorrido;
    }

    private void dfs(Vertice<T> actual, boolean[] visitado, ListaDoble<T> recorrido) {
        visitado[actual.indice] = true;
        recorrido.agregar(actual.dato);
        for (Arista<T> arista : actual.adyacentes) {
            if (arista.conexion.habilitada && !visitado[arista.destino.indice]) {
                dfs(arista.destino, visitado, recorrido);
            }
        }
    }

    // ---------- Dijkstra ----------

    /** Camino más corto entre dos vértices, ignorando pasillos cerrados. */
    @SuppressWarnings("unchecked")
    public Ruta<T> dijkstra(T origen, T destino) {
        int n = vertices.tamanio();
        Vertice<T>[] arreglo = new Vertice[n];
        for (Vertice<T> v : vertices) arreglo[v.indice] = v;

        int inicio = obtenerVertice(origen).indice;
        int fin = obtenerVertice(destino).indice;
        double[] distancia = new double[n];
        int[] previo = new int[n];
        boolean[] visitado = new boolean[n];
        for (int i = 0; i < n; i++) {
            distancia[i] = Double.POSITIVE_INFINITY;
            previo[i] = -1;
        }
        distancia[inicio] = 0;

        for (int k = 0; k < n; k++) {
            // Vértice no visitado con menor distancia
            int u = -1;
            for (int i = 0; i < n; i++) {
                if (!visitado[i] && (u == -1 || distancia[i] < distancia[u])) u = i;
            }
            if (u == -1 || distancia[u] == Double.POSITIVE_INFINITY || u == fin) break;
            visitado[u] = true;
            for (Arista<T> arista : arreglo[u].adyacentes) {
                if (!arista.conexion.habilitada) continue;
                int v = arista.destino.indice;
                double nueva = distancia[u] + arista.conexion.peso;
                if (nueva < distancia[v]) {
                    distancia[v] = nueva;
                    previo[v] = u;
                }
            }
        }

        ListaDoble<T> camino = new ListaDoble<>();
        if (distancia[fin] == Double.POSITIVE_INFINITY) return new Ruta<>(camino, -1);
        for (int v = fin; v != -1; v = previo[v]) camino.agregarInicio(arreglo[v].dato);
        return new Ruta<>(camino, distancia[fin]);
    }

    // ---------- Auxiliares ----------

    private Vertice<T> buscarVertice(T dato) {
        return vertices.buscar(v -> v.dato.equals(dato));
    }

    private Vertice<T> obtenerVertice(T dato) {
        Vertice<T> vertice = buscarVertice(dato);
        if (vertice == null) throw new IllegalArgumentException("No existe el nodo " + dato);
        return vertice;
    }

    @Override
    public Iterator<T> iterator() {
        Iterator<Vertice<T>> it = vertices.iterator();
        return new Iterator<>() {
            @Override
            public boolean hasNext() {
                return it.hasNext();
            }

            @Override
            public T next() {
                return it.next().dato;
            }
        };
    }
}
