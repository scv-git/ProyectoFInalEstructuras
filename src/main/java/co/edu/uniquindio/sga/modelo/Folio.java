package co.edu.uniquindio.sga.modelo;

import co.edu.uniquindio.sga.estructuras.ListaDoble;
import co.edu.uniquindio.sga.estructuras.Pila;

import java.time.LocalDateTime;

/**
 * Cuenta de una reserva. Los movimientos nunca se borran.
 * Las operaciones de recepción se apilan para poder deshacerlas con un movimiento contrario.
 */
public class Folio {

    private final ListaDoble<Movimiento> movimientos = new ListaDoble<>();
    private final Pila<Movimiento> operaciones = new Pila<>();

    /** Cargo o pago hecho por recepción, se puede deshacer. */
    public Movimiento registrar(TipoMovimiento tipo, String concepto, double valor) {
        Movimiento movimiento = registrarSistema(tipo, concepto, valor);
        operaciones.apilar(movimiento);
        return movimiento;
    }

    /** Movimiento automático del sistema, no entra a la pila de deshacer. */
    public Movimiento registrarSistema(TipoMovimiento tipo, String concepto, double valor) {
        Movimiento movimiento = new Movimiento(tipo, concepto, valor, LocalDateTime.now());
        movimientos.agregar(movimiento);
        return movimiento;
    }

    /** No borra la última operación, registra su contrario. Lanza EstructuraVaciaException si no hay qué deshacer. */
    public Movimiento deshacer() {
        Movimiento contrario = operaciones.desapilar().contrario();
        movimientos.agregar(contrario);
        return contrario;
    }

    public ListaDoble<Movimiento> getMovimientos() {
        return movimientos;
    }

    public double getTotalCargos() {
        return sumar(TipoMovimiento.CARGO);
    }

    public double getTotalPagos() {
        return sumar(TipoMovimiento.PAGO);
    }

    /** Lo que el huésped aún debe. */
    public double getSaldo() {
        return getTotalCargos() - getTotalPagos();
    }

    private double sumar(TipoMovimiento tipo) {
        double total = 0;
        for (Movimiento m : movimientos) {
            if (m.tipo() == tipo) total += m.valor();
        }
        return total;
    }
}
