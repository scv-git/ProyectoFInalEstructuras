package co.edu.uniquindio.sga.excepciones;

/** Se lanza cuando una estancia comparte al menos una noche con otra reserva activa del mismo apartamento. */
public class ReservaSolapadaException extends RuntimeException {
    public ReservaSolapadaException(String mensaje) {
        super(mensaje);
    }
}
