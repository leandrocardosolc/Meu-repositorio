import Header from "../../components/Header.jsx";
import styles from "./Home.module.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  function enviarBusca() {
    if (!busca.trim()) return;
    navigate(`/recomenda?q=${encodeURIComponent(busca)}`);
  }

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.hero}>

        {/* Lado esquerdo */}
        <img
          src="/imgs/Group 5 - Copia - Copia.png"
          className={`${styles.sideDecor} ${styles.leftImage}`}
          alt="Decoração esquerda"
        />

        {/* Centro */}
        <div className={styles.centerContent}>
          <h1 className={styles.title}>Qual vai ser a boa de hoje?</h1>

          <p className={styles.subtitle}>
            Descubra lugares incríveis, do jeito que você gosta.
          </p>

          <div className={styles.searchWrapper}>
            <span className={styles.pin}>📍</span>

            <input
              type="text"
              placeholder="Onde você quer ir?"
              className={styles.searchInput}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviarBusca()}
            />

            <button className={styles.searchButton} onClick={enviarBusca}>
              Buscar
            </button>
          </div>

          <div className={styles.tags}>
            <span onClick={() => navigate("/recomenda?q=hamburgueria")}>🍔 Burgers</span>
            <span onClick={() => navigate("/recomenda?q=pizza")}>🍕 Pizza</span>
            <span onClick={() => navigate("/recomenda?q=bar")}>🍹 Bar</span>
            <span onClick={() => navigate("/recomenda?q=doce")}>🍬 Doces</span>
            <span onClick={() => navigate("/recomenda?q=japonesa")}>🍣 Japonesa</span>
          </div>
        </div>

        {/* Lado direito */}
        <img
          src="/imgs/Group 5 - Copia.png"
          className={`${styles.sideDecor} ${styles.rightImage}`}
          alt="Decoração direita"
        />
      </div>

      <footer className={styles.footer}>
        <div>© 2025 ABOA — Todos os direitos reservados</div>

        <div className={styles.footerIcons}>
          <img src="/imgs/icons8-instagram-50.png" />
          <img src="/imgs/icons8-x-50.png" />
        </div>
      </footer>
    </div>
  );
}
