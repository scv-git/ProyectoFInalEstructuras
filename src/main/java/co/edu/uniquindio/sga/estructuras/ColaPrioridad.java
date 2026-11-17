package co.edu.uniquindio.sga.estructuras;

import co.edu.uniquindio.sga.excepciones.EstructuraVaciaException;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;

/**
 * Cola de prioridad genérica. Mantiene los elementos ordenados con un Comparator,
 * así el frente siempre es el de mayor prioridad.
 * Uso: cola de preparación y reservas Pendientes por hora de vencimiento.
 */
public class ColaPrioridad<T> implements Iterable<T> {

    private final ListaDoble<T> elementos = new ListaDoble<>();
    private final Comparator<? super T> comparador;

    public ColaPrioridad(Comparator<? super T> comparador) {
        this.comparador = comparador;
    }

    public void encolar(T dato) {
        elementos.insertarOrdenado(dato, comparador);
    }

    public T desencolar() {
        if (elementos.estaVacia()) throw new EstructuraVaciaException("La cola de prioridad está vacía");
        return elementos.eliminarPrimero();
    }

    public T frente() {
        if (elementos.estaVacia()) throw new EstructuraVaciaException("La cola de prioridad está vacía");
        return elementos.primero();
    }

    public int tamanio() {
        return elementos.tamanio();
    }

    public boolean estaVacia() {
        return elementos.estaVacia();
    }

    @JsonValue
    public List<T> comoLista() {
        List<T> resultado = new ArrayList<>(elementos.tamanio());
        for (T dato : this) resultado.add(dato);
        return resultado;
    }

    /** Recorre en orden de prioridad. */
    @Override
    public Iterator<T> iterator() {
        return elementos.iterator();
    }
}
