package co.edu.uniquindio.sga.excepciones;

/** Se lanza cuando una reserva o un apartamento intenta pasar a un estado no permitido. */
public class TransicionInvalidaException extends RuntimeException {
    public TransicionInvalidaException(String mensaje) {
        super(mensaje);
    }
}
