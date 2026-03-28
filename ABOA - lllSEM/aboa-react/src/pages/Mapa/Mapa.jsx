import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import styles from './mapa.module.css';

const iconeOrigem = L.divIcon({
  className: '',
  html: '<div style="width:24px;height:24px;border-radius:50%;background:#0f766e;color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);">O</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -10]
});

const iconeDestino = L.divIcon({
  className: '',
  html: '<div style="width:24px;height:24px;border-radius:50%;background:#b91c1c;color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);">D</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -10]
});

function distanciaMetros(coordA, coordB) {
  const [lat1, lng1] = coordA;
  const [lat2, lng2] = coordB;
  const raioTerra = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return raioTerra * c;
}

function encontrarIndiceMaisProximo(posicao, pontosRota, inicio = 0) {
  let melhorIndice = inicio;
  let menorDistancia = Number.POSITIVE_INFINITY;

  for (let i = inicio; i < pontosRota.length; i += 1) {
    const dist = distanciaMetros(posicao, pontosRota[i]);
    if (dist < menorDistancia) {
      menorDistancia = dist;
      melhorIndice = i;
    }
  }

  return {
    indice: melhorIndice,
    distancia: menorDistancia
  };
}

function calcularDistanciaRestante(posicaoAtual, rotaRestante) {
  if (!rotaRestante.length) {
    return 0;
  }

  let total = distanciaMetros(posicaoAtual, rotaRestante[0]);
  for (let i = 0; i < rotaRestante.length - 1; i += 1) {
    total += distanciaMetros(rotaRestante[i], rotaRestante[i + 1]);
  }

  return total;
}

function formatarInstrucaoPasso(step, indice) {
  const tipo = step?.maneuver?.type || '';
  const modificador = step?.maneuver?.modifier || '';
  const via = step?.name ? ` na via ${step.name}` : '';
  const mapaModificador = {
    left: 'a esquerda',
    right: 'a direita',
    straight: 'em frente',
    slight_left: 'levemente a esquerda',
    slight_right: 'levemente a direita',
    sharp_left: 'forte a esquerda',
    sharp_right: 'forte a direita',
    uturn: 'retorno'
  };
  const dir = mapaModificador[modificador] || 'em frente';

  if (tipo === 'depart') {
    return `Saia do ponto de origem${via}.`;
  }

  if (tipo === 'arrive') {
    return 'Chegada ao destino.';
  }

  if (tipo === 'roundabout') {
    return `Entre na rotatoria e siga ${via || 'ate a saida indicada'}.`;
  }

  if (tipo === 'merge') {
    return `Mantenha-se ${dir}${via}.`;
  }

  if (tipo === 'on ramp') {
    return `Acesse a alca ${dir}${via}.`;
  }

  if (tipo === 'off ramp') {
    return `Saia pela alca ${dir}${via}.`;
  }

  if (tipo === 'fork') {
    return `Na bifurcacao, siga ${dir}${via}.`;
  }

  if (tipo === 'end of road' || tipo === 'new name' || tipo === 'continue') {
    return `Continue ${dir}${via}.`;
  }

  if (tipo === 'turn') {
    return `Vire ${dir}${via}.`;
  }

  return `Siga para o proximo trecho (${indice + 1})${via}.`;
}

function Mapa() {
  const navigate = useNavigate();
  const location = useLocation();
  const [locais, setLocais] = useState([]);
  const [origemId, setOrigemId] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [rotaInfo, setRotaInfo] = useState(null);
  const [passosRota, setPassosRota] = useState([]);
  const [carregandoRota, setCarregandoRota] = useState(false);
  const [navegacaoAtiva, setNavegacaoAtiva] = useState(false);
  const [trechoAtual, setTrechoAtual] = useState('');
  const [proximosTrechos, setProximosTrechos] = useState([]);
  const [distanciaRestanteKm, setDistanciaRestanteKm] = useState(null);

  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const rotaPontosLayerRef = useRef(null);
  const rotaLayerRef = useRef(null);
  const rotaPredefinidaAplicadaRef = useRef(false);
  const pontosRotaRef = useRef([]);
  const pontoParaPassoRef = useRef([]);
  const indiceRotaAtualRef = useRef(0);
  const destinoAtualRef = useRef(null);
  const gpsWatchIdRef = useRef(null);
  const gpsMarkerRef = useRef(null);
  const origemNomeAtualRef = useRef('Origem');
  const destinoNomeAtualRef = useRef('Destino');
  const ultimoPassoFaladoRef = useRef(-1);
  const contadorForaRotaRef = useRef(0);
  const recalculandoRotaRef = useRef(false);
  const chegadaNotificadaRef = useRef(false);

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
  });

  useEffect(() => {
    if (mapRef.current) {
      return undefined;
    }

    const map = L.map('map').setView([-23.604, -46.919], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    rotaPontosLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      rotaPontosLayerRef.current = null;
      rotaLayerRef.current = null;
    };
  }, []);

  const queryParams = new URLSearchParams(location.search);
  const origemLngParam = Number(queryParams.get('origemLng'));
  const origemLatParam = Number(queryParams.get('origemLat'));
  const destinoLngParam = Number(queryParams.get('destinoLng'));
  const destinoLatParam = Number(queryParams.get('destinoLat'));
  const origemNomeParam = queryParams.get('origemNome') || 'Origem';
  const destinoNomeParam = queryParams.get('destinoNome') || 'Destino';
  const tituloMapa = destinoNomeParam && destinoNomeParam !== 'Destino'
    ? `Partiu ${destinoNomeParam}?`
    : 'Partiu?';
  const origemPadrao = {
    lng: -46.919,
    lat: -23.604,
    nome: 'Centro de Cotia'
  };

  useEffect(() => {
    buscarLocais();
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) {
      return;
    }

    markersLayerRef.current.clearLayers();

    locais.forEach((ponto) => {
      if (!ponto?.location?.coordinates || ponto.location.coordinates.length < 2) {
        return;
      }

      // No GeoJSON o formato e [long, lat], no Leaflet e [lat, long].
      const [lng, lat] = ponto.location.coordinates;
      const markerOptions = {};

      if (ponto._id === origemId) {
        markerOptions.icon = iconeOrigem;
      }

      if (ponto._id === destinoId) {
        markerOptions.icon = iconeDestino;
      }

      L.marker([lat, lng])
        .setIcon(markerOptions.icon || new L.Icon.Default())
        .addTo(markersLayerRef.current)
        .bindPopup(`<strong>${ponto.nome}</strong><br>${ponto.descricao || ''}<br>${ponto.endereco || ''}`);
    });
  }, [locais, origemId, destinoId]);

  const buscarLocais = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/locais');
      const data = await response.json();
      setLocais(data);
    } catch (err) {
      console.error('Erro ao buscar locais:', err);
    }
  };

  const falarInstrucao = (texto) => {
    if (!texto || typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = 'pt-BR';
    fala.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(fala);
  };

  const pararNavegacao = (limparDados = false) => {
    if (gpsWatchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      gpsWatchIdRef.current = null;
    }

    setNavegacaoAtiva(false);
    contadorForaRotaRef.current = 0;
    recalculandoRotaRef.current = false;

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (limparDados) {
      setTrechoAtual('');
      setProximosTrechos([]);
      setDistanciaRestanteKm(null);
      ultimoPassoFaladoRef.current = -1;
      chegadaNotificadaRef.current = false;

      if (gpsMarkerRef.current && rotaPontosLayerRef.current) {
        rotaPontosLayerRef.current.removeLayer(gpsMarkerRef.current);
        gpsMarkerRef.current = null;
      }
    }
  };

  useEffect(() => {
    return () => {
      pararNavegacao(true);
    };
  }, []);

  const limparRota = () => {
    pararNavegacao(true);

    if (rotaLayerRef.current) {
      rotaLayerRef.current.remove();
      rotaLayerRef.current = null;
    }

    if (rotaPontosLayerRef.current) {
      rotaPontosLayerRef.current.clearLayers();
    }

    setRotaInfo(null);
    setPassosRota([]);
    pontosRotaRef.current = [];
    pontoParaPassoRef.current = [];
    indiceRotaAtualRef.current = 0;
    destinoAtualRef.current = null;
  };

  const tracarRotaPorCoordenadas = async ({ origem, destino, origemNome, destinoNome }) => {
    try {
      setCarregandoRota(true);

      const response = await fetch('http://localhost:5000/api/rota/calcular', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          origem,
          destino
        })
      });

      if (!response.ok) {
        throw new Error(`Falha HTTP ${response.status}`);
      }

      const data = await response.json();
      const rota = data?.route;

      if (!rota?.geometry?.coordinates?.length) {
        throw new Error('Rota nao encontrada para os pontos selecionados.');
      }

      limparRota();

      const [origLng, origLat] = origem;
      const [destLng, destLat] = destino;

      if (rotaPontosLayerRef.current) {
        L.marker([origLat, origLng], { icon: iconeOrigem })
          .addTo(rotaPontosLayerRef.current)
          .bindPopup(`<strong>Origem</strong><br>${origemNome}`);

        L.marker([destLat, destLng], { icon: iconeDestino })
          .addTo(rotaPontosLayerRef.current)
          .bindPopup(`<strong>Destino</strong><br>${destinoNome}`);
      }

      const passos = rota?.legs?.flatMap((leg) => leg.steps || []) || [];
      const passosFormatados = passos.map((step, indice) => ({
        id: `${indice}-${step?.maneuver?.type || 'passo'}`,
        instrucao: formatarInstrucaoPasso(step, indice),
        distanciaM: Math.round(step.distance || 0)
      }));
      setPassosRota(passosFormatados);

      const pontosRota = [];
      const passoPorPonto = [];

      passos.forEach((step, passoIndice) => {
        const coordsPasso = (step?.geometry?.coordinates || []).map(([lng, lat]) => [lat, lng]);
        coordsPasso.forEach((coord, indiceCoord) => {
          const ultimo = pontosRota[pontosRota.length - 1];
          if (
            indiceCoord === 0 &&
            ultimo &&
            ultimo[0] === coord[0] &&
            ultimo[1] === coord[1]
          ) {
            return;
          }

          pontosRota.push(coord);
          passoPorPonto.push(passoIndice);
        });
      });

      if (pontosRota.length < 2) {
        const fallback = rota.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        fallback.forEach((coord) => {
          pontosRota.push(coord);
          passoPorPonto.push(0);
        });
      }

      const polyline = L.polyline(pontosRota, {
        color: '#1e40af',
        weight: 6,
        opacity: 0.85
      }).addTo(mapRef.current);

      rotaLayerRef.current = polyline;
      mapRef.current.fitBounds(polyline.getBounds(), { padding: [25, 25] });

      setRotaInfo({
        distanciaKm: (rota.distance / 1000).toFixed(2),
        duracaoMin: Math.round(rota.duration / 60),
        origemNome,
        destinoNome
      });

      pontosRotaRef.current = pontosRota;
      pontoParaPassoRef.current = passoPorPonto;
      indiceRotaAtualRef.current = 0;
      destinoAtualRef.current = { lat: destLat, lng: destLng };
      origemNomeAtualRef.current = origemNome;
      destinoNomeAtualRef.current = destinoNome;

      setTrechoAtual('');
      setProximosTrechos([]);
      setDistanciaRestanteKm(null);

      return true;
    } catch (err) {
      console.error('Erro ao tracar rota:', err);
      alert('Nao foi possivel tracar a rota no momento.');
      return false;
    } finally {
      setCarregandoRota(false);
    }
  };

  const iniciarRota = async () => {
    if (navegacaoAtiva) {
      return;
    }

    if (pontosRotaRef.current.length < 2) {
      if (origemId && destinoId) {
        const rotaCalculada = await tracarRota();
        if (!rotaCalculada) {
          return;
        }
      } else {
        alert('Trace uma rota antes de iniciar a navegacao.');
        return;
      }
    }

    if (!navigator.geolocation) {
      alert('Geolocalizacao nao suportada neste navegador.');
      return;
    }

    setNavegacaoAtiva(true);
    chegadaNotificadaRef.current = false;
    ultimoPassoFaladoRef.current = -1;
    contadorForaRotaRef.current = 0;

    gpsWatchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const posicaoAtual = [position.coords.latitude, position.coords.longitude];
        const pontos = pontosRotaRef.current;
        if (pontos.length < 2) {
          return;
        }

        const proximidade = encontrarIndiceMaisProximo(
          posicaoAtual,
          pontos,
          indiceRotaAtualRef.current
        );

        if (proximidade.distancia > 70) {
          contadorForaRotaRef.current += 1;
        } else {
          contadorForaRotaRef.current = 0;
        }

        if (
          contadorForaRotaRef.current >= 3 &&
          !recalculandoRotaRef.current &&
          destinoAtualRef.current
        ) {
          recalculandoRotaRef.current = true;
          contadorForaRotaRef.current = 0;

          tracarRotaPorCoordenadas({
            origem: [position.coords.longitude, position.coords.latitude],
            destino: [destinoAtualRef.current.lng, destinoAtualRef.current.lat],
            origemNome: 'Minha localizacao',
            destinoNome: destinoNomeAtualRef.current || 'Destino'
          }).finally(() => {
            recalculandoRotaRef.current = false;
          });

          falarInstrucao('Rota recalculada.');
          return;
        }

        indiceRotaAtualRef.current = Math.max(indiceRotaAtualRef.current, proximidade.indice);

        const rotaRestante = pontos.slice(indiceRotaAtualRef.current);
        if (rotaRestante.length >= 2 && rotaLayerRef.current) {
          rotaLayerRef.current.setLatLngs(rotaRestante);
        }

        if (rotaPontosLayerRef.current) {
          if (!gpsMarkerRef.current) {
            gpsMarkerRef.current = L.circleMarker(posicaoAtual, {
              radius: 8,
              color: '#2563eb',
              fillColor: '#60a5fa',
              fillOpacity: 0.9,
              weight: 2
            })
              .addTo(rotaPontosLayerRef.current)
              .bindPopup('Minha localizacao');
          } else {
            gpsMarkerRef.current.setLatLng(posicaoAtual);
          }
        }

        mapRef.current?.panTo(posicaoAtual, { animate: true, duration: 0.35 });

        const distanciaRestante = calcularDistanciaRestante(posicaoAtual, rotaRestante);
        setDistanciaRestanteKm((distanciaRestante / 1000).toFixed(2));

        const passoAtualIndice = pontoParaPassoRef.current[indiceRotaAtualRef.current] || 0;
        const instrucaoAtual = passosRota[passoAtualIndice]?.instrucao || 'Siga em frente no trajeto.';
        setTrechoAtual(instrucaoAtual);
        setProximosTrechos(
          passosRota
            .slice(passoAtualIndice + 1, passoAtualIndice + 4)
            .map((passo) => passo.instrucao)
        );

        if (passoAtualIndice !== ultimoPassoFaladoRef.current) {
          ultimoPassoFaladoRef.current = passoAtualIndice;
          falarInstrucao(instrucaoAtual);
        }

        if (destinoAtualRef.current) {
          const distDestino = distanciaMetros(posicaoAtual, [
            destinoAtualRef.current.lat,
            destinoAtualRef.current.lng
          ]);

          if (distDestino <= 25 && !chegadaNotificadaRef.current) {
            chegadaNotificadaRef.current = true;
            pararNavegacao(false);
            setTrechoAtual('Chegada ao destino.');
            setProximosTrechos([]);
            setDistanciaRestanteKm('0.00');
            alert('Voce chegou ao destino!');
            falarInstrucao('Voce chegou ao destino.');
          }
        }
      },
      () => {
        pararNavegacao(false);
        alert('Nao foi possivel obter sua localizacao em tempo real.');
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 1000
      }
    );
  };

  useEffect(() => {
    if (!mapRef.current || rotaPredefinidaAplicadaRef.current) {
      return;
    }

    const temDestinoValido = Number.isFinite(destinoLngParam) && Number.isFinite(destinoLatParam);
    if (!temDestinoValido) {
      return;
    }

    rotaPredefinidaAplicadaRef.current = true;

    const executarComOrigem = (origLng, origLat, origemNome) => {
      tracarRotaPorCoordenadas({
        origem: [origLng, origLat],
        destino: [destinoLngParam, destinoLatParam],
        origemNome,
        destinoNome: destinoNomeParam
      });
    };

    const temOrigemNaUrl = Number.isFinite(origemLngParam) && Number.isFinite(origemLatParam);

    if (temOrigemNaUrl) {
      executarComOrigem(origemLngParam, origemLatParam, origemNomeParam);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          executarComOrigem(
            position.coords.longitude,
            position.coords.latitude,
            'Minha localizacao'
          );
        },
        () => {
          executarComOrigem(origemPadrao.lng, origemPadrao.lat, origemPadrao.nome);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
      return;
    }

    executarComOrigem(origemPadrao.lng, origemPadrao.lat, origemPadrao.nome);
  }, [
    destinoLngParam,
    destinoLatParam,
    destinoNomeParam,
    origemLngParam,
    origemLatParam,
    origemNomeParam
  ]);

  const tracarRota = async () => {
    if (!origemId || !destinoId) {
      alert('Selecione origem e destino para calcular a rota.');
      return;
    }

    if (origemId === destinoId) {
      alert('Origem e destino precisam ser diferentes.');
      return;
    }

    const origem = locais.find((local) => local._id === origemId);
    const destino = locais.find((local) => local._id === destinoId);

    if (!origem?.location?.coordinates || !destino?.location?.coordinates) {
      alert('Nao foi possivel ler as coordenadas da origem/destino.');
      return;
    }

    return tracarRotaPorCoordenadas({
      origem: origem.location.coordinates,
      destino: destino.location.coordinates,
      origemNome: origem.nome,
      destinoNome: destino.nome
    });
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.mainContent}>
        <div className={styles['mapa-container']}>
          <div className={styles.titleRow}>
            <button type="button" className={styles.voltarBtn} onClick={() => navigate(-1)}>
              Voltar
            </button>
            <h1>{tituloMapa}</h1>
          </div>

          <div className={styles['mapa-content']}>
            <div className={styles['mapa-wrapper']}>
              <div id="map" className={styles['mapa-leaflet']}></div>
              <button
                type="button"
                className={styles.iniciarRotaBtn}
                onClick={iniciarRota}
                disabled={carregandoRota}
              >
                {navegacaoAtiva ? 'Navegacao ativa' : 'Iniciar Rota'}
              </button>
            </div>

            <div className={styles['form-adicionar-local']}>
              <h2>Trajeto no proprio app</h2>
              <div className={styles['rota-box']}>
                <select value={origemId} onChange={(e) => setOrigemId(e.target.value)}>
                  <option value="">Selecionar origem</option>
                  {locais.map((local) => (
                    <option key={`origem-${local._id}`} value={local._id}>
                      {local.nome}
                    </option>
                  ))}
                </select>

                <select value={destinoId} onChange={(e) => setDestinoId(e.target.value)}>
                  <option value="">Selecionar destino</option>
                  {locais.map((local) => (
                    <option key={`destino-${local._id}`} value={local._id}>
                      {local.nome}
                    </option>
                  ))}
                </select>

                <div className={styles['rota-actions']}>
                  <button type="button" onClick={tracarRota} disabled={carregandoRota}>
                    {carregandoRota ? 'Calculando...' : 'Tracar rota'}
                  </button>
                  <button type="button" onClick={limparRota} className={styles['btn-secundario']}>
                    Limpar rota
                  </button>
                </div>

                {rotaInfo && (
                  <p className={styles['rota-info']}>
                    De {rotaInfo.origemNome} para {rotaInfo.destinoNome}
                    <br />
                    Distancia: {rotaInfo.distanciaKm} km | Tempo estimado: {rotaInfo.duracaoMin} min
                  </p>
                )}

                {navegacaoAtiva ? (
                  <div className={styles['navegacao-box']}>
                    <h3>Trecho a seguir</h3>
                    <p className={styles['trecho-atual']}>
                      {trechoAtual || 'Aguardando atualizacao do GPS...'}
                    </p>

                    {distanciaRestanteKm !== null && (
                      <p className={styles['distancia-restante']}>
                        Distancia restante: {distanciaRestanteKm} km
                      </p>
                    )}

                    {proximosTrechos.length > 0 && (
                      <ul className={styles['proximos-trechos']}>
                        {proximosTrechos.map((trecho, index) => (
                          <li key={`${index}-${trecho}`}>{trecho}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : passosRota.length > 0 && (
                  <div className={styles['rota-passos']}>
                    <h3>Passo a passo</h3>
                    <ol>
                      {passosRota.map((passo) => (
                        <li key={passo.id}>
                          <span>{passo.instrucao}</span>
                          <small>{passo.distanciaM} m</small>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div>© 2025 ABOA — Todos os direitos reservados</div>
        <div className={styles.footerIcons}>
          <img src="/imgs/icons8-instagram-50.png" alt="Instagram" />
          <img src="/imgs/icons8-x-50.png" alt="X" />
        </div>
      </footer>
    </div>
  );
}

export default Mapa;
