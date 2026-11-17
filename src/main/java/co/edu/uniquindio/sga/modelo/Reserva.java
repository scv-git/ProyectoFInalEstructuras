package co.edu.uniquindio.sga.modelo;

import co.edu.uniquindio.sga.estructuras.ListaDoble;
import co.edu.uniquindio.sga.excepciones.TransicionInvalidaException;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/** Reserva. Orden natural por fecha de entrada, el id desempata. */
public class Reserva implements Comparable<Reserva> {

    public static final double PORCENTAJE_ANTICIPO = 0.30;
    public static final int HORAS_VENCIMIENTO = 24;

    private final String id;
    private final String documentoTitular;
    private final String codigoApartamento;
    private final Canal canal;
    private final Estancia estancia;
    private final ListaDoble<Ocupante> ocupantes;
    private final LocalTime horaLlegada;
    private final LocalDateTime creada;
    private final LocalDateTime vence;
    private final Folio folio = new Folio();
    private ListaDoble<NocheLiquidada> desglose = new ListaDoble<>();
    private double total;
    private EstadoReserva estado = EstadoReserva.PENDIENTE;

    public Reserva(String id, String documentoTitular, String codigoApartamento, Canal canal,
                   Estancia estancia, ListaDoble<Ocupante> ocupantes, LocalTime horaLlegada) {
        this.id = id;
        this.documentoTitular = documentoTitular;
        this.codigoApartamento = codigoApartamento;
        this.canal = canal;
        this.estancia = estancia;
        this.ocupantes = ocupantes;
        this.horaLlegada = horaLlegada;
        this.creada = LocalDateTime.now();
        this.vence = creada.plusHours(HORAS_VENCIMIENTO);
    }

    public void cambiarEstado(EstadoReserva nuevo) {
        if (!estado.puedeCambiarA(nuevo)) {
            throw new TransicionInvalidaException("La reserva " + id + " no puede pasar de " + estado + " a " + nuevo);
        }
        estado = nuevo;
    }

    public void asignarLiquidacion(ListaDoble<NocheLiquidada> desglose, double total) {
        this.desglose = desglose;
        this.total = total;
    }

    public boolean estaActiva() {
        return estado.esActiva();
    }

    @Override
    public int compareTo(Reserva otra) {
        int comparacion = estancia.entrada().compareTo(otra.estancia.entrada());
        return comparacion != 0 ? comparacion : id.compareTo(otra.id);
    }

    public String getId() { return id; }
    public String getDocumentoTitular() { return documentoTitular; }
    public String getCodigoApartamento() { return codigoApartamento; }
    public Canal getCanal() { return canal; }
    public LocalDate getEntrada() { return estancia.entrada(); }
    public LocalDate getSalida() { return estancia.salida(); }
    public long getNoches() { return estancia.noches(); }
    public ListaDoble<Ocupante> getOcupantes() { return ocupantes; }
    public LocalTime getHoraLlegada() { return horaLlegada; }
    public LocalDateTime getCreada() { return creada; }
    public LocalDateTime getVence() { return vence; }
    public EstadoReserva getEstado() { return estado; }
    public ListaDoble<NocheLiquidada> getDesglose() { return desglose; }
    public double getTotal() { return total; }
    public double getAnticipo() { return total * PORCENTAJE_ANTICIPO; }
    public double getSaldo() { return folio.getSaldo(); }
    public Folio getFolio() { return folio; }

    @JsonIgnore
    public Estancia getEstancia() { return estancia; }
}
