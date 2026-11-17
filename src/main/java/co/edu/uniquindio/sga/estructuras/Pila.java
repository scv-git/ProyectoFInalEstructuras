package co.edu.uniquindio.sga.estructuras;

import co.edu.uniquindio.sga.excepciones.EstructuraVaciaException;

import java.util.Iterator;
import java.util.NoSuchElementException;

/**
 * Pila genérica LIFO.
 * Uso: deshacer la última operación del folio y navegación "atrás" entre pantallas.
 */
public class Pila<T> implements Iterable<T> {

    private static class Nodo<T> {
        T dato;
        Nodo<T> siguiente;

        Nodo(T dato, Nodo<T> siguiente) {
            this.dato = dato;
            this.siguiente = siguiente;
        }
    }

    private Nodo<T> tope;
    private int tamanio;

    public void apilar(T dato) {
        tope = new Nodo<>(dato, tope);
        tamanio++;
    }

    public T desapilar() {
        T dato = cima();
        tope = tope.siguiente;
        tamanio--;
        return dato;
    }

    public T cima() {
        if (tope == null) throw new EstructuraVaciaException("La pila está vacía");
        return tope.dato;
    }

    public int tamanio() {
        return tamanio;
    }

    public boolean estaVacia() {
        return tope == null;
    }

    /** Recorre desde la cima hacia el fondo. */
    @Override
    public Iterator<T> iterator() {
        return new Iterator<>() {
            private Nodo<T> actual = tope;

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
