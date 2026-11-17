package co.edu.uniquindio.sga.datos;

import co.edu.uniquindio.sga.dto.request.ApartamentoDTO;
import co.edu.uniquindio.sga.dto.request.EmpleadoDTO;
import co.edu.uniquindio.sga.dto.request.HuespedDTO;
import co.edu.uniquindio.sga.estructuras.ListaDoble;
import co.edu.uniquindio.sga.modelo.*;
import co.edu.uniquindio.sga.servicio.CatalogoServicio;
import co.edu.uniquindio.sga.servicio.MapaServicio;
import co.edu.uniquindio.sga.servicio.PreparacionServicio;
import co.edu.uniquindio.sga.servicio.ReservaServicio;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Carga un escenario desde un archivo plano separado por punto y coma.
 * Las fechas pueden ser absolutas, 2026-12-20, o relativas a hoy, +0, +3, -2.
 * El formato de cada línea está documentado en escenario.txt.
 */
@Component
public class CargadorEscenario {

    private final BaseDatos db;
    private final CatalogoServicio catalogo;
    private final ReservaServicio reservas;
    private final MapaServicio mapa;
    private final PreparacionServicio preparacion;

    public CargadorEscenario(BaseDatos db, CatalogoServicio catalogo, ReservaServicio reservas,
                             MapaServicio mapa, PreparacionServicio preparacion) {
        this.db = db;
        this.catalogo = catalogo;
        this.reservas = reservas;
        this.mapa = mapa;
        this.preparacion = preparacion;
    }

    /** Carga src/main/resources/escenario.txt */
    public String cargarPorDefecto() {
        try (InputStream entrada = getClass().getResourceAsStream("/escenario.txt")) {
            if (entrada == null) throw new IllegalStateException("No se encontró escenario.txt");
            return cargar(new String(entrada.readAllBytes(), StandardCharsets.UTF_8));
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo leer escenario.txt", e);
        }
    }

    /** Borra todo y carga el contenido recibido. */
    public String cargar(String contenido) {
        db.reiniciar();
        for (String linea : contenido.split("\\R")) {
            linea = linea.trim();
            if (linea.isEmpty() || linea.startsWith("#")) continue;
            try {
                procesar(linea.split(";", -1));
            } catch (RuntimeException e) {
                throw new IllegalArgumentException("Error en la línea \"" + linea + "\": " + e.getMessage());
            }
        }
        return "Escenario cargado: " + db.getApartamentos().tamanio() + " apartamentos, "
                + db.getHuespedes().tamanio() + " huéspedes, " + db.getReservas().tamanio() + " reservas, "
                + db.getCanalExterno().tamanio() + " solicitudes externas en cola";
    }

    private void procesar(String[] c) {
        switch (c[0].trim().toUpperCase()) {
            case "TEMPORADA" -> catalogo.agregarTemporada(
                    new PeriodoTemporada(Temporada.valueOf(c[1]), fecha(c[2]), fecha(c[3])));
            case "APARTAMENTO" -> catalogo.crearApartamento(new ApartamentoDTO(c[1], c[2], c[3],
                    Integer.parseInt(c[4]), Integer.parseInt(c[5]), Integer.parseInt(c[6]), c[7],
                    Double.parseDouble(c[8]), Double.parseDouble(c[9]), Double.parseDouble(c[10])));
            case "NODO" -> mapa.agregarNodo(new NodoMapa(c[1], TipoNodo.valueOf(c[2]), c[3],
                    Double.parseDouble(c[4]), Double.parseDouble(c[5])));
            case "PASILLO" -> mapa.agregarPasillo(c[1], c[2], Double.parseDouble(c[3]));
            case "HUESPED" -> catalogo.crearHuesped(new HuespedDTO(c[1], c[2], fecha(c[3]), c[4], c[5], null));
            case "EMPLEADO" -> catalogo.crearEmpleado(new EmpleadoDTO(c[1], c[2], RolEmpleado.valueOf(c[3])));
            case "RESERVA" -> cargarReserva(c);
            case "EXTERNA" -> reservas.encolarExterna(new SolicitudExterna(c[1], c[2], fecha(c[3]), fecha(c[4]),
                    LocalTime.parse(c[5]), ocupantes(c[6])));
            case "ESTADO" -> cargarEstado(c);
            case "FAVORITO" -> catalogo.agregarFavorito(c[1], c[2]);
            default -> throw new IllegalArgumentException("Tipo de línea desconocido: " + c[0]);
        }
    }

    // RESERVA;canal;documento;apartamento;entrada;salida;horaLlegada;ocupantes;estado
    private void cargarReserva(String[] c) {
        ListaDoble<Ocupante> lista = new ListaDoble<>();
        for (Ocupante o : ocupantes(c[7])) lista.agregar(o);
        Reserva r = reservas.registrar(c[2], c[3], Canal.valueOf(c[1]), fecha(c[4]), fecha(c[5]),
                LocalTime.parse(c[6]), lista, false);
        EstadoReserva objetivo = EstadoReserva.valueOf(c[8]);
        if (objetivo == EstadoReserva.PENDIENTE) return;
        if (objetivo == EstadoReserva.CANCELADA) {
            reservas.cancelar(r.getId());
            return;
        }
        if (r.getEstado() == EstadoReserva.PENDIENTE) reservas.pagarAnticipo(r.getId());
        switch (objetivo) {
            case EN_CURSO -> reservas.checkIn(r.getId());
            case NO_SHOW -> reservas.noShow(r.getId());
            case FINALIZADA -> {
                // Estancia pasada: se cierra sin tocar el estado actual del apartamento
                r.cambiarEstado(EstadoReserva.EN_CURSO);
                r.cambiarEstado(EstadoReserva.FINALIZADA);
                r.getFolio().registrarSistema(TipoMovimiento.PAGO, "Pago del saldo", r.getFolio().getSaldo());
                db.huesped(r.getDocumentoTitular()).getHistorial().agregar(r);
            }
            default -> { }
        }
    }

    // ESTADO;apartamento;estado;motivo
    private void cargarEstado(String[] c) {
        Apartamento a = db.apartamento(c[1]);
        EstadoApartamento estado = EstadoApartamento.valueOf(c[2]);
        a.establecerEstadoInicial(estado, c.length > 3 && !c[3].isBlank() ? c[3] : null);
        if (estado == EstadoApartamento.PENDIENTE_PREPARACION) preparacion.encolar(a);
    }

    /** Formato: Nombre:fechaNacimiento|Nombre:fechaNacimiento */
    private Ocupante[] ocupantes(String texto) {
        String[] partes = texto.split("\\|");
        Ocupante[] resultado = new Ocupante[partes.length];
        for (int i = 0; i < partes.length; i++) {
            String[] datos = partes[i].split(":");
            resultado[i] = new Ocupante(datos[0].trim(), LocalDate.parse(datos[1].trim()));
        }
        return resultado;
    }

    private LocalDate fecha(String texto) {
        texto = texto.trim();
        if (texto.startsWith("+") || texto.startsWith("-")) return LocalDate.now().plusDays(Integer.parseInt(texto));
        return LocalDate.parse(texto);
    }
}
