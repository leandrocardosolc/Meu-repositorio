const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const router = express.Router();

function ensureAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  req.flash('error_msg', 'Você precisa estar logado.');
  res.redirect('/login');
}

router.get('/', async (req, res) => {
  const posts = await Post.findAll({ include: [User], order: [['createdAt', 'DESC']] });
  res.render('posts/list', { posts });
});

router.get('/create', ensureAuth, (req, res) => {
  res.render('posts/create');
});

router.post('/create', ensureAuth, async (req, res) => {
  const { titulo, conteudo } = req.body;
  try {
    await Post.create({ titulo, conteudo, UserId: req.session.user.id });
    req.flash('success_msg', 'Post criado.');
    res.redirect('/posts');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao criar post.');
    res.redirect('/posts/create');
  }
});

module.exports = router;
