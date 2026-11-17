package co.edu.uniquindio.sga.modelo;

import java.util.Comparator;

/** Órdenes alternativos al orden natural. */
public final class Comparadores {

    private Comparadores() {
    }

    public static final Comparator<Apartamento> POR_PRECIO =
            Comparator.comparingDouble(Apartamento::getTarifaBaja);

    public static final Comparator<Apartamento> POR_CAPACIDAD =
            Comparator.comparingInt(Apartamento::getCapacidad);

    public static final Comparator<Apartamento> POR_DORMITORIOS =
            Comparator.comparingInt(Apartamento::getDormitorios);

    public static final Comparator<Apartamento> POR_NUMERO_RESERVAS =
            Comparator.comparingInt(Apartamento::getNumeroReservas);

    /** Entrada hoy primero, luego por hora de llegada, luego por quién quedó pendiente antes. */
    public static final Comparator<ItemPreparacion> PRIORIDAD_PREPARACION =
            Comparator.comparingInt(ItemPreparacion::prioridad)
                    .thenComparing(ItemPreparacion::horaLlegada, Comparator.nullsLast(Comparator.naturalOrder()))
                    .thenComparing(ItemPreparacion::pendienteDesde);

    public static final Comparator<Reserva> POR_VENCIMIENTO =
            Comparator.comparing(Reserva::getVence);

    /** criterio: precio, capacidad, dormitorios o reservas. Vacío = orden por código. */
    public static Comparator<Apartamento> porCriterio(String criterio) {
        if (criterio == null || criterio.isBlank()) return null;
        return switch (criterio.toLowerCase()) {
            case "precio" -> POR_PRECIO;
            case "capacidad" -> POR_CAPACIDAD;
            case "dormitorios" -> POR_DORMITORIOS;
            case "reservas" -> POR_NUMERO_RESERVAS;
            default -> throw new IllegalArgumentException("Criterio de orden no válido: " + criterio);
        };
    }
}
