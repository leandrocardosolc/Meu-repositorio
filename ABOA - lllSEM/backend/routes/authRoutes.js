import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

const router = express.Router();

// helper pra gerar token
function gerarToken(usuario) {
  return jwt.sign(
    {
      id: usuario._id,
      email: usuario.email,
      tipo: usuario.tipo,
      nome: usuario.nome,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

/**
 * POST /api/auth/register
 * body: { nome, email, senha }
 */
router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "Preencha todos os campos." });
    }

    const jaExiste = await Usuario.findOne({ email });
    if (jaExiste) {
      return res.status(400).json({ erro: "Email já cadastrado." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await Usuario.create({
      nome,
      email,
      senhaHash,
    });

    const token = gerarToken(usuario);

    res.status(201).json({
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao registrar usuário." });
  }
});

/**
 * POST /api/auth/login
 * body: { email, senha }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ erro: "Credenciais inválidas." });
    }

    const senhaConfere = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaConfere) {
      return res.status(400).json({ erro: "Credenciais inválidas." });
    }

    const token = gerarToken(usuario);

    res.json({
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao fazer login." });
  }
});

export default router;
