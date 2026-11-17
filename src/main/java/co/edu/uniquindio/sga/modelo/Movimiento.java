package co.edu.uniquindio.sga.modelo;

import java.time.LocalDateTime;

/** Movimiento inalterable del folio. Se corrige con un movimiento contrario. */
public record Movimiento(TipoMovimiento tipo, String concepto, double valor, LocalDateTime fecha) {

    public Movimiento contrario() {
        return new Movimiento(tipo, "Reverso: " + concepto, -valor, LocalDateTime.now());
    }
}
