package co.edu.uniquindio.sga.controlador;

import co.edu.uniquindio.sga.dto.request.EmpleadoDTO;
import co.edu.uniquindio.sga.estructuras.ListaCircular;
import co.edu.uniquindio.sga.estructuras.ListaDoble;
import co.edu.uniquindio.sga.modelo.Empleado;
import co.edu.uniquindio.sga.servicio.CatalogoServicio;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class EmpleadoControlador {

    private final CatalogoServicio catalogo;

    public EmpleadoControlador(CatalogoServicio catalogo) {
        this.catalogo = catalogo;
    }

    @GetMapping("/empleados")
    public ListaDoble<Empleado> listar() {
        return catalogo.listarEmpleados();
    }

    @PostMapping("/empleados")
    public Empleado crear(@RequestBody EmpleadoDTO dto) {
        return catalogo.crearEmpleado(dto);
    }

    @PutMapping("/empleados/{documento}")
    public Empleado actualizar(@PathVariable("documento") String documento, @RequestBody EmpleadoDTO dto) {
        return catalogo.actualizarEmpleado(documento, dto);
    }

    @DeleteMapping("/empleados/{documento}")
    public void eliminar(@PathVariable("documento") String documento) {
        catalogo.eliminarEmpleado(documento);
    }

    /** Recepcionistas en orden de rotación, empezando por el del turno actual. */
    @GetMapping("/turnos")
    public ListaCircular<Empleado> turnos() {
        return catalogo.turnos();
    }

    @GetMapping("/turnos/actual")
    public Empleado turnoActual() {
        return catalogo.turnoActual();
    }

    @PostMapping("/turnos/rotar")
    public Empleado rotar() {
        return catalogo.rotarTurno();
    }
}
