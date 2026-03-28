import React, { useEffect, useState } from "react";
import styles from "./minhaconta.module.css";
import Header from "../../components/Header.jsx";
import EditarPerfilModal from "./EditarPerfilModal.jsx";
import EditarItemModal from "./EditarItemModal.jsx";

export default function MinhaContaRest() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalPerfilAberto, setModalPerfilAberto] = useState(false);
  const [modalItemAberto, setModalItemAberto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [mapaVisivel, setMapaVisivel] = useState(false);
  const [coordenadas, setCoordenadas] = useState(null);

  const emptyItem = {
    _id: null,
    nome: "",
    descricao: "",
    preco: "",
    foto: null,
    tipo: "principal",
    disponivel: true,
    emPromocao: false,
    precoPromocional: "",
    textoPromocao: "",
  };

  const [formItem, setFormItem] = useState(emptyItem);

  async function carregarItens() {
    const token = localStorage.getItem("token");
    const resp = await fetch("http://localhost:5000/api/cardapio/meus", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const itens = await resp.json();
    const itensNormalizados = itens.map((item) => ({
      ...item,
      disponivel: item.disponivel === true || item.disponivel === "true",
      emPromocao: item.emPromocao === true || item.emPromocao === "true",
    }));

    setMenuItems(itensNormalizados);
  }

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const token = localStorage.getItem("token");
        const resp = await fetch("http://localhost:5000/api/estabelecimentos/meu", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!resp.ok) {
          setLoading(false);
          return;
        }

        const dados = await resp.json();

        setPerfil({
          foto: dados.fotoUrl ? `http://localhost:5000${dados.fotoUrl}` : null,
          nome: dados.nome,
          endereco: dados.endereco,
          telefone: dados.telefone,
          descricao: dados.descricao,
          categoria: dados.categoria || "",
          tags: Array.isArray(dados.tags) ? dados.tags : [],
        });

        if (dados.location?.coordinates?.length === 2) {
          setCoordenadas({
            latitude: dados.location.coordinates[1],
            longitude: dados.location.coordinates[0],
          });
        } else {
          setCoordenadas({ latitude: -23.604, longitude: -46.919 });
        }

        await carregarItens();
      } finally {
        setLoading(false);
      }
    }

    carregarPerfil();
  }, []);

  useEffect(() => {
    if (!mapaVisivel || !coordenadas || !perfil) return;

    const loadAndInitMap = () => {
      const mapEl = document.getElementById("mapa-rest-estabelecimento");
      if (!mapEl || mapEl.dataset.initialized === "true") return;

      const L = window.L;
      const map = L.map("mapa-rest-estabelecimento").setView(
        [coordenadas.latitude, coordenadas.longitude],
        15
      );

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      L.marker([coordenadas.latitude, coordenadas.longitude])
        .addTo(map)
        .bindPopup(`<strong>${perfil.nome}</strong><br>${perfil.endereco}`)
        .openPopup();

      mapEl.dataset.initialized = "true";
    };

    if (!document.getElementById("leaflet-css-rest")) {
      const link = document.createElement("link");
      link.id = "leaflet-css-rest";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = loadAndInitMap;
      document.body.appendChild(script);
      return;
    }

    loadAndInitMap();
  }, [mapaVisivel, coordenadas, perfil]);

  function abrirNovoItem() {
    setEditando(false);
    setFormItem({ ...emptyItem });
    setModalItemAberto(true);
  }

  function editarItem(item) {
    setEditando(true);
    setFormItem(item);
    setModalItemAberto(true);
  }

  async function salvarItem() {
    const token = localStorage.getItem("token");

    if (!formItem.nome || !formItem.preco) {
      alert("Preencha nome e preço.");
      return;
    }

    const formData = new FormData();
    formData.append("nome", formItem.nome);
    formData.append("descricao", formItem.descricao || "");
    formData.append("preco", formItem.preco);
    formData.append("disponivel", formItem.disponivel);
    formData.append("emPromocao", formItem.emPromocao);
    formData.append("precoPromocional", formItem.precoPromocional || "");
    formData.append("textoPromocao", formItem.textoPromocao || "");
    formData.append("tipo", formItem.tipo);

    if (formItem.foto instanceof File) {
      formData.append("foto", formItem.foto);
    }

    let resposta;
    if (editando) {
      resposta = await fetch(`http://localhost:5000/api/cardapio/${formItem._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
    } else {
      resposta = await fetch("http://localhost:5000/api/cardapio", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
    }

    if (!resposta.ok) {
      alert("Erro ao salvar item.");
      return;
    }

    await carregarItens();
    setModalItemAberto(false);
    setFormItem({ ...emptyItem });
  }

  async function removerItem(id) {
    const token = localStorage.getItem("token");
    const ok = confirm("Deseja remover este item?");
    if (!ok) return;

    await fetch(`http://localhost:5000/api/cardapio/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    await carregarItens();
  }

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <p style={{ marginTop: "40px", textAlign: "center" }}>Carregando...</p>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <p style={{ marginTop: "40px", textAlign: "center" }}>
          Nenhum estabelecimento encontrado.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.background}></div>
      <Header />

      <div className={styles.container}>
        <h1>Minha Conta</h1>

        <div className={styles.perfilRow}>
          <div className={styles.fotoWrapper}>
            {perfil.foto ? (
              <img src={perfil.foto} alt="foto" className={styles.fotoPerfil} />
            ) : (
              <div className={styles.fotoVazia}>Sem foto</div>
            )}
          </div>

          <div className={styles.infos}>
            <h2 className={styles.nome}>{perfil.nome}</h2>
            <p>
              <b>Endereco:</b> {perfil.endereco}
            </p>
            <p>
              <b>Telefone:</b> {perfil.telefone}
            </p>
            <p className={styles.descricao}>{perfil.descricao}</p>

            <div className={styles.categoriaBox}>
              <strong>Categoria:</strong>
              <span className={styles.categoriaTag}>{perfil.categoria || "Nao informada"}</span>
            </div>

            <div className={styles.tagsBox}>
              <strong>Tags:</strong>
              <div className={styles.tagsList}>
                {perfil.tags.length > 0 ? (
                  perfil.tags.map((t, i) => (
                    <span key={i} className={styles.tagChip}>
                      {t}
                    </span>
                  ))
                ) : (
                  <span className={styles.semTags}>Nenhuma tag cadastrada</span>
                )}
              </div>
            </div>

            <div className={styles.buttonsContainer}>
              <button
                className={styles.editarPerfilBtn}
                onClick={() => setModalPerfilAberto(true)}
              >
                Editar Perfil
              </button>
              <button
                className={styles.comoChegar}
                onClick={() => setMapaVisivel((prev) => !prev)}
              >
                Como chegar
              </button>
            </div>
          </div>
        </div>

        {mapaVisivel && coordenadas && (
          <div className={styles.mapaWrapper}>
            <h2>Localizacao</h2>
            <div id="mapa-rest-estabelecimento" className={styles.mapaContainer}></div>
          </div>
        )}

        <hr className={styles.divider} />

        <div className={styles.cardapioHeader}>
          <h2>Cardapio</h2>
          <button className={styles.addItemBtn} onClick={abrirNovoItem}>
            + Adicionar Item
          </button>
        </div>

        <div className={styles.menuList}>
          {menuItems.length === 0 ? (
            <p className={styles.placeholder}>Nenhum item cadastrado ainda.</p>
          ) : (
            menuItems.map((item) => (
              <div className={styles.menuItem} key={item._id}>
                <div className={styles.itemLeft}>
                  {item.fotoUrl ? (
                    <img
                      src={`http://localhost:5000${item.fotoUrl}`}
                      className={styles.itemFoto}
                      alt={item.nome}
                    />
                  ) : (
                    <div className={styles.itemFotoVazia}>Sem foto</div>
                  )}
                </div>

                <div className={styles.itemInfo}>
                  <h3>{item.nome}</h3>
                  <p>{item.descricao}</p>

                  {item.disponivel ? (
                    <span className={styles.available}>Disponivel</span>
                  ) : (
                    <span className={styles.notAvailable}>Indisponivel</span>
                  )}

                  {item.emPromocao && (
                    <div className={styles.promoTag}>
                      Promocao: R$ {item.precoPromocional}
                      {item.textoPromocao ? ` - ${item.textoPromocao}` : ""}
                    </div>
                  )}

                  <span className={styles.price}>R$ {item.preco}</span>
                </div>

                <div className={styles.itemActions}>
                  <button className={styles.editBtn} onClick={() => editarItem(item)}>
                    Editar
                  </button>

                  <button className={styles.removeBtn} onClick={() => removerItem(item._id)}>
                    Remover
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {modalPerfilAberto && (
        <EditarPerfilModal
          perfil={perfil}
          setPerfil={setPerfil}
          fechar={() => setModalPerfilAberto(false)}
        />
      )}

      {modalItemAberto && (
        <EditarItemModal
          formItem={formItem}
          setFormItem={setFormItem}
          salvarItem={salvarItem}
          fechar={() => setModalItemAberto(false)}
          editando={editando}
        />
      )}
    </div>
  );
}
