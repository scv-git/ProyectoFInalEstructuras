package co.edu.uniquindio.sga.servicio;

import co.edu.uniquindio.sga.datos.BaseDatos;
import co.edu.uniquindio.sga.estructuras.ColaPrioridad;
import co.edu.uniquindio.sga.estructuras.Grafo;
import co.edu.uniquindio.sga.estructuras.ListaDoble;
import co.edu.uniquindio.sga.excepciones.EstructuraVaciaException;
import co.edu.uniquindio.sga.modelo.*;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Cola de preparación con prioridad y ruta sugerida para el personal. */
@Service
public class PreparacionServicio {

    private final BaseDatos db;
    private final MapaServicio mapa;

    public PreparacionServicio(BaseDatos db, MapaServicio mapa) {
        this.db = db;
        this.mapa = mapa;
    }

    /** Prioridad 1 si tiene una entrada programada para hoy, con la hora de llegada del siguiente grupo. */
    public void encolar(Apartamento apartamento) {
        LocalDate hoy = LocalDate.now();
        Reserva siguiente = apartamento.getReservas().buscarConPoda(
                r -> r.getEntrada().isAfter(hoy),
                r -> r.getEntrada().equals(hoy)
                        && (r.getEstado() == EstadoReserva.PENDIENTE || r.getEstado() == EstadoReserva.CONFIRMADA));
        ItemPreparacion item = siguiente != null
                ? new ItemPreparacion(apartamento.getCodigo(), 1, siguiente.getHoraLlegada(), LocalDateTime.now())
                : new ItemPreparacion(apartamento.getCodigo(), 2, null, LocalDateTime.now());
        db.getColaPreparacion().encolar(item);
    }

    public ColaPrioridad<ItemPreparacion> cola() {
        return db.getColaPreparacion();
    }

    /** Saca el de mayor prioridad y lo pasa a En preparación. */
    public ItemPreparacion despachar() {
        while (!db.getColaPreparacion().estaVacia()) {
            ItemPreparacion item = db.getColaPreparacion().desencolar();
            Apartamento a = db.apartamento(item.codigoApartamento());
            // Si mientras esperaba salió de servicio, se descarta
            if (a.getEstado() != EstadoApartamento.PENDIENTE_PREPARACION) continue;
            a.cambiarEstado(EstadoApartamento.EN_PREPARACION, null);
            a.setInicioPreparacion(LocalDateTime.now());
            return item;
        }
        throw new EstructuraVaciaException("No hay apartamentos pendientes de preparación");
    }

    public Apartamento terminar(String codigo) {
        Apartamento a = db.apartamento(codigo);
        a.cambiarEstado(EstadoApartamento.PREPARADO, null);
        double minutos = Duration.between(a.getInicioPreparacion(), LocalDateTime.now()).toSeconds() / 60.0;
        db.getTiemposPreparacion().agregar(minutos);
        return a;
    }

    /** Desde recepción recorre los pendientes en orden de prioridad uniendo tramos de Dijkstra. */
    public Grafo.Ruta<String> rutaSugerida() {
        ListaDoble<String> camino = new ListaDoble<>();
        String actual = mapa.recepcion();
        camino.agregar(actual);
        double distancia = 0;
        for (ItemPreparacion item : db.getColaPreparacion()) {
            String destino = item.codigoApartamento();
            if (destino.equals(actual) || !db.getMapa().contiene(destino)
                    || db.apartamento(destino).getEstado() != EstadoApartamento.PENDIENTE_PREPARACION) continue;
            Grafo.Ruta<String> tramo = db.getMapa().dijkstra(actual, destino);
            if (tramo.distancia() < 0) continue; // inalcanzable por pasillo cerrado
            boolean primero = true;
            for (String nodo : tramo.camino()) {
                if (!primero) camino.agregar(nodo);
                primero = false;
            }
            distancia += tramo.distancia();
            actual = destino;
        }
        return new Grafo.Ruta<>(camino, distancia);
    }
}
