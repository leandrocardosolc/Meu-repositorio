import express from 'express';

const router = express.Router();

function coordenadaValida(valor, min, max) {
  return Number.isFinite(valor) && valor >= min && valor <= max;
}

router.post('/calcular', async (req, res) => {
  const { origem, destino } = req.body || {};

  if (!Array.isArray(origem) || !Array.isArray(destino) || origem.length < 2 || destino.length < 2) {
    return res.status(400).json({
      message: 'Origem e destino devem ser arrays no formato [longitude, latitude].'
    });
  }

  const [origLng, origLat] = origem.map(Number);
  const [destLng, destLat] = destino.map(Number);

  if (
    !coordenadaValida(origLng, -180, 180) ||
    !coordenadaValida(destLng, -180, 180) ||
    !coordenadaValida(origLat, -90, 90) ||
    !coordenadaValida(destLat, -90, 90)
  ) {
    return res.status(400).json({
      message: 'Coordenadas invalidas. Use longitude entre -180 e 180 e latitude entre -90 e 90.'
    });
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origLng},${origLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`;

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(502).json({
        message: `Falha no provedor de rota (HTTP ${response.status}).`
      });
    }

    const data = await response.json();
    const route = data?.routes?.[0];

    if (!route?.geometry?.coordinates?.length) {
      return res.status(404).json({ message: 'Rota nao encontrada para os pontos informados.' });
    }

    return res.json({ route });
  } catch (error) {
    console.error('Erro ao calcular rota:', error);
    return res.status(500).json({ message: 'Erro interno ao calcular rota.' });
  }
});

export default router;