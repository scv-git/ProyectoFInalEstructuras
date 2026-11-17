package co.edu.uniquindio.sga.modelo;

import java.time.LocalDate;

public record NocheLiquidada(LocalDate noche, Temporada temporada, double tarifaPorPersona,
                             int personasQuePagan, double valor) {
}
