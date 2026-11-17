package co.edu.uniquindio.sga.excepciones;

/** Se lanza al intentar sacar o consultar un elemento de una estructura vacía. */
public class EstructuraVaciaException extends RuntimeException {
    public EstructuraVaciaException(String mensaje) {
        super(mensaje);
    }
}
