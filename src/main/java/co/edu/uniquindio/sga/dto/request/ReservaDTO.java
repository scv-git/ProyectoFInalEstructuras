package co.edu.uniquindio.sga.dto.request;

import co.edu.uniquindio.sga.modelo.Canal;
import co.edu.uniquindio.sga.modelo.Ocupante;

import java.time.LocalDate;
import java.time.LocalTime;

/** Para crear o cotizar. ocupantes incluye a todas las personas que se alojan. */
public record ReservaDTO(String documentoTitular, String codigoApartamento, Canal canal, LocalDate entrada,
                         LocalDate salida, LocalTime horaLlegada, Ocupante[] ocupantes) {
}
