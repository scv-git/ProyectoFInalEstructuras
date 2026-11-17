package co.edu.uniquindio.sga.dto.response;

/** Cuánto se le devuelve al huésped si cancela. */
public record DevolucionDTO(String idReserva, long diasParaEntrada, double pagado, double porcentaje, double devolucion) {
}
