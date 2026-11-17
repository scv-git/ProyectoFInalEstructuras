package co.edu.uniquindio.sga.modelo;

import java.time.LocalDate;
import java.time.LocalTime;

/** Solicitud enviada por la plataforma externa simulada. */
public record SolicitudExterna(String documentoTitular, String codigoApartamento, LocalDate entrada,
                               LocalDate salida, LocalTime horaLlegada, Ocupante[] ocupantes) {
}
