package co.edu.uniquindio.sga.controlador;

import co.edu.uniquindio.sga.dto.request.MovimientoDTO;
import co.edu.uniquindio.sga.dto.request.ReservaDTO;
import co.edu.uniquindio.sga.dto.response.CotizacionDTO;
import co.edu.uniquindio.sga.dto.response.DevolucionDTO;
import co.edu.uniquindio.sga.dto.response.MensajeDTO;
import co.edu.uniquindio.sga.dto.response.ResultadoExternaDTO;
import co.edu.uniquindio.sga.estructuras.Cola;
import co.edu.uniquindio.sga.estructuras.ListaDoble;
import co.edu.uniquindio.sga.modelo.*;
import co.edu.uniquindio.sga.servicio.ReservaServicio;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reservas")
public class ReservaControlador {

    private final ReservaServicio servicio;

    public ReservaControlador(ReservaServicio servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public ListaDoble<Reserva> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public Reserva obtener(@PathVariable("id") String id) {
        return servicio.obtener(id);
    }

    /** Fechas en formato 2026-12-20. orden opcional: precio, capacidad o dormitorios. */
    @GetMapping("/disponibilidad")
    public ListaDoble<Apartamento> disponibilidad(@RequestParam("entrada") String entrada,
                                                  @RequestParam("salida") String salida,
                                                  @RequestParam("personas") int personas,
                                                  @RequestParam(value = "orden", required = false) String orden) {
        return servicio.disponibles(LocalDate.parse(entrada), LocalDate.parse(salida), personas, orden);
    }

    @PostMapping("/cotizar")
    public CotizacionDTO cotizar(@RequestBody ReservaDTO dto) {
        return servicio.cotizar(dto);
    }

    /** canal PORTAL o DIRECTA. */
    @PostMapping
    public Reserva crear(@RequestBody ReservaDTO dto) {
        return servicio.crear(dto);
    }

    @PostMapping("/{id}/anticipo")
    public Reserva pagarAnticipo(@PathVariable("id") String id) {
        return servicio.pagarAnticipo(id);
    }

    @GetMapping("/{id}/devolucion")
    public DevolucionDTO devolucion(@PathVariable("id") String id) {
        return servicio.calcularDevolucion(id);
    }

    @PostMapping("/{id}/cancelar")
    public DevolucionDTO cancelar(@PathVariable("id") String id) {
        return servicio.cancelar(id);
    }

    @PostMapping("/{id}/checkin")
    public Reserva checkIn(@PathVariable("id") String id) {
        return servicio.checkIn(id);
    }

    @PostMapping("/{id}/checkout")
    public Reserva checkOut(@PathVariable("id") String id) {
        return servicio.checkOut(id);
    }

    @PostMapping("/{id}/no-show")
    public Reserva noShow(@PathVariable("id") String id) {
        return servicio.noShow(id);
    }

    // ---------- Folio ----------

    @GetMapping("/{id}/folio")
    public Folio folio(@PathVariable("id") String id) {
        return servicio.folio(id);
    }

    @PostMapping("/{id}/folio/cargos")
    public Movimiento cargo(@PathVariable("id") String id, @RequestBody MovimientoDTO dto) {
        return servicio.registrarMovimiento(id, TipoMovimiento.CARGO, dto);
    }

    @PostMapping("/{id}/folio/pagos")
    public Movimiento pago(@PathVariable("id") String id, @RequestBody MovimientoDTO dto) {
        return servicio.registrarMovimiento(id, TipoMovimiento.PAGO, dto);
    }

    @PostMapping("/{id}/folio/deshacer")
    public Movimiento deshacer(@PathVariable("id") String id) {
        return servicio.deshacer(id);
    }

    // ---------- Grupos grandes y vencimientos ----------

    @GetMapping("/grupo")
    public ListaDoble<Apartamento> asignarGrupo(@RequestParam("entrada") String entrada,
                                                @RequestParam("salida") String salida,
                                                @RequestParam("personas") int personas) {
        return servicio.asignarGrupo(LocalDate.parse(entrada), LocalDate.parse(salida), personas);
    }

    @PostMapping("/vencimientos")
    public MensajeDTO procesarVencimientos() {
        return new MensajeDTO(servicio.procesarVencimientos() + " reservas vencidas canceladas");
    }

    // ---------- Canal externo ----------

    @GetMapping("/externas")
    public Cola<SolicitudExterna> colaExterna() {
        return servicio.colaExterna();
    }

    /** Simula la plataforma externa enviando una solicitud. */
    @PostMapping("/externas")
    public MensajeDTO encolarExterna(@RequestBody SolicitudExterna solicitud) {
        servicio.encolarExterna(solicitud);
        return new MensajeDTO("Solicitud encolada");
    }

    @PostMapping("/externas/procesar")
    public ResultadoExternaDTO procesarExterna() {
        return servicio.procesarSiguienteExterna();
    }

    @GetMapping("/conflictos")
    public ListaDoble<ConflictoCanal> conflictos() {
        return servicio.conflictos();
    }
}
