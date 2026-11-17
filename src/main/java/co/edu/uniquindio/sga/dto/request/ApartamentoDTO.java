package co.edu.uniquindio.sga.dto.request;

public record ApartamentoDTO(String codigo, String nombre, String bloque, int piso, int dormitorios, int capacidad,
                             String caracteristicas, double tarifaBaja, double tarifaMedia, double tarifaAlta) {
}
