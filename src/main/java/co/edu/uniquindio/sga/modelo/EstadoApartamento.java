package co.edu.uniquindio.sga.modelo;

public enum EstadoApartamento {
    PREPARADO, OCUPADO, PENDIENTE_PREPARACION, EN_PREPARACION, FUERA_DE_SERVICIO;

    /** Transiciones permitidas del estado operativo. */
    public boolean puedeCambiarA(EstadoApartamento nuevo) {
        if (nuevo == FUERA_DE_SERVICIO) return this != OCUPADO && this != FUERA_DE_SERVICIO;
        return switch (this) {
            case PREPARADO -> nuevo == OCUPADO;
            case OCUPADO -> nuevo == PENDIENTE_PREPARACION;
            case PENDIENTE_PREPARACION -> nuevo == EN_PREPARACION;
            case EN_PREPARACION -> nuevo == PREPARADO;
            case FUERA_DE_SERVICIO -> nuevo == PENDIENTE_PREPARACION;
        };
    }
}
