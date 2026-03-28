import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header.jsx";
import styles from "./minhacontausuario.module.css";

export default function Minhacontausuario() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("usuario");

    if (!data) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(data);

    // Se não for user, redireciona para conta restaurante
    if (user.tipo !== "user") {
      navigate("/minhacontarest");
      return;
    }

    setUsuario(user);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  }

  if (!usuario) return null;

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <div className={styles.card}>
        <h1>Minha Conta</h1>
        <p className={styles.subtitle}>Informações do seu perfil</p>

        <div className={styles.infoBox}>
          <p><strong>Nome:</strong> {usuario.nome}</p>
          <p><strong>Email:</strong> {usuario.email}</p>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.btnPrimary}
            onClick={() => navigate("/cadastro-estabelecimento")}
          >
            Cadastrar Estabelecimento
          </button>

          <button className={styles.btnLogout} onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
