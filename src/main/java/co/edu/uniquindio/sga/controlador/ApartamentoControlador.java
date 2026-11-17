package co.edu.uniquindio.sga.controlador;

import co.edu.uniquindio.sga.dto.request.ApartamentoDTO;
import co.edu.uniquindio.sga.dto.request.EstadoDTO;
import co.edu.uniquindio.sga.dto.response.FilaCalendarioDTO;
import co.edu.uniquindio.sga.estructuras.ListaDoble;
import co.edu.uniquindio.sga.modelo.Apartamento;
import co.edu.uniquindio.sga.modelo.Reserva;
import co.edu.uniquindio.sga.servicio.CatalogoServicio;
import co.edu.uniquindio.sga.servicio.ReservaServicio;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/apartamentos")
public class ApartamentoControlador {

    private final CatalogoServicio catalogo;
    private final ReservaServicio reservas;

    public ApartamentoControlador(CatalogoServicio catalogo, ReservaServicio reservas) {
        this.catalogo = catalogo;
        this.reservas = reservas;
    }

    /** Orden opcional: precio, capacidad, dormitorios o reservas. */
    @GetMapping
    public ListaDoble<Apartamento> listar(@RequestParam(value = "orden", required = false) String orden) {
        return catalogo.listarApartamentos(orden);
    }

    @GetMapping("/{codigo}")
    public Apartamento obtener(@PathVariable("codigo") String codigo) {
        return catalogo.obtenerApartamento(codigo);
    }

    @PostMapping
    public Apartamento crear(@RequestBody ApartamentoDTO dto) {
        return catalogo.crearApartamento(dto);
    }

    @PutMapping("/{codigo}")
    public Apartamento actualizar(@PathVariable("codigo") String codigo, @RequestBody ApartamentoDTO dto) {
        return catalogo.actualizarApartamento(codigo, dto);
    }

    @DeleteMapping("/{codigo}")
    public void eliminar(@PathVariable("codigo") String codigo) {
        catalogo.eliminarApartamento(codigo);
    }

    @PutMapping("/{codigo}/estado")
    public Apartamento cambiarEstado(@PathVariable("codigo") String codigo, @RequestBody EstadoDTO dto) {
        return catalogo.cambiarEstado(codigo, dto);
    }

    /** Reservas del apartamento ordenadas por fecha de entrada (recorrido inorden del árbol). */
    @GetMapping("/{codigo}/reservas")
    public ListaDoble<Reserva> reservas(@PathVariable("codigo") String codigo) {
        return catalogo.obtenerApartamento(codigo).getReservas().inorden();
    }

    @GetMapping("/calendario")
    public ListaDoble<FilaCalendarioDTO> calendario(@RequestParam("anio") int anio, @RequestParam("mes") int mes) {
        return reservas.calendario(anio, mes);
    }
}
