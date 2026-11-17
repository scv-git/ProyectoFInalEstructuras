package co.edu.uniquindio.sga.controlador;

import co.edu.uniquindio.sga.datos.CargadorEscenario;
import co.edu.uniquindio.sga.dto.response.MensajeDTO;
import co.edu.uniquindio.sga.dto.request.PantallaDTO;
import co.edu.uniquindio.sga.servicio.NavegacionServicio;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class SistemaControlador {

    private final CargadorEscenario cargador;
    private final NavegacionServicio navegacion;

    public SistemaControlador(CargadorEscenario cargador, NavegacionServicio navegacion) {
        this.cargador = cargador;
        this.navegacion = navegacion;
    }

    /** Sin cuerpo carga escenario.txt. Con cuerpo text/plain carga ese contenido. */
    @PostMapping("/datos/cargar")
    public MensajeDTO cargarDatos(@RequestBody(required = false) String contenido) {
        String resultado = contenido == null || contenido.isBlank()
                ? cargador.cargarPorDefecto()
                : cargador.cargar(contenido);
        return new MensajeDTO(resultado);
    }

    @GetMapping("/navegacion")
    public PantallaDTO pantallaActual() {
        return new PantallaDTO(navegacion.actual());
    }

    @PostMapping("/navegacion/ir")
    public PantallaDTO ir(@RequestBody PantallaDTO dto) {
        return new PantallaDTO(navegacion.ir(dto.pantalla()));
    }

    @PostMapping("/navegacion/atras")
    public PantallaDTO atras() {
        return new PantallaDTO(navegacion.atras());
    }
}
