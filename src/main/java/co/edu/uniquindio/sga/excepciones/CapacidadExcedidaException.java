package co.edu.uniquindio.sga.excepciones;

/** Se lanza cuando el número de ocupantes supera la capacidad disponible. */
public class CapacidadExcedidaException extends RuntimeException {
    public CapacidadExcedidaException(String mensaje) {
        super(mensaje);
    }
}
