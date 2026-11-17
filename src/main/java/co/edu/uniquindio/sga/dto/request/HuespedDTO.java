package co.edu.uniquindio.sga.dto.request;

import java.time.LocalDate;

/** foto es opcional, puede ser una URL o una imagen en base64. */
public record HuespedDTO(String documento, String nombre, LocalDate fechaNacimiento, String telefono,
                         String correo, String foto) {
}
