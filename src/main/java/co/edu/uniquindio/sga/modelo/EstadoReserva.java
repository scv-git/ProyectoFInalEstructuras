package co.edu.uniquindio.sga.modelo;

/** Ciclo de vida: Pendiente → Confirmada → En curso → Finalizada, o Cancelada / No-show. */
public enum EstadoReserva {
    PENDIENTE, CONFIRMADA, EN_CURSO, FINALIZADA, CANCELADA, NO_SHOW;

    public boolean puedeCambiarA(EstadoReserva nuevo) {
        return switch (this) {
            case PENDIENTE -> nuevo == CONFIRMADA || nuevo == CANCELADA;
            case CONFIRMADA -> nuevo == EN_CURSO || nuevo == CANCELADA || nuevo == NO_SHOW;
            case EN_CURSO -> nuevo == FINALIZADA;
            default -> false;
        };
    }

    /** Una reserva activa ocupa sus noches. */
    public boolean esActiva() {
        return this == PENDIENTE || this == CONFIRMADA || this == EN_CURSO;
    }
}
