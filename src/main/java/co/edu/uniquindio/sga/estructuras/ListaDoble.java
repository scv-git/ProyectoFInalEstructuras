package co.edu.uniquindio.sga.estructuras;

import co.edu.uniquindio.sga.excepciones.EstructuraVaciaException;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Comparator;
import java.util.Iterator;
import java.util.NoSuchElementException;
import java.util.function.Predicate;

/**
 * Lista doblemente enlazada genérica.
 * Uso: historial de estancias, ocupantes de una reserva, desglose de noches y listas en general.
 */
public class ListaDoble<T> implements Iterable<T> {

    private static class Nodo<T> {
        T dato;
        Nodo<T> anterior;
        Nodo<T> siguiente;

        Nodo(T dato) {
            this.dato = dato;
        }
    }

    private Nodo<T> cabeza;
    private Nodo<T> cola;
    private int tamanio;

    /** Agrega al final. */
    public void agregar(T dato) {
        Nodo<T> nuevo = new Nodo<>(dato);
        if (cabeza == null) {
            cabeza = cola = nuevo;
        } else {
            cola.siguiente = nuevo;
            nuevo.anterior = cola;
            cola = nuevo;
        }
        tamanio++;
    }

    public void agregarInicio(T dato) {
        Nodo<T> nuevo = new Nodo<>(dato);
        if (cabeza == null) {
            cabeza = cola = nuevo;
        } else {
            nuevo.siguiente = cabeza;
            cabeza.anterior = nuevo;
            cabeza = nuevo;
        }
        tamanio++;
    }

    /** Inserta manteniendo el orden del comparador. Si hay empate queda después de los iguales. */
    public void insertarOrdenado(T dato, Comparator<? super T> comparador) {
        Nodo<T> actual = cabeza;
        while (actual != null && comparador.compare(actual.dato, dato) <= 0) {
            actual = actual.siguiente;
        }
        if (actual == null) {
            agregar(dato);
        } else if (actual.anterior == null) {
            agregarInicio(dato);
        } else {
            Nodo<T> nuevo = new Nodo<>(dato);
            nuevo.anterior = actual.anterior;
            nuevo.siguiente = actual;
            actual.anterior.siguiente = nuevo;
            actual.anterior = nuevo;
            tamanio++;
        }
    }

    public T obtener(int indice) {
        if (indice < 0 || indice >= tamanio) {
            throw new IndexOutOfBoundsException("Índice fuera de rango: " + indice);
        }
        Nodo<T> actual = cabeza;
        for (int i = 0; i < indice; i++) {
            actual = actual.siguiente;
        }
        return actual.dato;
    }

    public T primero() {
        if (cabeza == null) throw new EstructuraVaciaException("La lista está vacía");
        return cabeza.dato;
    }

    public T ultimo() {
        if (cola == null) throw new EstructuraVaciaException("La lista está vacía");
        return cola.dato;
    }

    public T eliminarPrimero() {
        T dato = primero();
        desenlazar(cabeza);
        return dato;
    }

    public T eliminarUltimo() {
        T dato = ultimo();
        desenlazar(cola);
        return dato;
    }

    /** Elimina la primera aparición del dato. */
    public boolean eliminar(T dato) {
        for (Nodo<T> actual = cabeza; actual != null; actual = actual.siguiente) {
            if (actual.dato.equals(dato)) {
                desenlazar(actual);
                return true;
            }
        }
        return false;
    }

    private void desenlazar(Nodo<T> nodo) {
        if (nodo.anterior == null) cabeza = nodo.siguiente;
        else nodo.anterior.siguiente = nodo.siguiente;
        if (nodo.siguiente == null) cola = nodo.anterior;
        else nodo.siguiente.anterior = nodo.anterior;
        tamanio--;
    }

    public boolean contiene(T dato) {
        return buscar(x -> x.equals(dato)) != null;
    }

    /** Devuelve el primer elemento que cumple la condición o null. */
    public T buscar(Predicate<T> condicion) {
        for (T dato : this) {
            if (condicion.test(dato)) return dato;
        }
        return null;
    }

    public ListaDoble<T> filtrar(Predicate<T> condicion) {
        ListaDoble<T> resultado = new ListaDoble<>();
        for (T dato : this) {
            if (condicion.test(dato)) resultado.agregar(dato);
        }
        return resultado;
    }

    public ListaDoble<T> copia() {
        return filtrar(x -> true);
    }

    /** Devuelve una nueva lista ordenada con el comparador recibido. */
    public ListaDoble<T> ordenar(Comparator<? super T> comparador) {
        ListaDoble<T> resultado = new ListaDoble<>();
        for (T dato : this) {
            resultado.insertarOrdenado(dato, comparador);
        }
        return resultado;
    }

    public int tamanio() {
        return tamanio;
    }

    public boolean estaVacia() {
        return tamanio == 0;
    }

    /** Vista de solo lectura para serializar la estructura como una lista JSON. */
    @JsonValue
    public Object[] comoArreglo() {
        Object[] resultado = new Object[tamanio];
        int i = 0;
        for (T dato : this) resultado[i++] = dato;
        return resultado;
    }

    @Override
    public Iterator<T> iterator() {
        return new Iterator<>() {
            private Nodo<T> actual = cabeza;

            @Override
            public boolean hasNext() {
                return actual != null;
            }

            @Override
            public T next() {
                if (actual == null) throw new NoSuchElementException();
                T dato = actual.dato;
                actual = actual.siguiente;
                return dato;
            }
        };
    }
}
