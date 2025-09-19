const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post('/register', async (req, res) => {
  const { nome, email, usuario, senha, senha2 } = req.body;
  const errors = [];
  if (!nome || !email || !usuario || !senha) errors.push({ msg: 'Por favor preencha todos os campos.' });
  if (senha !== senha2) errors.push({ msg: 'Senhas não conferem.' });
  if (errors.length) return res.render('users/register', { errors, nome, email, usuario });

  try {
    const existing = await User.findOne({ where: { usuario } });
    if (existing) {
      req.flash('error_msg', 'Usuário já existe.');
      return res.redirect('/register');
    }
    const hash = await bcrypt.hash(senha, 10);
    await User.create({ nome, email, usuario, senha: hash });
    req.flash('success_msg', 'Cadastro realizado. Faça login.');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao registrar.');
    res.redirect('/register');
  }
});

router.get('/login', (req, res) => {
  res.render('users/login');
});

router.post('/login', async (req, res) => {
  const { usuario, senha } = req.body;
  try {
    const user = await User.findOne({ where: { usuario } });
    if (!user) {
      req.flash('error_msg', 'Usuário não encontrado.');
      return res.redirect('/login');
    }
    const matched = await bcrypt.compare(senha, user.senha);
    if (!matched) {
      req.flash('error_msg', 'Senha incorreta.');
      return res.redirect('/login');
    }
    req.session.user = { id: user.id, nome: user.nome, usuario: user.usuario };
    req.flash('success_msg', 'Logado com sucesso.');
    res.redirect('/posts');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro no login.');
    res.redirect('/login');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
