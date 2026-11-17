package co.edu.uniquindio.sga.modelo;

import java.time.LocalDate;
import java.time.Period;

public record Ocupante(String nombre, LocalDate fechaNacimiento) {

    public static final int EDAD_MINIMA_PAGO = 6;

    /** Los menores de 6 años ocupan cupo pero no pagan. */
    public boolean pagaEn(LocalDate fecha) {
        return Period.between(fechaNacimiento, fecha).getYears() >= EDAD_MINIMA_PAGO;
    }
}
