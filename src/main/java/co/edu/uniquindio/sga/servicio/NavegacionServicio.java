package co.edu.uniquindio.sga.servicio;

import co.edu.uniquindio.sga.datos.BaseDatos;
import co.edu.uniquindio.sga.estructuras.Pila;
import org.springframework.stereotype.Service;

/** Navegación "atrás" entre pantallas con la Pila propia. */
@Service
public class NavegacionServicio {

    private static final String INICIO = "INICIO";

    private final BaseDatos db;

    public NavegacionServicio(BaseDatos db) {
        this.db = db;
    }

    public String ir(String pantalla) {
        db.getNavegacion().apilar(pantalla);
        return pantalla;
    }

    /** Saca la pantalla actual y devuelve la anterior. Lanza EstructuraVaciaException si no hay a dónde volver. */
    public String atras() {
        Pila<String> pila = db.getNavegacion();
        pila.desapilar();
        return actual();
    }

    public String actual() {
        return db.getNavegacion().estaVacia() ? INICIO : db.getNavegacion().cima();
    }
}
