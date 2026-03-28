import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home.jsx";
import Login from "./pages/Login/Login.jsx";
import Cadastro from "./pages/Cadastro/Cadastro.jsx";
import Recomenda from "./pages/Recomenda/Recomenda.jsx";
import Cardapio from "./pages/Cardapio/Cardapio.jsx";
import CadastroEstabelecimento from "./pages/CadastroEstabelecimento/CadastroEstabelecimento.jsx";
import Mapa from "./pages/Mapa/Mapa.jsx";

// MINHA CONTA – ESTABELECIMENTO
import MinhaContaRest from "./pages/ContaEstabelecimento/MinhaContaRest.jsx";

// MINHA CONTA – USUÁRIO (NOVO)
import MinhaContaUsuario from "./pages/MinhaContaUsuario/MinhaContaUsuario.jsx";

function App() {
  return (
    <Routes>

      {/* HOME */}
      <Route path="/" element={<Home />} />

      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* CADASTRO */}
      <Route path="/cadastro" element={<Cadastro />} />

      {/* RECOMENDA */}
      <Route path="/recomenda" element={<Recomenda />} />

      {/* CARDÁPIO */}
      <Route path="/cardapio" element={<Cardapio />} />

      {/* MAPA */}
      <Route path="/mapa" element={<Mapa />} />

      {/* CADASTRO ESTABELECIMENTO */}
      <Route
        path="/cadastro-estabelecimento"
        element={<CadastroEstabelecimento />}
      />

      {/* MINHA CONTA – ESTABELECIMENTO */}
      <Route
        path="/minha-conta-rest"
        element={<MinhaContaRest />}
      />

      {/* MINHA CONTA – USUÁRIO */}
      <Route
        path="/minha-conta-usuario"
        element={<MinhaContaUsuario />}
      />

    </Routes>
  );
}

export default App;
