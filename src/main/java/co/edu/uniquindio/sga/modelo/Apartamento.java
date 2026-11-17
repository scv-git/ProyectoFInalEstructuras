package co.edu.uniquindio.sga.modelo;

import co.edu.uniquindio.sga.estructuras.ArbolBinarioBusqueda;
import co.edu.uniquindio.sga.excepciones.TransicionInvalidaException;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

/** Apartamento. Orden natural por código. Sus reservas se guardan en un ABB por fecha de entrada. */
public class Apartamento implements Comparable<Apartamento> {

    private final String codigo;
    private String nombre;
    private String bloque;
    private int piso;
    private int dormitorios;
    private int capacidad;
    private String caracteristicas;
    private double tarifaBaja;
    private double tarifaMedia;
    private double tarifaAlta;
    private EstadoApartamento estado = EstadoApartamento.PREPARADO;
    private String motivoFueraServicio;
    private LocalDateTime inicioPreparacion;
    private final ArbolBinarioBusqueda<Reserva> reservas = new ArbolBinarioBusqueda<>();

    /** También sirve como clave para buscar en el árbol. */
    public Apartamento(String codigo) {
        this.codigo = codigo;
    }

    public void actualizarDatos(String nombre, String bloque, int piso, int dormitorios, int capacidad,
                                String caracteristicas, double tarifaBaja, double tarifaMedia, double tarifaAlta) {
        if (capacidad <= 0 || dormitorios <= 0) throw new IllegalArgumentException("Capacidad y dormitorios deben ser mayores que cero");
        if (tarifaBaja < 0 || tarifaMedia < 0 || tarifaAlta < 0) throw new IllegalArgumentException("Las tarifas no pueden ser negativas");
        this.nombre = nombre;
        this.bloque = bloque;
        this.piso = piso;
        this.dormitorios = dormitorios;
        this.capacidad = capacidad;
        this.caracteristicas = caracteristicas;
        this.tarifaBaja = tarifaBaja;
        this.tarifaMedia = tarifaMedia;
        this.tarifaAlta = tarifaAlta;
    }

    /** Tarifa por persona por noche según la temporada. */
    public double tarifa(Temporada temporada) {
        return switch (temporada) {
            case BAJA -> tarifaBaja;
            case MEDIA -> tarifaMedia;
            case ALTA -> tarifaAlta;
        };
    }

    public void cambiarEstado(EstadoApartamento nuevo, String motivo) {
        if (!estado.puedeCambiarA(nuevo)) {
            throw new TransicionInvalidaException("El apartamento " + codigo + " no puede pasar de " + estado + " a " + nuevo);
        }
        if (nuevo == EstadoApartamento.FUERA_DE_SERVICIO && (motivo == null || motivo.isBlank())) {
            throw new IllegalArgumentException("Debe registrar el motivo de fuera de servicio");
        }
        motivoFueraServicio = nuevo == EstadoApartamento.FUERA_DE_SERVICIO ? motivo : null;
        estado = nuevo;
    }

    /** Solo para la carga del escenario inicial. */
    public void establecerEstadoInicial(EstadoApartamento estado, String motivo) {
        this.estado = estado;
        this.motivoFueraServicio = motivo;
    }

    @Override
    public int compareTo(Apartamento otro) {
        return codigo.compareTo(otro.codigo);
    }

    public String getCodigo() { return codigo; }
    public String getNombre() { return nombre; }
    public String getBloque() { return bloque; }
    public int getPiso() { return piso; }
    public int getDormitorios() { return dormitorios; }
    public int getCapacidad() { return capacidad; }
    public String getCaracteristicas() { return caracteristicas; }
    public double getTarifaBaja() { return tarifaBaja; }
    public double getTarifaMedia() { return tarifaMedia; }
    public double getTarifaAlta() { return tarifaAlta; }
    public EstadoApartamento getEstado() { return estado; }
    public String getMotivoFueraServicio() { return motivoFueraServicio; }
    public int getNumeroReservas() { return reservas.tamanio(); }

    @JsonIgnore
    public LocalDateTime getInicioPreparacion() { return inicioPreparacion; }

    public void setInicioPreparacion(LocalDateTime inicioPreparacion) { this.inicioPreparacion = inicioPreparacion; }

    @JsonIgnore
    public ArbolBinarioBusqueda<Reserva> getReservas() { return reservas; }
}
