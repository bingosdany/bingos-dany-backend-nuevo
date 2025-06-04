
const express = require('express');
const router = express.Router();
const Reserva = require('../models/Reserva');

// META TOTAL DE CARTONES
const META_CARTONES = 300;

router.get('/progreso', async (req, res) => {
  try {
    // Solo contar reservas validadas (puedes cambiar esta lógica si usas otro campo)
    const reservas = await Reserva.find();
    const totalCartones = reservas.reduce((sum, r) => sum + (r.cantidad || 0), 0);
    const porcentaje = Math.min(Math.round((totalCartones / META_CARTONES) * 100), 100);
    res.json({ porcentaje });
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular el progreso' });
  }
});

module.exports = router;
