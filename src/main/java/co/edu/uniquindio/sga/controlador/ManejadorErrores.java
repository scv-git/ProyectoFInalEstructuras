package co.edu.uniquindio.sga.controlador;

import co.edu.uniquindio.sga.excepciones.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.DateTimeException;

/** Convierte las excepciones en respuestas 400 con un mensaje que el front puede mostrar. */
@RestControllerAdvice
public class ManejadorErrores {

    public record Error(String tipo, String mensaje) {
    }

    @ExceptionHandler({
            ReservaSolapadaException.class, CapacidadExcedidaException.class, FechasInvalidasException.class,
            TransicionInvalidaException.class, EstructuraVaciaException.class, IllegalArgumentException.class,
            IllegalStateException.class, IndexOutOfBoundsException.class, DateTimeException.class
    })
    public ResponseEntity<Error> manejar(RuntimeException e) {
        return ResponseEntity.badRequest().body(new Error(e.getClass().getSimpleName(), e.getMessage()));
    }
}
