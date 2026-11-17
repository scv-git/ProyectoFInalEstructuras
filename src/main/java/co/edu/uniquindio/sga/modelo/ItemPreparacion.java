package co.edu.uniquindio.sga.modelo;

import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Elemento de la cola de preparación.
 * prioridad 1: tiene entrada hoy, horaLlegada es la del siguiente grupo. prioridad 2: no tiene entrada hoy.
 */
public record ItemPreparacion(String codigoApartamento, int prioridad, LocalTime horaLlegada,
                              LocalDateTime pendienteDesde) {
}
