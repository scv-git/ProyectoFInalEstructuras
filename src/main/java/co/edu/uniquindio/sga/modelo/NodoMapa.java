package co.edu.uniquindio.sga.modelo;

/** Punto del edificio con sus coordenadas para dibujar el mapa. Para apartamentos id = código. */
public record NodoMapa(String id, TipoNodo tipo, String nombre, double x, double y) {
}
