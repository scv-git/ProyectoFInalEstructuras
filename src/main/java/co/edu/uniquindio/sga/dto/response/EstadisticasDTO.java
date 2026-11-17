package co.edu.uniquindio.sga.dto.response;

import co.edu.uniquindio.sga.estructuras.ListaDoble;
import co.edu.uniquindio.sga.modelo.Canal;
import co.edu.uniquindio.sga.modelo.ConflictoCanal;
import co.edu.uniquindio.sga.modelo.Temporada;

import java.time.LocalDate;

public record EstadisticasDTO(LocalDate desde, LocalDate hasta,
                              ListaDoble<OcupacionApartamento> ocupacionPorApartamento,
                              ListaDoble<OcupacionTemporada> ocupacionPorTemporada,
                              double ingresosPeriodo,
                              ListaDoble<ReservasCanal> reservasPorCanal,
                              int totalConflictos,
                              ListaDoble<ConflictoCanal> conflictos,
                              double tiempoPromedioPreparacionMin) {

    public record OcupacionApartamento(String codigoApartamento, int nochesOcupadas, double porcentaje) {
    }

    public record OcupacionTemporada(Temporada temporada, int nochesVendidas, double valorLiquidado) {
    }

    public record ReservasCanal(Canal canal, int total, int pendientes, int confirmadas, int enCurso,
                                int finalizadas, int canceladas, int noShow) {
    }
}
