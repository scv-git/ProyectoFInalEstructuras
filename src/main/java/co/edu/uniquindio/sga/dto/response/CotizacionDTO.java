package co.edu.uniquindio.sga.dto.response;

import co.edu.uniquindio.sga.estructuras.ListaDoble;
import co.edu.uniquindio.sga.modelo.NocheLiquidada;

public record CotizacionDTO(String codigoApartamento, long noches, int personas, int personasQuePagan,
                            ListaDoble<NocheLiquidada> desglose, double total, double anticipo) {
}
