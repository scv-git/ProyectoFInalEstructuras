package co.edu.uniquindio.sga.servicio;

import co.edu.uniquindio.sga.datos.BaseDatos;
import co.edu.uniquindio.sga.dto.response.EstadisticasDTO;
import co.edu.uniquindio.sga.dto.response.EstadisticasDTO.OcupacionApartamento;
import co.edu.uniquindio.sga.dto.response.EstadisticasDTO.OcupacionTemporada;
import co.edu.uniquindio.sga.dto.response.EstadisticasDTO.ReservasCanal;
import co.edu.uniquindio.sga.estructuras.ListaDoble;
import co.edu.uniquindio.sga.excepciones.FechasInvalidasException;
import co.edu.uniquindio.sga.modelo.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/** Estadísticas obtenidas recorriendo las estructuras. El periodo va de desde (incluido) a hasta (excluido). */
@Service
public class ReporteServicio {

    private final BaseDatos db;

    public ReporteServicio(BaseDatos db) {
        this.db = db;
    }

    public EstadisticasDTO generar(LocalDate desde, LocalDate hasta) {
        if (!hasta.isAfter(desde)) throw new FechasInvalidasException("La fecha final debe ser posterior a la inicial");
        long diasPeriodo = ChronoUnit.DAYS.between(desde, hasta);

        // Ocupación por apartamento
        ListaDoble<OcupacionApartamento> porApartamento = new ListaDoble<>();
        for (Apartamento a : db.getApartamentos()) {
            int noches = 0;
            for (Reserva r : a.getReservas()) {
                if (!vendida(r)) continue;
                for (LocalDate noche : r.getEstancia()) {
                    if (enPeriodo(noche, desde, hasta)) noches++;
                }
            }
            porApartamento.agregar(new OcupacionApartamento(a.getCodigo(), noches, redondear(noches * 100.0 / diasPeriodo)));
        }

        // Ocupación por temporada, desde el desglose liquidado
        Temporada[] temporadas = Temporada.values();
        int[] nochesTemporada = new int[temporadas.length];
        double[] valorTemporada = new double[temporadas.length];
        for (Reserva r : db.getReservas()) {
            if (!vendida(r)) continue;
            for (NocheLiquidada n : r.getDesglose()) {
                if (!enPeriodo(n.noche(), desde, hasta)) continue;
                nochesTemporada[n.temporada().ordinal()]++;
                valorTemporada[n.temporada().ordinal()] += n.valor();
            }
        }
        ListaDoble<OcupacionTemporada> porTemporada = new ListaDoble<>();
        for (Temporada t : temporadas) {
            porTemporada.agregar(new OcupacionTemporada(t, nochesTemporada[t.ordinal()], valorTemporada[t.ordinal()]));
        }

        // Ingresos del periodo: pagos netos recibidos
        double ingresos = 0;
        for (Reserva r : db.getReservas()) {
            for (Movimiento m : r.getFolio().getMovimientos()) {
                if (m.tipo() == TipoMovimiento.PAGO && enPeriodo(m.fecha().toLocalDate(), desde, hasta)) ingresos += m.valor();
            }
        }

        // Reservas por canal, incluidas canceladas y no-show
        int[][] conteo = new int[Canal.values().length][EstadoReserva.values().length];
        for (Reserva r : db.getReservas()) conteo[r.getCanal().ordinal()][r.getEstado().ordinal()]++;
        ListaDoble<ReservasCanal> porCanal = new ListaDoble<>();
        for (Canal c : Canal.values()) {
            int[] f = conteo[c.ordinal()];
            int total = 0;
            for (int valor : f) total += valor;
            porCanal.agregar(new ReservasCanal(c, total,
                    f[EstadoReserva.PENDIENTE.ordinal()], f[EstadoReserva.CONFIRMADA.ordinal()],
                    f[EstadoReserva.EN_CURSO.ordinal()], f[EstadoReserva.FINALIZADA.ordinal()],
                    f[EstadoReserva.CANCELADA.ordinal()], f[EstadoReserva.NO_SHOW.ordinal()]));
        }

        // Tiempo promedio de preparación
        double suma = 0;
        for (Double minutos : db.getTiemposPreparacion()) suma += minutos;
        double promedio = db.getTiemposPreparacion().estaVacia() ? 0 : suma / db.getTiemposPreparacion().tamanio();

        return new EstadisticasDTO(desde, hasta, porApartamento, porTemporada, ingresos, porCanal,
                db.getConflictos().tamanio(), db.getConflictos(), redondear(promedio));
    }

    /** Reservas cuyas noches cuentan como vendidas. */
    private boolean vendida(Reserva r) {
        return r.getEstado() == EstadoReserva.CONFIRMADA || r.getEstado() == EstadoReserva.EN_CURSO
                || r.getEstado() == EstadoReserva.FINALIZADA;
    }

    private boolean enPeriodo(LocalDate fecha, LocalDate desde, LocalDate hasta) {
        return !fecha.isBefore(desde) && fecha.isBefore(hasta);
    }

    private double redondear(double valor) {
        return Math.round(valor * 100) / 100.0;
    }
}
