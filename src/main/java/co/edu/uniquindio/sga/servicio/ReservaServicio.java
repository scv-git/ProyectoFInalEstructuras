package co.edu.uniquindio.sga.servicio;

import co.edu.uniquindio.sga.datos.BaseDatos;
import co.edu.uniquindio.sga.dto.request.ReservaDTO;
import co.edu.uniquindio.sga.dto.request.MovimientoDTO;
import co.edu.uniquindio.sga.dto.response.CotizacionDTO;
import co.edu.uniquindio.sga.dto.response.DevolucionDTO;
import co.edu.uniquindio.sga.dto.response.FilaCalendarioDTO;
import co.edu.uniquindio.sga.dto.response.ResultadoExternaDTO;
import co.edu.uniquindio.sga.estructuras.Cola;
import co.edu.uniquindio.sga.estructuras.ColaPrioridad;
import co.edu.uniquindio.sga.estructuras.ListaDoble;
import co.edu.uniquindio.sga.excepciones.*;
import co.edu.uniquindio.sga.modelo.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.Iterator;

/** Reservas de los tres canales, ciclo de vida, folio, vencimientos, grupos grandes y calendario. */
@Service
public class ReservaServicio {

    private static final LocalTime HORA_LLEGADA_POR_DEFECTO = LocalTime.of(15, 0);

    private final BaseDatos db;
    private final PreparacionServicio preparacion;

    public ReservaServicio(BaseDatos db, PreparacionServicio preparacion) {
        this.db = db;
        this.preparacion = preparacion;
    }

    // Consultas

    public ListaDoble<Reserva> listar() {
        return db.getReservas();
    }

    public Reserva obtener(String id) {
        return db.reserva(id);
    }

    /** Apartamentos libres para el rango y número de personas, ordenados por el criterio elegido. */
    public ListaDoble<Apartamento> disponibles(LocalDate entrada, LocalDate salida, int personas, String orden) {
        Estancia estancia = new Estancia(entrada, salida);
        ListaDoble<Apartamento> libres = new ListaDoble<>();
        for (Apartamento a : db.getApartamentos()) {
            if (a.getEstado() != EstadoApartamento.FUERA_DE_SERVICIO && a.getCapacidad() >= personas
                    && !haySolapamiento(a, estancia)) {
                libres.agregar(a);
            }
        }
        Comparator<Apartamento> comparador = Comparadores.porCriterio(orden);
        return comparador == null ? libres : libres.ordenar(comparador);
    }

    /**
     * Revisa el árbol de reservas del apartamento de forma recursiva.
     * Las reservas que entran el día de salida o después no pueden chocar, así que se podan.
     */
    public boolean haySolapamiento(Apartamento apartamento, Estancia estancia) {
        return apartamento.getReservas().buscarConPoda(
                r -> !r.getEntrada().isBefore(estancia.salida()),
                r -> r.estaActiva() && r.getEstancia().seSolapaCon(estancia)) != null;
    }

    // Cotización y liquidación

    public CotizacionDTO cotizar(ReservaDTO d) {
        Apartamento a = db.apartamento(d.codigoApartamento());
        Estancia estancia = new Estancia(d.entrada(), d.salida());
        ListaDoble<Ocupante> ocupantes = aLista(d.ocupantes());
        validarCapacidad(a, ocupantes);
        int pagan = personasQuePagan(ocupantes, estancia.entrada());
        ListaDoble<NocheLiquidada> desglose = new ListaDoble<>();
        double total = liquidar(estancia.iterator(), a, pagan, desglose);
        return new CotizacionDTO(a.getCodigo(), estancia.noches(), ocupantes.tamanio(), pagan, desglose, total,
                total * Reserva.PORCENTAJE_ANTICIPO);
    }

    /** Liquida noche por noche de forma recursiva, recorriendo la estancia con su Iterator. */
    private double liquidar(Iterator<LocalDate> noches, Apartamento a, int pagan, ListaDoble<NocheLiquidada> desglose) {
        if (!noches.hasNext()) return 0;
        LocalDate noche = noches.next();
        Temporada temporada = db.temporadaDe(noche);
        double tarifa = a.tarifa(temporada);
        double valor = tarifa * pagan;
        desglose.agregar(new NocheLiquidada(noche, temporada, tarifa, pagan, valor));
        return valor + liquidar(noches, a, pagan, desglose);
    }

    private int personasQuePagan(ListaDoble<Ocupante> ocupantes, LocalDate fecha) {
        int pagan = 0;
        for (Ocupante o : ocupantes) {
            if (o.pagaEn(fecha)) pagan++;
        }
        return pagan;
    }

    private void validarCapacidad(Apartamento a, ListaDoble<Ocupante> ocupantes) {
        if (ocupantes.estaVacia()) throw new IllegalArgumentException("Debe registrar al menos un ocupante");
        if (ocupantes.tamanio() > a.getCapacidad()) {
            throw new CapacidadExcedidaException("El apartamento " + a.getCodigo() + " admite máximo "
                    + a.getCapacidad() + " personas y se registraron " + ocupantes.tamanio());
        }
    }

    // Creación

    /** Portal queda Pendiente hasta pagar el anticipo. Directa queda Confirmada. */
    public Reserva crear(ReservaDTO d) {
        if (d.canal() == null) throw new IllegalArgumentException("Debe indicar el canal");
        if (d.canal() == Canal.EXTERNA) {
            throw new IllegalArgumentException("Las reservas externas entran por la cola del canal externo");
        }
        return registrar(d.documentoTitular(), d.codigoApartamento(), d.canal(), d.entrada(), d.salida(),
                d.horaLlegada(), aLista(d.ocupantes()), true);
    }

    /** Registro común a los tres canales. validarPasado = false solo para la carga del escenario. */
    public Reserva registrar(String documento, String codigo, Canal canal, LocalDate entrada, LocalDate salida,
                             LocalTime horaLlegada, ListaDoble<Ocupante> ocupantes, boolean validarPasado) {
        Huesped titular = db.huesped(documento);
        Apartamento a = db.apartamento(codigo);
        Estancia estancia = new Estancia(entrada, salida);
        if (validarPasado && entrada.isBefore(LocalDate.now())) {
            throw new FechasInvalidasException("La fecha de entrada no puede ser anterior a hoy");
        }
        if (a.getEstado() == EstadoApartamento.FUERA_DE_SERVICIO) {
            throw new IllegalStateException("El apartamento " + codigo + " está fuera de servicio");
        }
        validarCapacidad(a, ocupantes);
        if (haySolapamiento(a, estancia)) {
            throw new ReservaSolapadaException("El apartamento " + codigo + " ya tiene una reserva activa entre "
                    + entrada + " y " + salida);
        }

        Reserva r = new Reserva(db.nuevoIdReserva(), documento, codigo, canal, estancia, ocupantes,
                horaLlegada == null ? HORA_LLEGADA_POR_DEFECTO : horaLlegada);
        ListaDoble<NocheLiquidada> desglose = new ListaDoble<>();
        double total = liquidar(estancia.iterator(), a, personasQuePagan(ocupantes, entrada), desglose);
        r.asignarLiquidacion(desglose, total);
        r.getFolio().registrarSistema(TipoMovimiento.CARGO, "Estancia de " + estancia.noches() + " noches", total);

        if (canal == Canal.PORTAL) db.getPendientesPorVencer().encolar(r);
        else r.cambiarEstado(EstadoReserva.CONFIRMADA);

        a.getReservas().insertar(r);
        db.getReservas().agregar(r);
        titular.getReservas().agregar(r);
        return r;
    }

    // Ciclo de vida

    public Reserva pagarAnticipo(String id) {
        Reserva r = db.reserva(id);
        if (r.getEstado() != EstadoReserva.PENDIENTE) {
            throw new TransicionInvalidaException("Solo se paga anticipo de reservas Pendientes");
        }
        r.cambiarEstado(EstadoReserva.CONFIRMADA);
        r.getFolio().registrarSistema(TipoMovimiento.PAGO, "Anticipo 30 %", r.getAnticipo());
        return r;
    }

    /** Política: más de 7 días antes se devuelve el 100 %, de 2 a 7 días el 50 %, menos de 2 días nada. */
    public DevolucionDTO calcularDevolucion(String id) {
        Reserva r = db.reserva(id);
        long dias = ChronoUnit.DAYS.between(LocalDate.now(), r.getEntrada());
        double porcentaje = dias > 7 ? 1.0 : dias >= 2 ? 0.5 : 0.0;
        double pagado = r.getFolio().getTotalPagos();
        return new DevolucionDTO(r.getId(), dias, pagado, porcentaje * 100, pagado * porcentaje);
    }

    public DevolucionDTO cancelar(String id) {
        Reserva r = db.reserva(id);
        DevolucionDTO devolucion = calcularDevolucion(id);
        r.cambiarEstado(EstadoReserva.CANCELADA);
        anularCargos(r, devolucion.pagado(), devolucion.devolucion());
        return devolucion;
    }

    /** Movimientos contrarios: anula la estancia, cobra la penalidad y registra la devolución. */
    private void anularCargos(Reserva r, double pagado, double devolucion) {
        Folio folio = r.getFolio();
        folio.registrarSistema(TipoMovimiento.CARGO, "Anulación de la estancia", -r.getTotal());
        if (pagado - devolucion > 0) folio.registrarSistema(TipoMovimiento.CARGO, "Penalidad por cancelación", pagado - devolucion);
        if (devolucion > 0) folio.registrarSistema(TipoMovimiento.PAGO, "Devolución al huésped", -devolucion);
    }

    /** Solo si el apartamento está Preparado. */
    public Reserva checkIn(String id) {
        Reserva r = db.reserva(id);
        Apartamento a = db.apartamento(r.getCodigoApartamento());
        if (a.getEstado() != EstadoApartamento.PREPARADO) {
            throw new TransicionInvalidaException("El apartamento " + a.getCodigo() + " no está Preparado, está " + a.getEstado());
        }
        r.cambiarEstado(EstadoReserva.EN_CURSO);
        a.cambiarEstado(EstadoApartamento.OCUPADO, null);
        return r;
    }

    /** El apartamento queda Pendiente de preparación y entra a la cola. */
    public Reserva checkOut(String id) {
        Reserva r = db.reserva(id);
        Apartamento a = db.apartamento(r.getCodigoApartamento());
        r.cambiarEstado(EstadoReserva.FINALIZADA);
        a.cambiarEstado(EstadoApartamento.PENDIENTE_PREPARACION, null);
        preparacion.encolar(a);
        db.huesped(r.getDocumentoTitular()).getHistorial().agregar(r);
        return r;
    }

    public Reserva noShow(String id) {
        Reserva r = db.reserva(id);
        r.cambiarEstado(EstadoReserva.NO_SHOW);
        return r;
    }

    // Folio

    public Folio folio(String id) {
        return db.reserva(id).getFolio();
    }

    public Movimiento registrarMovimiento(String id, TipoMovimiento tipo, MovimientoDTO d) {
        if (d.valor() <= 0) throw new IllegalArgumentException("El valor debe ser mayor que cero");
        if (d.concepto() == null || d.concepto().isBlank()) throw new IllegalArgumentException("El concepto es obligatorio");
        return db.reserva(id).getFolio().registrar(tipo, d.concepto(), d.valor());
    }

    public Movimiento deshacer(String id) {
        return db.reserva(id).getFolio().deshacer();
    }

    // Vencimiento automático

    @Scheduled(fixedRate = 60000)
    public void vencimientoProgramado() {
        procesarVencimientos();
    }

    /** Cancela las reservas Pendientes cuyo plazo de 24 horas ya pasó. */
    public int procesarVencimientos() {
        ColaPrioridad<Reserva> cola = db.getPendientesPorVencer();
        LocalDateTime ahora = LocalDateTime.now();
        int canceladas = 0;
        while (!cola.estaVacia() && !cola.frente().getVence().isAfter(ahora)) {
            Reserva r = cola.desencolar();
            if (r.getEstado() == EstadoReserva.PENDIENTE) {
                r.cambiarEstado(EstadoReserva.CANCELADA);
                anularCargos(r, 0, 0);
                canceladas++;
            }
        }
        return canceladas;
    }

    // Canal externo

    public Cola<SolicitudExterna> colaExterna() {
        return db.getCanalExterno();
    }

    public void encolarExterna(SolicitudExterna solicitud) {
        db.getCanalExterno().encolar(solicitud);
    }

    /** Procesa la siguiente solicitud en orden de llegada. Si choca se registra como conflicto de canal. */
    public ResultadoExternaDTO procesarSiguienteExterna() {
        SolicitudExterna s = db.getCanalExterno().desencolar();
        try {
            Reserva r = registrar(s.documentoTitular(), s.codigoApartamento(), Canal.EXTERNA, s.entrada(), s.salida(),
                    s.horaLlegada(), aLista(s.ocupantes()), true);
            return new ResultadoExternaDTO("ACEPTADA", "Reserva " + r.getId() + " confirmada", r);
        } catch (ReservaSolapadaException e) {
            db.getConflictos().agregar(new ConflictoCanal(s, e.getMessage(), LocalDateTime.now()));
            return new ResultadoExternaDTO("CONFLICTO", e.getMessage(), null);
        } catch (RuntimeException e) {
            return new ResultadoExternaDTO("RECHAZADA", e.getMessage(), null);
        }
    }

    public ListaDoble<ConflictoCanal> conflictos() {
        return db.getConflictos();
    }

    // Grupos grandes

    /** Busca con backtracking la combinación de apartamentos libres que aloja al grupo con el menor número de apartamentos. */
    public ListaDoble<Apartamento> asignarGrupo(LocalDate entrada, LocalDate salida, int personas) {
        if (personas <= 0) throw new IllegalArgumentException("El número de personas debe ser mayor que cero");
        Estancia estancia = new Estancia(entrada, salida);
        ListaDoble<Apartamento> libres = new ListaDoble<>();
        for (Apartamento a : db.getApartamentos()) {
            if (a.getEstado() != EstadoApartamento.FUERA_DE_SERVICIO && !haySolapamiento(a, estancia)) libres.agregar(a);
        }
        // De mayor a menor capacidad para encontrar antes buenas soluciones y podar más
        libres = libres.ordenar(Comparadores.POR_CAPACIDAD.reversed());
        Apartamento[] candidatos = new Apartamento[libres.tamanio()];
        int i = 0;
        for (Apartamento a : libres) candidatos[i++] = a;

        ListaDoble<Apartamento> mejor = mejorCombinacion(candidatos, 0, personas, new ListaDoble<>(), null);
        if (mejor == null) {
            throw new CapacidadExcedidaException("No hay apartamentos suficientes para " + personas + " personas en esas fechas");
        }
        return mejor;
    }

    private ListaDoble<Apartamento> mejorCombinacion(Apartamento[] candidatos, int indice, int faltan,
                                                     ListaDoble<Apartamento> actual, ListaDoble<Apartamento> mejor) {
        if (faltan <= 0) {
            return mejor == null || actual.tamanio() < mejor.tamanio() ? actual.copia() : mejor;
        }
        // Poda: no quedan candidatos o ya no se puede mejorar la mejor solución
        if (indice == candidatos.length || (mejor != null && actual.tamanio() + 1 >= mejor.tamanio())) return mejor;

        actual.agregar(candidatos[indice]);                       // probar incluyéndolo
        mejor = mejorCombinacion(candidatos, indice + 1, faltan - candidatos[indice].getCapacidad(), actual, mejor);
        actual.eliminarUltimo();                                  // deshacer la elección
        return mejorCombinacion(candidatos, indice + 1, faltan, actual, mejor); // probar sin él
    }

    // Calendario

    public ListaDoble<FilaCalendarioDTO> calendario(int anio, int mes) {
        YearMonth periodo = YearMonth.of(anio, mes);
        LocalDate hoy = LocalDate.now();
        ListaDoble<FilaCalendarioDTO> filas = new ListaDoble<>();
        for (Apartamento a : db.getApartamentos()) {
            String[] noches = new String[periodo.lengthOfMonth()];
            for (int dia = 1; dia <= noches.length; dia++) {
                LocalDate noche = periodo.atDay(dia);
                Reserva r = a.getReservas().buscarConPoda(
                        x -> x.getEntrada().isAfter(noche),
                        x -> x.getEstancia().incluyeNoche(noche)
                                && x.getEstado() != EstadoReserva.CANCELADA && x.getEstado() != EstadoReserva.NO_SHOW);
                if (r != null) noches[dia - 1] = r.getEstado() == EstadoReserva.PENDIENTE ? "BLOQUEADA" : "OCUPADA";
                else if (a.getEstado() == EstadoApartamento.FUERA_DE_SERVICIO && !noche.isBefore(hoy)) noches[dia - 1] = "BLOQUEADA";
                else noches[dia - 1] = "LIBRE";
            }
            filas.agregar(new FilaCalendarioDTO(a.getCodigo(), a.getNombre(), noches));
        }
        return filas;
    }

    // Auxiliares

    private ListaDoble<Ocupante> aLista(Ocupante[] arreglo) {
        ListaDoble<Ocupante> lista = new ListaDoble<>();
        if (arreglo != null) {
            for (Ocupante o : arreglo) {
                if (o == null || o.nombre() == null || o.fechaNacimiento() == null) {
                    throw new IllegalArgumentException("Cada ocupante necesita nombre y fecha de nacimiento");
                }
                lista.agregar(o);
            }
        }
        return lista;
    }
}
