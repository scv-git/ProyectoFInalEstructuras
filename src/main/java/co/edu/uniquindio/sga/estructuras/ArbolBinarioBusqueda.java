package co.edu.uniquindio.sga.estructuras;

import java.util.Iterator;
import java.util.function.Predicate;

/**
 * Árbol binario de búsqueda genérico, ordenado por el orden natural (Comparable).
 * Uso: apartamentos por código, huéspedes y empleados por documento,
 * y reservas de cada apartamento por fecha de entrada.
 * Todas las operaciones son recursivas.
 */
public class ArbolBinarioBusqueda<T extends Comparable<T>> implements Iterable<T> {

    private static class Nodo<T> {
        T dato;
        Nodo<T> izquierdo;
        Nodo<T> derecho;

        Nodo(T dato) {
            this.dato = dato;
        }
    }

    private Nodo<T> raiz;
    private int tamanio;

    // ---------- Inserción ----------

    /** Devuelve false si ya existe un elemento igual. */
    public boolean insertar(T dato) {
        if (buscar(dato) != null) return false;
        raiz = insertar(raiz, dato);
        tamanio++;
        return true;
    }

    private Nodo<T> insertar(Nodo<T> nodo, T dato) {
        if (nodo == null) return new Nodo<>(dato);
        if (dato.compareTo(nodo.dato) < 0) nodo.izquierdo = insertar(nodo.izquierdo, dato);
        else nodo.derecho = insertar(nodo.derecho, dato);
        return nodo;
    }

    // ---------- Búsqueda ----------

    public T buscar(T clave) {
        return buscar(raiz, clave);
    }

    private T buscar(Nodo<T> nodo, T clave) {
        if (nodo == null) return null;
        int comparacion = clave.compareTo(nodo.dato);
        if (comparacion == 0) return nodo.dato;
        return comparacion < 0 ? buscar(nodo.izquierdo, clave) : buscar(nodo.derecho, clave);
    }

    /**
     * Busca en orden el primer elemento que cumple la condición.
     * Cuando un nodo ya supera el límite, ni él ni su subárbol derecho se revisan.
     * Así se detectan solapamientos sin recorrer todas las reservas.
     */
    public T buscarConPoda(Predicate<T> superaLimite, Predicate<T> condicion) {
        return buscarConPoda(raiz, superaLimite, condicion);
    }

    private T buscarConPoda(Nodo<T> nodo, Predicate<T> superaLimite, Predicate<T> condicion) {
        if (nodo == null) return null;
        T encontrado = buscarConPoda(nodo.izquierdo, superaLimite, condicion);
        if (encontrado != null) return encontrado;
        if (superaLimite.test(nodo.dato)) return null;
        if (condicion.test(nodo.dato)) return nodo.dato;
        return buscarConPoda(nodo.derecho, superaLimite, condicion);
    }

    // ---------- Eliminación ----------

    public boolean eliminar(T clave) {
        if (buscar(clave) == null) return false;
        raiz = eliminar(raiz, clave);
        tamanio--;
        return true;
    }

    private Nodo<T> eliminar(Nodo<T> nodo, T clave) {
        int comparacion = clave.compareTo(nodo.dato);
        if (comparacion < 0) {
            nodo.izquierdo = eliminar(nodo.izquierdo, clave);
        } else if (comparacion > 0) {
            nodo.derecho = eliminar(nodo.derecho, clave);
        } else {
            if (nodo.izquierdo == null) return nodo.derecho;
            if (nodo.derecho == null) return nodo.izquierdo;
            // Dos hijos: se reemplaza por el menor del subárbol derecho
            Nodo<T> sucesor = minimo(nodo.derecho);
            nodo.dato = sucesor.dato;
            nodo.derecho = eliminar(nodo.derecho, sucesor.dato);
        }
        return nodo;
    }

    private Nodo<T> minimo(Nodo<T> nodo) {
        return nodo.izquierdo == null ? nodo : minimo(nodo.izquierdo);
    }

    // ---------- Altura y recorridos ----------

    public int altura() {
        return altura(raiz);
    }

    private int altura(Nodo<T> nodo) {
        if (nodo == null) return 0;
        return 1 + Math.max(altura(nodo.izquierdo), altura(nodo.derecho));
    }

    public ListaDoble<T> inorden() {
        ListaDoble<T> lista = new ListaDoble<>();
        inorden(raiz, lista);
        return lista;
    }

    private void inorden(Nodo<T> nodo, ListaDoble<T> lista) {
        if (nodo == null) return;
        inorden(nodo.izquierdo, lista);
        lista.agregar(nodo.dato);
        inorden(nodo.derecho, lista);
    }

    public ListaDoble<T> preorden() {
        ListaDoble<T> lista = new ListaDoble<>();
        preorden(raiz, lista);
        return lista;
    }

    private void preorden(Nodo<T> nodo, ListaDoble<T> lista) {
        if (nodo == null) return;
        lista.agregar(nodo.dato);
        preorden(nodo.izquierdo, lista);
        preorden(nodo.derecho, lista);
    }

    public ListaDoble<T> postorden() {
        ListaDoble<T> lista = new ListaDoble<>();
        postorden(raiz, lista);
        return lista;
    }

    private void postorden(Nodo<T> nodo, ListaDoble<T> lista) {
        if (nodo == null) return;
        postorden(nodo.izquierdo, lista);
        postorden(nodo.derecho, lista);
        lista.agregar(nodo.dato);
    }

    public int tamanio() {
        return tamanio;
    }

    public boolean estaVacia() {
        return raiz == null;
    }

    /** El for-each recorre en inorden, es decir, ordenado. */
    @Override
    public Iterator<T> iterator() {
        return inorden().iterator();
    }
}
