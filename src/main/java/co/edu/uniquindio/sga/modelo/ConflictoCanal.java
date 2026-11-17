package co.edu.uniquindio.sga.modelo;

import java.time.LocalDateTime;

public record ConflictoCanal(SolicitudExterna solicitud, String motivo, LocalDateTime fecha) {
}
