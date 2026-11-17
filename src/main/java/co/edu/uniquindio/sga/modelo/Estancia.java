package co.edu.uniquindio.sga.modelo;

import co.edu.uniquindio.sga.excepciones.FechasInvalidasException;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Iterator;
import java.util.NoSuchElementException;

/**
 * Estancia de entrada a salida. La noche de salida no se cobra ni se ocupa.
 * Es iterable: for (LocalDate noche : estancia) recorre las noches a cobrar.
 */
public record Estancia(LocalDate entrada, LocalDate salida) implements Iterable<LocalDate> {

    public Estancia {
        if (entrada == null || salida == null || !salida.isAfter(entrada)) {
            throw new FechasInvalidasException("La fecha de salida debe ser posterior a la de entrada");
        }
    }

    public long noches() {
        return ChronoUnit.DAYS.between(entrada, salida);
    }

    /** Dos estancias chocan si comparten al menos una noche. */
    public boolean seSolapaCon(Estancia otra) {
        return entrada.isBefore(otra.salida) && otra.entrada.isBefore(salida);
    }

    public boolean incluyeNoche(LocalDate noche) {
        return !noche.isBefore(entrada) && noche.isBefore(salida);
    }

    @Override
    public Iterator<LocalDate> iterator() {
        return new Iterator<>() {
            private LocalDate actual = entrada;

            @Override
            public boolean hasNext() {
                return actual.isBefore(salida);
            }

            @Override
            public LocalDate next() {
                if (!hasNext()) throw new NoSuchElementException();
                LocalDate noche = actual;
                actual = actual.plusDays(1);
                return noche;
            }
        };
    }
}
