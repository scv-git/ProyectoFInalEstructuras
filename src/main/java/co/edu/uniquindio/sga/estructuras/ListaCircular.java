package co.edu.uniquindio.sga.estructuras;

import co.edu.uniquindio.sga.excepciones.EstructuraVaciaException;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Iterator;
import java.util.NoSuchElementException;

/**
 * Lista circular simple genérica. El último nodo apunta al primero,
 * y el primero es el elemento actual.
 * Uso: rotación de turnos de los recepcionistas.
 */
public class ListaCircular<T> implements Iterable<T> {

    private static class Nodo<T> {
        T dato;
        Nodo<T> siguiente;

        Nodo(T dato) {
            this.dato = dato;
        }
    }

    private Nodo<T> ultimo;
    private int tamanio;

    /** Agrega al final de la rotación. */
    public void agregar(T dato) {
        Nodo<T> nuevo = new Nodo<>(dato);
        if (ultimo == null) {
            nuevo.siguiente = nuevo;
        } else {
            nuevo.siguiente = ultimo.siguiente;
            ultimo.siguiente = nuevo;
        }
        ultimo = nuevo;
        tamanio++;
    }

    public T actual() {
        if (ultimo == null) throw new EstructuraVaciaException("La lista circular está vacía");
        return ultimo.siguiente.dato;
    }

    /** Pasa al siguiente elemento y lo devuelve. */
    public T avanzar() {
        if (ultimo == null) throw new EstructuraVaciaException("La lista circular está vacía");
        ultimo = ultimo.siguiente;
        return actual();
    }

    public boolean eliminar(T dato) {
        if (ultimo == null) return false;
        Nodo<T> previo = ultimo;
        for (int i = 0; i < tamanio; i++) {
            Nodo<T> nodo = previo.siguiente;
            if (nodo.dato.equals(dato)) {
                if (tamanio == 1) {
                    ultimo = null;
                } else {
                    previo.siguiente = nodo.siguiente;
                    if (nodo == ultimo) ultimo = previo;
                }
                tamanio--;
                return true;
            }
            previo = nodo;
        }
        return false;
    }

    public int tamanio() {
        return tamanio;
    }

    public boolean estaVacia() {
        return tamanio == 0;
    }

    @JsonValue
    public Object[] comoArreglo() {
        Object[] resultado = new Object[tamanio];
        int i = 0;
        for (T dato : this) resultado[i++] = dato;
        return resultado;
    }

    /** Da una vuelta completa empezando por el actual. */
    @Override
    public Iterator<T> iterator() {
        return new Iterator<>() {
            private Nodo<T> actual = ultimo == null ? null : ultimo.siguiente;
            private int recorridos = 0;

            @Override
            public boolean hasNext() {
                return recorridos < tamanio;
            }

            @Override
            public T next() {
                if (!hasNext()) throw new NoSuchElementException();
                T dato = actual.dato;
                actual = actual.siguiente;
                recorridos++;
                return dato;
            }
        };
    }
}
