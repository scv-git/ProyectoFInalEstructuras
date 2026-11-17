package co.edu.uniquindio.sga.dto.request;

import co.edu.uniquindio.sga.modelo.EstadoApartamento;

/** motivo es obligatorio cuando el estado es FUERA_DE_SERVICIO. */
public record EstadoDTO(EstadoApartamento estado, String motivo) {
}
