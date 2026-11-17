package co.edu.uniquindio.sga.modelo;

import co.edu.uniquindio.sga.estructuras.Conjunto;
import co.edu.uniquindio.sga.estructuras.ListaDoble;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;

/** Huésped. Orden natural por documento. */
public class Huesped implements Comparable<Huesped> {

    private final String documento;
    private String nombre;
    private LocalDate fechaNacimiento;
    private String telefono;
    private String correo;
    private String foto;
    private final Conjunto<String> favoritos = new Conjunto<>();
    private final ListaDoble<Reserva> reservas = new ListaDoble<>();
    private final ListaDoble<Reserva> historial = new ListaDoble<>();

    /** También sirve como clave para buscar en el árbol. */
    public Huesped(String documento) {
        this.documento = documento;
    }

    public void actualizarDatos(String nombre, LocalDate fechaNacimiento, String telefono, String correo, String foto) {
        if (nombre == null || nombre.isBlank() || fechaNacimiento == null) {
            throw new IllegalArgumentException("Nombre y fecha de nacimiento son obligatorios");
        }
        this.nombre = nombre;
        this.fechaNacimiento = fechaNacimiento;
        this.telefono = telefono;
        this.correo = correo;
        this.foto = foto;
    }

    @Override
    public int compareTo(Huesped otro) {
        return documento.compareTo(otro.documento);
    }

    public String getDocumento() { return documento; }
    public String getNombre() { return nombre; }
    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public String getTelefono() { return telefono; }
    public String getCorreo() { return correo; }
    public String getFoto() { return foto; }
    public Conjunto<String> getFavoritos() { return favoritos; }

    @JsonIgnore
    public ListaDoble<Reserva> getReservas() { return reservas; }

    /** Estancias finalizadas. */
    @JsonIgnore
    public ListaDoble<Reserva> getHistorial() { return historial; }
}
