package co.edu.uniquindio.sga.modelo;

/** Empleado. Orden natural por documento. */
public class Empleado implements Comparable<Empleado> {

    private final String documento;
    private String nombre;
    private RolEmpleado rol;

    public Empleado(String documento) {
        this.documento = documento;
    }

    public void actualizarDatos(String nombre, RolEmpleado rol) {
        if (nombre == null || nombre.isBlank() || rol == null) throw new IllegalArgumentException("Nombre y rol son obligatorios");
        this.nombre = nombre;
        this.rol = rol;
    }

    @Override
    public int compareTo(Empleado otro) {
        return documento.compareTo(otro.documento);
    }

    public String getDocumento() { return documento; }
    public String getNombre() { return nombre; }
    public RolEmpleado getRol() { return rol; }
}
