package co.edu.uniquindio.sga.controlador;

import co.edu.uniquindio.sga.estructuras.ColaPrioridad;
import co.edu.uniquindio.sga.estructuras.Grafo;
import co.edu.uniquindio.sga.modelo.Apartamento;
import co.edu.uniquindio.sga.modelo.ItemPreparacion;
import co.edu.uniquindio.sga.servicio.PreparacionServicio;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preparacion")
public class PreparacionControlador {

    private final PreparacionServicio servicio;

    public PreparacionControlador(PreparacionServicio servicio) {
        this.servicio = servicio;
    }

    /** Cola en orden de prioridad. */
    @GetMapping
    public ColaPrioridad<ItemPreparacion> cola() {
        return servicio.cola();
    }

    @PostMapping("/despachar")
    public ItemPreparacion despachar() {
        return servicio.despachar();
    }

    @PostMapping("/{codigo}/terminar")
    public Apartamento terminar(@PathVariable("codigo") String codigo) {
        return servicio.terminar(codigo);
    }

    /** Ruta desde recepción por los pendientes, calculada con Dijkstra. */
    @GetMapping("/ruta")
    public Grafo.Ruta<String> ruta() {
        return servicio.rutaSugerida();
    }
}
