package co.edu.uniquindio.sga.datos;

import co.edu.uniquindio.sga.estructuras.*;
import co.edu.uniquindio.sga.modelo.*;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/** Almacén en memoria del alojamiento. Todo vive en las estructuras propias. */
@Component
public class BaseDatos {

    private ArbolBinarioBusqueda<Apartamento> apartamentos;
    private ArbolBinarioBusqueda<Huesped> huespedes;
    private ArbolBinarioBusqueda<Empleado> empleados;
    private ListaDoble<Reserva> reservas;
    private ListaDoble<PeriodoTemporada> temporadas;
    private ColaPrioridad<ItemPreparacion> colaPreparacion;
    private ColaPrioridad<Reserva> pendientesPorVencer;
    private Cola<SolicitudExterna> canalExterno;
    private ListaDoble<ConflictoCanal> conflictos;
    private ListaCircular<Empleado> turnos;
    private Pila<String> navegacion;
    private Grafo<String> mapa;
    private ListaDoble<NodoMapa> nodos;
    private ListaDoble<Double> tiemposPreparacion;
    private int consecutivoReservas;

    public BaseDatos() {
        reiniciar();
    }

    public void reiniciar() {
        apartamentos = new ArbolBinarioBusqueda<>();
        huespedes = new ArbolBinarioBusqueda<>();
        empleados = new ArbolBinarioBusqueda<>();
        reservas = new ListaDoble<>();
        temporadas = new ListaDoble<>();
        colaPreparacion = new ColaPrioridad<>(Comparadores.PRIORIDAD_PREPARACION);
        pendientesPorVencer = new ColaPrioridad<>(Comparadores.POR_VENCIMIENTO);
        canalExterno = new Cola<>();
        conflictos = new ListaDoble<>();
        turnos = new ListaCircular<>();
        navegacion = new Pila<>();
        mapa = new Grafo<>();
        nodos = new ListaDoble<>();
        tiemposPreparacion = new ListaDoble<>();
        consecutivoReservas = 0;
    }

    public String nuevoIdReserva() {
        consecutivoReservas++;
        return String.format("R-%04d", consecutivoReservas);
    }

    // ---------- Búsquedas que lanzan error si no existe ----------

    public Apartamento apartamento(String codigo) {
        Apartamento apartamento = apartamentos.buscar(new Apartamento(codigo));
        if (apartamento == null) throw new IllegalArgumentException("No existe el apartamento " + codigo);
        return apartamento;
    }

    public Huesped huesped(String documento) {
        Huesped huesped = huespedes.buscar(new Huesped(documento));
        if (huesped == null) throw new IllegalArgumentException("No existe el huésped " + documento);
        return huesped;
    }

    public Empleado empleado(String documento) {
        Empleado empleado = empleados.buscar(new Empleado(documento));
        if (empleado == null) throw new IllegalArgumentException("No existe el empleado " + documento);
        return empleado;
    }

    public Reserva reserva(String id) {
        Reserva reserva = reservas.buscar(r -> r.getId().equals(id));
        if (reserva == null) throw new IllegalArgumentException("No existe la reserva " + id);
        return reserva;
    }

    /** Las fechas fuera de los periodos definidos son temporada Baja. */
    public Temporada temporadaDe(LocalDate fecha) {
        PeriodoTemporada periodo = temporadas.buscar(p -> p.contiene(fecha));
        return periodo == null ? Temporada.BAJA : periodo.temporada();
    }

    public ArbolBinarioBusqueda<Apartamento> getApartamentos() { return apartamentos; }
    public ArbolBinarioBusqueda<Huesped> getHuespedes() { return huespedes; }
    public ArbolBinarioBusqueda<Empleado> getEmpleados() { return empleados; }
    public ListaDoble<Reserva> getReservas() { return reservas; }
    public ListaDoble<PeriodoTemporada> getTemporadas() { return temporadas; }
    public ColaPrioridad<ItemPreparacion> getColaPreparacion() { return colaPreparacion; }
    public ColaPrioridad<Reserva> getPendientesPorVencer() { return pendientesPorVencer; }
    public Cola<SolicitudExterna> getCanalExterno() { return canalExterno; }
    public ListaDoble<ConflictoCanal> getConflictos() { return conflictos; }
    public ListaCircular<Empleado> getTurnos() { return turnos; }
    public Pila<String> getNavegacion() { return navegacion; }
    public Grafo<String> getMapa() { return mapa; }
    public ListaDoble<NodoMapa> getNodos() { return nodos; }
    public ListaDoble<Double> getTiemposPreparacion() { return tiemposPreparacion; }
}
