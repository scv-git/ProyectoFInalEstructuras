package co.edu.uniquindio.sga.dto.response;

/** noches[0] es el día 1 del mes. Valores: LIBRE, OCUPADA o BLOQUEADA. */
public record FilaCalendarioDTO(String codigoApartamento, String nombre, String[] noches) {
}
