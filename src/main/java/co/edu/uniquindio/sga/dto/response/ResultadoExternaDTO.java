package co.edu.uniquindio.sga.dto.response;

import co.edu.uniquindio.sga.modelo.Reserva;

/** resultado: ACEPTADA, CONFLICTO o RECHAZADA. */
public record ResultadoExternaDTO(String resultado, String detalle, Reserva reserva) {
}
