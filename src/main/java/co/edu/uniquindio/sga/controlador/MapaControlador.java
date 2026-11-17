package co.edu.uniquindio.sga.controlador;

import co.edu.uniquindio.sga.dto.response.GrupoBloqueDTO;
import co.edu.uniquindio.sga.dto.response.MapaDTO;
import co.edu.uniquindio.sga.dto.request.PasilloDTO;
import co.edu.uniquindio.sga.estructuras.Grafo;
import co.edu.uniquindio.sga.estructuras.ListaDoble;
import co.edu.uniquindio.sga.servicio.MapaServicio;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mapa")
public class MapaControlador {

    private final MapaServicio servicio;

    public MapaControlador(MapaServicio servicio) {
        this.servicio = servicio;
    }

    /** Nodos con coordenadas y estado en tiempo real, y pasillos. */
    @GetMapping
    public MapaDTO mapa() {
        return servicio.mapa();
    }

    @GetMapping("/ruta")
    public Grafo.Ruta<String> ruta(@RequestParam("origen") String origen, @RequestParam("destino") String destino) {
        return servicio.ruta(origen, destino);
    }

    @PostMapping("/pasillos/cerrar")
    public ListaDoble<String> cerrarPasillo(@RequestBody PasilloDTO dto) {
        servicio.cambiarPasillo(dto.origen(), dto.destino(), false);
        return servicio.inalcanzables();
    }

    @PostMapping("/pasillos/abrir")
    public ListaDoble<String> abrirPasillo(@RequestBody PasilloDTO dto) {
        servicio.cambiarPasillo(dto.origen(), dto.destino(), true);
        return servicio.inalcanzables();
    }

    @GetMapping("/inalcanzables")
    public ListaDoble<String> inalcanzables() {
        return servicio.inalcanzables();
    }

    /** origen opcional, por defecto recepción. */
    @GetMapping("/bfs")
    public ListaDoble<String> bfs(@RequestParam(value = "origen", required = false) String origen) {
        return servicio.bfs(origen);
    }

    @GetMapping("/dfs")
    public ListaDoble<String> dfs(@RequestParam(value = "origen", required = false) String origen) {
        return servicio.dfs(origen);
    }

    @GetMapping("/bloques")
    public ListaDoble<GrupoBloqueDTO> bloques() {
        return servicio.bloques();
    }
}
