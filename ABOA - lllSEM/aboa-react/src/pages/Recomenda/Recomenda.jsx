import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./recomenda_nova.module.css";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Recomenda() {
  const query = useQuery();
  const termoBusca = query.get("q") || "";

  const [destaque, setDestaque] = useState(null);
  const [outras, setOutras] = useState([]);
  const navigate = useNavigate();
  const miniMapElementRef = useRef(null);
  const miniMapRef = useRef(null);
  const miniMapMarkersRef = useRef(null);

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
  });

  const abrirRotaNoApp = async (estabelecimento) => {
    const coords = estabelecimento?.location?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) {
      alert('Este estabelecimento ainda nao possui coordenadas para rota.');
      return;
    }

    const [destinoLng, destinoLat] = coords;
    const destinoNome = estabelecimento?.nome || 'Destino';

    const navegar = (origem) => {
      const params = new URLSearchParams({
        destinoLng: String(destinoLng),
        destinoLat: String(destinoLat),
        destinoNome
      });

      if (origem) {
        params.set('origemLng', String(origem.lng));
        params.set('origemLat', String(origem.lat));
        params.set('origemNome', origem.nome);
      }

      navigate(`/mapa?${params.toString()}`);
    };

    if (!navigator.geolocation) {
      navegar(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        navegar({
          lng: position.coords.longitude,
          lat: position.coords.latitude,
          nome: 'Minha localizacao'
        });
      },
      () => navegar(null),
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };


  async function buscar(termo) {
    const resp = await fetch(
      `http://localhost:5000/api/estabelecimentos/buscar?q=${encodeURIComponent(
        termo
      )}`
    );
    const data = await resp.json();

    if (data.length === 0) {
      setDestaque(null);
      setOutras([]);
      return;
    }

    setDestaque(data[0]);
    setOutras(data.slice(1, 4)); // só 3
  }

  async function carregarTodos() {
    const resp = await fetch("http://localhost:5000/api/estabelecimentos");
    const data = await resp.json();

    setDestaque(data[0] || null);
    setOutras(data.slice(1, 4));
  }

  useEffect(() => {
    if (!termoBusca.trim()) carregarTodos();
    else buscar(termoBusca);
  }, [termoBusca]);

  useEffect(() => {
    const coords = destaque?.location?.coordinates;
    if (!miniMapElementRef.current || !Array.isArray(coords) || coords.length < 2) {
      return;
    }

    const [lng, lat] = coords;
    if (!miniMapRef.current) {
      miniMapRef.current = L.map(miniMapElementRef.current, {
        zoomControl: false,
        attributionControl: true
      }).setView([lat, lng], 15);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(miniMapRef.current);

      miniMapMarkersRef.current = L.layerGroup().addTo(miniMapRef.current);
    } else {
      miniMapRef.current.setView([lat, lng], 15);
    }

    miniMapMarkersRef.current.clearLayers();
    L.marker([lat, lng]).addTo(miniMapMarkersRef.current).bindPopup(destaque.nome || "Local");

    setTimeout(() => {
      miniMapRef.current?.invalidateSize();
    }, 0);

    return () => {
      if (miniMapRef.current) {
        miniMapRef.current.remove();
        miniMapRef.current = null;
        miniMapMarkersRef.current = null;
      }
    };
  }, [destaque?._id]);

  return (
    <div className={styles.recoPage}>
      {/* NAVBAR */}
      <nav className={styles.recoNavbar}>
        <div
          className={styles.recoLogo}
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          <img src="/imgs/Logo Aboa 1.png" alt="Logo" />
        </div>

        <div className={styles.recoLinks}>
          {(() => {
            const usuario = JSON.parse(localStorage.getItem("usuario"));
            if (!usuario) return <a href="/login">Minha conta</a>;
            if (usuario.tipo === "restaurante")
              return <a href="/minha-conta-rest">Minha conta</a>;
            return <a href="/minha-conta-usuario">Minha conta</a>;
          })()}
          <a href="/login">Sair</a>
        </div>
      </nav>

      {/* DESTAQUE */}
      {destaque ? (
        <div className={styles.recoMain}>
          <div className={styles.recoInfo}>
            <h1>A boa de hoje é:</h1>
            <h2 className={styles.recoName}>{destaque.nome}</h2>
            <p className={styles.recoDesc}>{destaque.descricao}</p>

            <div className={styles.recoButtons}>
              {/* VER CARDÁPIO */}
              <button
                onClick={() =>
                  navigate("/cardapio", {
                    state: { restaurante: destaque }
                  })
                }
              >
                Ver Cardápio
              </button>
            </div>

            <div className={styles.recoMiniMap}>
              <p className={styles.enderecoLinha}>
                <span className={styles.pinIcon}>📍</span>
                {destaque.endereco}
              </p>

                  <div
                    ref={miniMapElementRef}
                    className={styles.miniMapFrame}
                    aria-label={`Mini mapa de ${destaque.nome}`}
                  />

                  <button
                type="button"
                className={styles.comoChegarBtn}
                onClick={() => abrirRotaNoApp(destaque)}
              >
                    Como chegar
              </button>
            </div>
          </div>

          <div className={styles.recoImageVertical}>
            <img
              src={`http://localhost:5000${destaque.fotoUrl}`}
              alt={destaque.nome}
            />
          </div>
        </div>
      ) : (
        <p className={styles.loading}>Nenhum resultado encontrado :(</p>
      )}


      {/* OUTRAS RECOMENDAÇÕES */}
      <div className={styles.recoOtherTitle}>Outras recomendações:</div>

      <div className={styles.recoCards}>
        {outras.map((item) => (
          <div key={item._id} className={styles.recoCard}>
            <div className={styles.recoCardImg}>
              <img
                src={`http://localhost:5000${item.fotoUrl}`}
                alt={item.nome}
              />
            </div>

            <h3 className={styles.recoCardTitle}>{item.nome}</h3>
            <p className={styles.recoCardDesc}>{item.descricao}</p>

            <button
              className={styles.recoCardBtn}
              onClick={() =>
                navigate("/cardapio", {
                  state: { restaurante: item }
                })
              }
            >
              Mais informações
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
