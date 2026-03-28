import express from "express";
import multer from "multer";
import ItemCardapio from "../models/ItemCardapio.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

// ----------------------
// UPLOAD DE IMAGEM
// ----------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + Math.round(Math.random() * 9999) + ".jpg")
});

function fileFilter(req, file, cb) {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Arquivo inválido"));
}

const upload = multer({ storage, fileFilter });

// helper que converte tudo corretamente para boolean
function toBool(v) {
  return v === true || v === "true" || v === 1 || v === "1";
}

// =====================================================
// POST — criar item do cardápio
// =====================================================
router.post("/", authRequired, upload.single("foto"), async (req, res) => {
  try {
    const {
      nome,
      descricao,
      preco,
      disponivel,
      emPromocao,
      precoPromocional,
      textoPromocao,
      tipo                 // <<--- ADICIONADO AQUI
    } = req.body;

    const novo = await ItemCardapio.create({
      restauranteId: req.usuario.id,
      nome,
      descricao,
      preco: Number(preco),

      disponivel: toBool(disponivel),
      emPromocao: toBool(emPromocao),

      precoPromocional: precoPromocional ? Number(precoPromocional) : null,
      textoPromocao: textoPromocao || "",

      tipo,                // <<--- SALVANDO NO BANCO

      fotoUrl: req.file ? `/uploads/${req.file.filename}` : null
    });

    res.status(201).json(novo);

  } catch (err) {
    console.error("Erro ao criar item:", err);
    res.status(500).json({ erro: "Erro ao criar item" });
  }
});

// =====================================================
// GET — itens do usuário logado
// =====================================================
router.get("/meus", authRequired, async (req, res) => {
  try {
    const itens = await ItemCardapio.find({
      restauranteId: req.usuario.id
    });

    res.json(itens);

  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar itens" });
  }
});

// =====================================================
// PUT — editar item
// =====================================================
router.put("/:id", authRequired, upload.single("foto"), async (req, res) => {
  try {
    const {
      nome,
      descricao,
      preco,
      disponivel,
      emPromocao,
      precoPromocional,
      textoPromocao
    } = req.body;

    const dadosAtualizados = {
      nome,
      descricao,
      preco: Number(preco),

      disponivel: toBool(disponivel),
      emPromocao: toBool(emPromocao),

      precoPromocional: precoPromocional ? Number(precoPromocional) : null,
      textoPromocao: textoPromocao || "",
    };

    // atualizar foto
    if (req.file) {
      dadosAtualizados.fotoUrl = `/uploads/${req.file.filename}`;
    }

    const atualizado = await ItemCardapio.findByIdAndUpdate(
      req.params.id,
      dadosAtualizados,
      { new: true }
    );

    res.json(atualizado);

  } catch (err) {
    console.error("Erro ao editar item:", err);
    res.status(500).json({ erro: "Erro ao editar item" });
  }
});

// =====================================================
// DELETE — item
// =====================================================
router.delete("/:id", authRequired, async (req, res) => {
  try {
    await ItemCardapio.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao remover item:", err);
    res.status(500).json({ erro: "Erro ao remover item" });
  }
});

router.get("/por-restaurante/:id", async (req, res) => {
  try {
    const itens = await ItemCardapio.find({
      restauranteId: req.params.id
    });

    res.json(itens);

  } catch (err) {
    console.error("Erro ao listar cardápio do restaurante:", err);
    res.status(500).json({ erro: "Erro ao buscar cardápio" });
  }
});

export default router;
