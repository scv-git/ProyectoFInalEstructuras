package co.edu.uniquindio.sga.modelo;

import co.edu.uniquindio.sga.excepciones.FechasInvalidasException;

import java.time.LocalDate;

/** Fechas de una temporada, ambas incluidas. Las fechas sin periodo son temporada Baja. */
public record PeriodoTemporada(Temporada temporada, LocalDate inicio, LocalDate fin) {

    public PeriodoTemporada {
        if (temporada == null || inicio == null || fin == null || fin.isBefore(inicio)) {
            throw new FechasInvalidasException("El periodo de temporada no es válido");
        }
    }

    public boolean contiene(LocalDate fecha) {
        return !fecha.isBefore(inicio) && !fecha.isAfter(fin);
    }

    public boolean seCruzaCon(PeriodoTemporada otro) {
        return !inicio.isAfter(otro.fin) && !otro.inicio.isAfter(fin);
    }
}
