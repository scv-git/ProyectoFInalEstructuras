package co.edu.uniquindio.sga.dto.response;

import co.edu.uniquindio.sga.estructuras.ListaDoble;

public record GrupoBloqueDTO(String bloque, ListaDoble<String> apartamentos) {
}
