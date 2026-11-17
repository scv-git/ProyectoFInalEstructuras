package co.edu.uniquindio.sga.dto.response;

import co.edu.uniquindio.sga.estructuras.Grafo;
import co.edu.uniquindio.sga.estructuras.ListaDoble;
import co.edu.uniquindio.sga.modelo.EstadoApartamento;
import co.edu.uniquindio.sga.modelo.TipoNodo;

public record MapaDTO(ListaDoble<Nodo> nodos, ListaDoble<Grafo.Conexion<String>> pasillos) {

    /** bloque y estado solo aplican a apartamentos. */
    public record Nodo(String id, TipoNodo tipo, String nombre, double x, double y,
                       String bloque, EstadoApartamento estado) {
    }
}
