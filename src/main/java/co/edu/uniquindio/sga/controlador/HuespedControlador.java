package co.edu.uniquindio.sga.controlador;

import co.edu.uniquindio.sga.dto.request.HuespedDTO;
import co.edu.uniquindio.sga.estructuras.Conjunto;
import co.edu.uniquindio.sga.estructuras.ListaDoble;
import co.edu.uniquindio.sga.modelo.Huesped;
import co.edu.uniquindio.sga.modelo.Reserva;
import co.edu.uniquindio.sga.servicio.CatalogoServicio;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/huespedes")
public class HuespedControlador {

    private final CatalogoServicio catalogo;

    public HuespedControlador(CatalogoServicio catalogo) {
        this.catalogo = catalogo;
    }

    @GetMapping
    public ListaDoble<Huesped> listar() {
        return catalogo.listarHuespedes();
    }

    @GetMapping("/{documento}")
    public Huesped obtener(@PathVariable("documento") String documento) {
        return catalogo.obtenerHuesped(documento);
    }

    @PostMapping
    public Huesped crear(@RequestBody HuespedDTO dto) {
        return catalogo.crearHuesped(dto);
    }

    @PutMapping("/{documento}")
    public Huesped actualizar(@PathVariable("documento") String documento, @RequestBody HuespedDTO dto) {
        return catalogo.actualizarHuesped(documento, dto);
    }

    @DeleteMapping("/{documento}")
    public void eliminar(@PathVariable("documento") String documento) {
        catalogo.eliminarHuesped(documento);
    }

    /** Todas sus reservas, cada una trae su folio y saldo. */
    @GetMapping("/{documento}/reservas")
    public ListaDoble<Reserva> reservas(@PathVariable("documento") String documento) {
        return catalogo.reservasDe(documento);
    }

    @GetMapping("/{documento}/historial")
    public ListaDoble<Reserva> historial(@PathVariable("documento") String documento) {
        return catalogo.historialDe(documento);
    }

    @GetMapping("/{documento}/favoritos")
    public Conjunto<String> favoritos(@PathVariable("documento") String documento) {
        return catalogo.favoritosDe(documento);
    }

    @PostMapping("/{documento}/favoritos/{codigo}")
    public Conjunto<String> agregarFavorito(@PathVariable("documento") String documento,
                                            @PathVariable("codigo") String codigo) {
        return catalogo.agregarFavorito(documento, codigo);
    }

    @DeleteMapping("/{documento}/favoritos/{codigo}")
    public Conjunto<String> quitarFavorito(@PathVariable("documento") String documento,
                                           @PathVariable("codigo") String codigo) {
        return catalogo.quitarFavorito(documento, codigo);
    }
}
