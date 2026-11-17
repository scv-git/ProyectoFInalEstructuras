package co.edu.uniquindio.sga.servicio;

import co.edu.uniquindio.sga.datos.BaseDatos;
import co.edu.uniquindio.sga.dto.request.ApartamentoDTO;
import co.edu.uniquindio.sga.dto.request.EmpleadoDTO;
import co.edu.uniquindio.sga.dto.request.EstadoDTO;
import co.edu.uniquindio.sga.dto.request.HuespedDTO;
import co.edu.uniquindio.sga.estructuras.Conjunto;
import co.edu.uniquindio.sga.estructuras.ListaCircular;
import co.edu.uniquindio.sga.estructuras.ListaDoble;
import co.edu.uniquindio.sga.modelo.*;
import org.springframework.stereotype.Service;

import java.util.Comparator;

/** Gestión jerárquica de apartamentos, huéspedes y empleados con ABB, más temporadas, favoritos y turnos. */
@Service
public class CatalogoServicio {

    private final BaseDatos db;
    private final PreparacionServicio preparacion;

    public CatalogoServicio(BaseDatos db, PreparacionServicio preparacion) {
        this.db = db;
        this.preparacion = preparacion;
    }

    // Apartamentos

    public ListaDoble<Apartamento> listarApartamentos(String orden) {
        ListaDoble<Apartamento> lista = db.getApartamentos().inorden();
        Comparator<Apartamento> comparador = Comparadores.porCriterio(orden);
        return comparador == null ? lista : lista.ordenar(comparador);
    }

    public Apartamento obtenerApartamento(String codigo) {
        return db.apartamento(codigo);
    }

    public Apartamento crearApartamento(ApartamentoDTO d) {
        if (d.codigo() == null || d.codigo().isBlank()) throw new IllegalArgumentException("El código es obligatorio");
        Apartamento a = new Apartamento(d.codigo());
        a.actualizarDatos(d.nombre(), d.bloque(), d.piso(), d.dormitorios(), d.capacidad(), d.caracteristicas(),
                d.tarifaBaja(), d.tarifaMedia(), d.tarifaAlta());
        if (!db.getApartamentos().insertar(a)) throw new IllegalArgumentException("Ya existe el apartamento " + d.codigo());
        return a;
    }

    /** También se usa para definir las tarifas por temporada. */
    public Apartamento actualizarApartamento(String codigo, ApartamentoDTO d) {
        Apartamento a = db.apartamento(codigo);
        a.actualizarDatos(d.nombre(), d.bloque(), d.piso(), d.dormitorios(), d.capacidad(), d.caracteristicas(),
                d.tarifaBaja(), d.tarifaMedia(), d.tarifaAlta());
        return a;
    }

    public void eliminarApartamento(String codigo) {
        Apartamento a = db.apartamento(codigo);
        if (a.getReservas().buscarConPoda(r -> false, Reserva::estaActiva) != null) {
            throw new IllegalStateException("El apartamento tiene reservas activas");
        }
        db.getApartamentos().eliminar(a);
    }

    /** Solo para sacar de servicio o volver a ponerlo en servicio. Lo demás va por check-in, check-out y preparación. */
    public Apartamento cambiarEstado(String codigo, EstadoDTO d) {
        if (d.estado() != EstadoApartamento.FUERA_DE_SERVICIO && d.estado() != EstadoApartamento.PENDIENTE_PREPARACION) {
            throw new IllegalArgumentException("Solo se puede pasar a FUERA_DE_SERVICIO o devolver a PENDIENTE_PREPARACION");
        }
        Apartamento a = db.apartamento(codigo);
        a.cambiarEstado(d.estado(), d.motivo());
        if (d.estado() == EstadoApartamento.PENDIENTE_PREPARACION) preparacion.encolar(a);
        return a;
    }

    // Huéspedes

    public ListaDoble<Huesped> listarHuespedes() {
        return db.getHuespedes().inorden();
    }

    public Huesped obtenerHuesped(String documento) {
        return db.huesped(documento);
    }

    public Huesped crearHuesped(HuespedDTO d) {
        if (d.documento() == null || d.documento().isBlank()) throw new IllegalArgumentException("El documento es obligatorio");
        Huesped h = new Huesped(d.documento());
        h.actualizarDatos(d.nombre(), d.fechaNacimiento(), d.telefono(), d.correo(), d.foto());
        if (!db.getHuespedes().insertar(h)) throw new IllegalArgumentException("Ya existe el huésped " + d.documento());
        return h;
    }

    public Huesped actualizarHuesped(String documento, HuespedDTO d) {
        Huesped h = db.huesped(documento);
        h.actualizarDatos(d.nombre(), d.fechaNacimiento(), d.telefono(), d.correo(), d.foto());
        return h;
    }

    public void eliminarHuesped(String documento) {
        Huesped h = db.huesped(documento);
        if (h.getReservas().buscar(Reserva::estaActiva) != null) {
            throw new IllegalStateException("El huésped tiene reservas activas");
        }
        db.getHuespedes().eliminar(h);
    }

    public ListaDoble<Reserva> reservasDe(String documento) {
        return db.huesped(documento).getReservas();
    }

    public ListaDoble<Reserva> historialDe(String documento) {
        return db.huesped(documento).getHistorial();
    }

    public Conjunto<String> favoritosDe(String documento) {
        return db.huesped(documento).getFavoritos();
    }

    public Conjunto<String> agregarFavorito(String documento, String codigo) {
        db.apartamento(codigo);
        Huesped h = db.huesped(documento);
        if (!h.getFavoritos().agregar(codigo)) throw new IllegalArgumentException("El apartamento ya está en favoritos");
        return h.getFavoritos();
    }

    public Conjunto<String> quitarFavorito(String documento, String codigo) {
        Huesped h = db.huesped(documento);
        h.getFavoritos().eliminar(codigo);
        return h.getFavoritos();
    }

    // Empleados y turnos

    public ListaDoble<Empleado> listarEmpleados() {
        return db.getEmpleados().inorden();
    }

    public Empleado crearEmpleado(EmpleadoDTO d) {
        if (d.documento() == null || d.documento().isBlank()) throw new IllegalArgumentException("El documento es obligatorio");
        Empleado e = new Empleado(d.documento());
        e.actualizarDatos(d.nombre(), d.rol());
        if (!db.getEmpleados().insertar(e)) throw new IllegalArgumentException("Ya existe el empleado " + d.documento());
        if (e.getRol() == RolEmpleado.RECEPCIONISTA) db.getTurnos().agregar(e);
        return e;
    }

    public Empleado actualizarEmpleado(String documento, EmpleadoDTO d) {
        Empleado e = db.empleado(documento);
        db.getTurnos().eliminar(e);
        e.actualizarDatos(d.nombre(), d.rol());
        if (e.getRol() == RolEmpleado.RECEPCIONISTA) db.getTurnos().agregar(e);
        return e;
    }

    public void eliminarEmpleado(String documento) {
        Empleado e = db.empleado(documento);
        db.getTurnos().eliminar(e);
        db.getEmpleados().eliminar(e);
    }

    public ListaCircular<Empleado> turnos() {
        return db.getTurnos();
    }

    public Empleado turnoActual() {
        return db.getTurnos().actual();
    }

    public Empleado rotarTurno() {
        return db.getTurnos().avanzar();
    }

    // Temporadas

    public ListaDoble<PeriodoTemporada> listarTemporadas() {
        return db.getTemporadas();
    }

    public PeriodoTemporada agregarTemporada(PeriodoTemporada periodo) {
        if (db.getTemporadas().buscar(p -> p.seCruzaCon(periodo)) != null) {
            throw new IllegalArgumentException("El periodo se cruza con otra temporada definida");
        }
        db.getTemporadas().insertarOrdenado(periodo, Comparator.comparing(PeriodoTemporada::inicio));
        return periodo;
    }

    public void eliminarTemporada(int indice) {
        db.getTemporadas().eliminar(db.getTemporadas().obtener(indice));
    }
}
