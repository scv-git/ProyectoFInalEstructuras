package co.edu.uniquindio.sga.estructuras;

import co.edu.uniquindio.sga.excepciones.EstructuraVaciaException;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Iterator;
import java.util.NoSuchElementException;

/**
 * Cola genérica FIFO.
 * Uso: solicitudes del canal externo, procesadas en orden de llegada. También BFS en el grafo.
 */
public class Cola<T> implements Iterable<T> {

    private static class Nodo<T> {
        T dato;
        Nodo<T> siguiente;

        Nodo(T dato) {
            this.dato = dato;
        }
    }

    private Nodo<T> frente;
    private Nodo<T> fin;
    private int tamanio;

    public void encolar(T dato) {
        Nodo<T> nuevo = new Nodo<>(dato);
        if (fin == null) {
            frente = fin = nuevo;
        } else {
            fin.siguiente = nuevo;
            fin = nuevo;
        }
        tamanio++;
    }

    public T desencolar() {
        T dato = frente();
        frente = frente.siguiente;
        if (frente == null) fin = null;
        tamanio--;
        return dato;
    }

    public T frente() {
        if (frente == null) throw new EstructuraVaciaException("La cola está vacía");
        return frente.dato;
    }

    public int tamanio() {
        return tamanio;
    }

    public boolean estaVacia() {
        return frente == null;
    }

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
            private Nodo<T> actual = frente;

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
