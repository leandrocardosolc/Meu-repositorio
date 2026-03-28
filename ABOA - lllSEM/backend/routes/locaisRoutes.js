import express from 'express';
import Local from '../models/Local.js';

const router = express.Router();

// GET: Retorna todos os locais
router.get('/', async (req, res) => {
  try {
    const locais = await Local.find();
    res.json(locais);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET: Retorna um local por ID
router.get('/:id', async (req, res) => {
  try {
    const local = await Local.findById(req.params.id);
    if (!local) return res.status(404).json({ message: 'Local não encontrado' });
    res.json(local);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Criar novo local
router.post('/', async (req, res) => {
  const { nome, descricao, endereco, location } = req.body;

  if (!nome || !location || !location.coordinates) {
    return res.status(400).json({ message: 'Nome e localização são obrigatórios' });
  }

  const local = new Local({
    nome,
    descricao,
    endereco,
    location: {
      type: 'Point',
      coordinates: location.coordinates // [longitude, latitude]
    }
  });

  try {
    const novoLocal = await local.save();
    res.status(201).json(novoLocal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT: Atualizar um local
router.put('/:id', async (req, res) => {
  try {
    const local = await Local.findById(req.params.id);
    if (!local) return res.status(404).json({ message: 'Local não encontrado' });

    if (req.body.nome) local.nome = req.body.nome;
    if (req.body.descricao) local.descricao = req.body.descricao;
    if (req.body.endereco) local.endereco = req.body.endereco;
    if (req.body.location) {
      local.location = {
        type: 'Point',
        coordinates: req.body.location.coordinates
      };
    }

    const localAtualizado = await local.save();
    res.json(localAtualizado);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE: Deletar um local
router.delete('/:id', async (req, res) => {
  try {
    const local = await Local.findById(req.params.id);
    if (!local) return res.status(404).json({ message: 'Local não encontrado' });

    await Local.findByIdAndDelete(req.params.id);
    res.json({ message: 'Local deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
