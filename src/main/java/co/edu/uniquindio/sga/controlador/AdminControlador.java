package co.edu.uniquindio.sga.controlador;

import co.edu.uniquindio.sga.dto.response.EstadisticasDTO;
import co.edu.uniquindio.sga.estructuras.ListaDoble;
import co.edu.uniquindio.sga.modelo.PeriodoTemporada;
import co.edu.uniquindio.sga.servicio.CatalogoServicio;
import co.edu.uniquindio.sga.servicio.ReporteServicio;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api")
public class AdminControlador {

    private final CatalogoServicio catalogo;
    private final ReporteServicio reportes;

    public AdminControlador(CatalogoServicio catalogo, ReporteServicio reportes) {
        this.catalogo = catalogo;
        this.reportes = reportes;
    }

    @GetMapping("/temporadas")
    public ListaDoble<PeriodoTemporada> temporadas() {
        return catalogo.listarTemporadas();
    }

    @PostMapping("/temporadas")
    public PeriodoTemporada agregarTemporada(@RequestBody PeriodoTemporada periodo) {
        return catalogo.agregarTemporada(periodo);
    }

    @DeleteMapping("/temporadas/{indice}")
    public void eliminarTemporada(@PathVariable("indice") int indice) {
        catalogo.eliminarTemporada(indice);
    }

    /** Sin fechas toma el mes actual. hasta no se incluye. */
    @GetMapping("/reportes")
    public EstadisticasDTO reportes(@RequestParam(value = "desde", required = false) String desde,
                                    @RequestParam(value = "hasta", required = false) String hasta) {
        LocalDate inicio = desde == null ? LocalDate.now().withDayOfMonth(1) : LocalDate.parse(desde);
        LocalDate fin = hasta == null ? inicio.plusMonths(1) : LocalDate.parse(hasta);
        return reportes.generar(inicio, fin);
    }
}
