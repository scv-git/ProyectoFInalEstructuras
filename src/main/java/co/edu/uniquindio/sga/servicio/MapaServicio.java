package co.edu.uniquindio.sga.servicio;

import co.edu.uniquindio.sga.datos.BaseDatos;
import co.edu.uniquindio.sga.dto.response.GrupoBloqueDTO;
import co.edu.uniquindio.sga.dto.response.MapaDTO;
import co.edu.uniquindio.sga.estructuras.Grafo;
import co.edu.uniquindio.sga.estructuras.ListaDoble;
import co.edu.uniquindio.sga.modelo.Apartamento;
import co.edu.uniquindio.sga.modelo.NodoMapa;
import co.edu.uniquindio.sga.modelo.TipoNodo;
import org.springframework.stereotype.Service;

/** Mapa del edificio: grafo, rutas, conectividad y agrupación por bloque. */
@Service
public class MapaServicio {

    private final BaseDatos db;

    public MapaServicio(BaseDatos db) {
        this.db = db;
    }

    public void agregarNodo(NodoMapa nodo) {
        db.getNodos().agregar(nodo);
        db.getMapa().agregarVertice(nodo.id());
    }

    public void agregarPasillo(String origen, String destino, double metros) {
        db.getMapa().agregarArista(origen, destino, metros);
    }

    public String recepcion() {
        NodoMapa nodo = db.getNodos().buscar(n -> n.tipo() == TipoNodo.RECEPCION);
        if (nodo == null) throw new IllegalStateException("El mapa no tiene recepción, cargue el escenario");
        return nodo.id();
    }

    /** Nodos con el estado actual de cada apartamento y los pasillos. */
    public MapaDTO mapa() {
        ListaDoble<MapaDTO.Nodo> nodos = new ListaDoble<>();
        for (NodoMapa n : db.getNodos()) {
            Apartamento a = n.tipo() == TipoNodo.APARTAMENTO ? db.getApartamentos().buscar(new Apartamento(n.id())) : null;
            nodos.agregar(new MapaDTO.Nodo(n.id(), n.tipo(), n.nombre(), n.x(), n.y(),
                    a == null ? null : a.getBloque(), a == null ? null : a.getEstado()));
        }
        return new MapaDTO(nodos, db.getMapa().conexiones());
    }

    public Grafo.Ruta<String> ruta(String origen, String destino) {
        return db.getMapa().dijkstra(origen, destino);
    }

    public void cambiarPasillo(String origen, String destino, boolean habilitado) {
        db.getMapa().cambiarEstadoArista(origen, destino, habilitado);
    }

    public ListaDoble<String> bfs(String origen) {
        return db.getMapa().bfs(origen == null ? recepcion() : origen);
    }

    public ListaDoble<String> dfs(String origen) {
        return db.getMapa().dfs(origen == null ? recepcion() : origen);
    }

    /** Apartamentos a los que no se llega desde recepción con los pasillos cerrados actuales. */
    public ListaDoble<String> inalcanzables() {
        ListaDoble<String> alcanzables = db.getMapa().bfs(recepcion());
        ListaDoble<String> resultado = new ListaDoble<>();
        for (NodoMapa n : db.getNodos()) {
            if (n.tipo() == TipoNodo.APARTAMENTO && !alcanzables.contiene(n.id())) resultado.agregar(n.id());
        }
        return resultado;
    }

    /** Recorre con BFS desde recepción y agrupa los apartamentos alcanzados por bloque. */
    public ListaDoble<GrupoBloqueDTO> bloques() {
        ListaDoble<GrupoBloqueDTO> grupos = new ListaDoble<>();
        for (String id : db.getMapa().bfs(recepcion())) {
            Apartamento a = db.getApartamentos().buscar(new Apartamento(id));
            if (a == null) continue;
            GrupoBloqueDTO grupo = grupos.buscar(g -> g.bloque().equals(a.getBloque()));
            if (grupo == null) {
                grupo = new GrupoBloqueDTO(a.getBloque(), new ListaDoble<>());
                grupos.agregar(grupo);
            }
            grupo.apartamentos().agregar(id);
        }
        return grupos;
    }
}
