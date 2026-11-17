package co.edu.uniquindio.sga.excepciones;

/** Se lanza cuando las fechas de una estancia o periodo no son válidas. */
public class FechasInvalidasException extends RuntimeException {
    public FechasInvalidasException(String mensaje) {
        super(mensaje);
    }
}
