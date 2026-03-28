import express from "express";
import multer from "multer";
import Estabelecimento from "../models/Estabelecimento.js";
import { authRequired } from "../middleware/auth.js";
import Usuario from "../models/Usuario.js";

function levenshtein(a, b) {
  if (!a || !b) return 99;

  a = a.toLowerCase();
  b = b.toLowerCase();

  const matrix = [];

  let i, j;
  for (i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function normalizeText(value) {
  return (value || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function geocodeEndereco(endereco) {
  const texto = (endereco || "").trim();
  if (!texto) return null;

  const params = new URLSearchParams({
    q: texto,
    format: "json",
    limit: "1",
    countrycodes: "br"
  });

  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "ABOA/1.0 (contato-local)"
      }
    });

    if (!resp.ok) return null;

    const data = await resp.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const primeiro = data[0];
    const latitude = Number(primeiro.lat);
    const longitude = Number(primeiro.lon);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;

    return {
      type: "Point",
      coordinates: [longitude, latitude]
    };
  } catch {
    return null;
  }
}


const router = express.Router();

// Config upload (somente JPG)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 9999);
    cb(null, unique + ".jpg");
  }
});

function fileFilter(req, file, cb) {
  if (file.mimetype === "image/jpeg") cb(null, true);
  else cb(new Error("Apenas JPG permitido"));
}

const upload = multer({ storage, fileFilter });

// POST cadastro
router.post(
  "/",
  authRequired,
  upload.fields([
    { name: "foto", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        nome,
        endereco,
        telefone,
        descricao,
        categoria,
        tags
      } = req.body;

      const location = await geocodeEndereco(endereco);
      if (!location) {
        return res.status(400).json({
          erro: "Nao foi possivel converter o endereco em coordenadas. Verifique o endereco informado."
        });
      }

      const novo = await Estabelecimento.create({
        nome,
        endereco,
        telefone,
        descricao,
        categoria,
        tags: JSON.parse(tags || "[]"),
        fotoUrl: req.files?.foto
          ? `/uploads/${req.files.foto[0].filename}`
          : null,
        location,
        donoId: req.usuario.id
      });

      console.log("Estabelecimento criado:", novo);

      await Usuario.findByIdAndUpdate(req.usuario.id, { tipo: "restaurante" });

      const usuarioAtualizado =
        await Usuario.findById(req.usuario.id).select("-senhaHash");

      return res.status(201).json({
        estabelecimento: novo,
        usuario: usuarioAtualizado
      });

    } catch (err) {
      console.error("Erro ao cadastrar estabelecimento:", err);
      return res.status(500).json({ erro: "Erro ao cadastrar estabelecimento" });
    }
  }
);

// GET listar
router.get("/", async (req, res) => {
  try {
    const dados = await Estabelecimento.find();
    res.json(dados);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar" });
  }
});

router.get("/meu", authRequired, async (req, res) => {
  try {
    const est = await Estabelecimento.findOne({ donoId: req.usuario.id });

    if (!est) {
      return res.status(404).json({ erro: "Nenhum estabelecimento encontrado" });
    }

    res.json(est);

  } catch (err) {
    console.error("Erro ao buscar estabelecimento:", err);
    res.status(500).json({ erro: "Erro ao buscar estabelecimento" });
  }
});

router.put("/meu", authRequired, async (req, res) => {
  try {
    const payload = { ...req.body };

    if (typeof payload.endereco === "string" && payload.endereco.trim()) {
      const location = await geocodeEndereco(payload.endereco);
      if (!location) {
        return res.status(400).json({
          erro: "Nao foi possivel converter o endereco em coordenadas. Verifique o endereco informado."
        });
      }

      payload.location = location;
    }

    const atualizado = await Estabelecimento.findOneAndUpdate(
      { donoId: req.usuario.id },
      payload,
      { new: true }
    );
    res.json(atualizado);
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    res.status(500).json({ erro: "Erro ao atualizar perfil" });
  }
});

router.put(
  "/foto",
  authRequired,
  upload.fields([{ name: "foto", maxCount: 1 }]),
  async (req, res) => {
    try {
      if (!req.files?.foto) {
        return res.status(400).json({ erro: "Envie uma foto JPG" });
      }

      const fotoUrl = `/uploads/${req.files.foto[0].filename}`;

      const atualizado = await Estabelecimento.findOneAndUpdate(
        { donoId: req.usuario.id },
        { fotoUrl },
        { new: true }
      );

      res.json(atualizado);

    } catch (err) {
      console.error("Erro ao atualizar foto:", err);
      res.status(500).json({ erro: "Erro ao atualizar foto" });
    }
  }
);

router.get("/buscar", async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json([]);

    const termo = normalizeText(q);
    const regex = new RegExp(q.trim(), "i");

    const resultados = await Estabelecimento.find({
      $or: [
        { nome: regex },
        { descricao: regex },
        { categoria: regex },
        { tags: regex }
      ]
    });

    // Fallback defensivo: se o regex do Mongo não trouxer nada,
    // aplica filtro em memória com texto normalizado.
    const base =
      resultados.length > 0 ? resultados : await Estabelecimento.find();

    const filtrados = base.filter((est) => {
      const nome = normalizeText(est.nome);
      const desc = normalizeText(est.descricao);
      const cat = normalizeText(est.categoria);
      const tags = (est.tags || []).map((t) => normalizeText(t));

      return (
        nome.includes(termo) ||
        desc.includes(termo) ||
        cat.includes(termo) ||
        tags.some((t) => t.includes(termo))
      );
    });

    function calcularRelevancia(est) {
      let score = 0;

      const nome = normalizeText(est.nome);
      const desc = normalizeText(est.descricao);
      const cat = normalizeText(est.categoria);
      const tags = (est.tags || []).map((t) => normalizeText(t));

      // PESOS DIRETOS (exatos)
      if (nome.includes(termo)) score += 50;
      if (cat.includes(termo)) score += 40;
      if (tags.some(t => t.includes(termo))) score += 30;
      if (desc.includes(termo)) score += 20;

      // BUSCA LEVENSHTEIN — tolerância ao erro
      const campos = [nome, desc, cat, ...tags];

      campos.forEach(c => {
        const dist = levenshtein(c, termo);

        if (dist <= 2) score += 40; // MUITO parecido
        else if (dist <= 4) score += 20; // parecido
        else if (dist <= 6) score += 10; // próximo
      });

      return score;
    }

    // ORDENAR PELO SCORE (maior = mais relevante)
    const ordenados = filtrados
      .map(est => ({
        ...est._doc,
        score: calcularRelevancia(est)
      }))
      .sort((a, b) => b.score - a.score);

    res.json(ordenados);

  } catch (err) {
    console.error("Erro ao buscar:", err);
    res.status(500).json({ erro: "Erro ao buscar" });
  }
});

export default router;
