package co.edu.uniquindio.sga.estructuras;

import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Iterator;


/**
 * Conjunto genérico, no admite elementos repetidos.
 * Uso: apartamentos favoritos de cada huésped.
 */
public class Conjunto<T> implements Iterable<T> {

    private final ListaDoble<T> elementos = new ListaDoble<>();

    /** Devuelve false si el elemento ya estaba. */
    public boolean agregar(T dato) {
        if (elementos.contiene(dato)) return false;
        elementos.agregar(dato);
        return true;
    }

    public boolean eliminar(T dato) {
        return elementos.eliminar(dato);
    }

    public boolean contiene(T dato) {
        return elementos.contiene(dato);
    }

    public int tamanio() {
        return elementos.tamanio();
    }

    public boolean estaVacia() {
        return elementos.estaVacia();
    }

    @JsonValue
    public Object[] comoArreglo() {
        return elementos.comoArreglo();
    }

    @Override
    public Iterator<T> iterator() {
        return elementos.iterator();
    }
}
