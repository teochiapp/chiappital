// routes/lab.js - Rutas para datos del Lab (Sector, Country, Checklist)
const express = require('express');
const { getPool } = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ─── Middleware de Autenticación ──────────────────────────────────────────────
router.use(authenticate);

// ─── GET /api/lab/preferences ──────────────────────────────────────────────────
router.get('/preferences', async (req, res) => {
  try {
    const db = getPool();
    const userId = req.user.userId;

    const [rows] = await db.execute(
      'SELECT sector_analysis, country_analysis, checklist_history FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: { message: 'Usuario no encontrado.' } });
    }

    const user = rows[0];

    const parseJson = (val, fallback) => {
      if (!val) return fallback;
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return fallback; }
      }
      return val;
    };

    res.json({
      sectorAnalysis: parseJson(user.sector_analysis, {}),
      countryAnalysis: parseJson(user.country_analysis, {}),
      checklistHistory: parseJson(user.checklist_history, [])
    });
  } catch (error) {
    console.error('Error obteniendo preferencias del Lab:', error);
    res.status(500).json({ error: { message: 'Error interno del servidor.' } });
  }
});

// ─── PUT /api/lab/preferences ──────────────────────────────────────────────────
router.put('/preferences', async (req, res) => {
  try {
    const db = getPool();
    const userId = req.user.userId;
    const { sectorAnalysis, countryAnalysis, checklistHistory } = req.body;

    // Solo actualizamos las columnas que vienen en el body (para evitar sobreescribir con nulos si solo enviamos 1)
    const updates = [];
    const values = [];

    if (sectorAnalysis !== undefined) {
      updates.push('sector_analysis = ?');
      values.push(JSON.stringify(sectorAnalysis));
    }
    
    if (countryAnalysis !== undefined) {
      updates.push('country_analysis = ?');
      values.push(JSON.stringify(countryAnalysis));
    }
    
    if (checklistHistory !== undefined) {
      updates.push('checklist_history = ?');
      values.push(JSON.stringify(checklistHistory));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: { message: 'No hay datos para actualizar.' } });
    }

    values.push(userId);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await db.execute(query, values);

    res.json({ success: true, message: 'Preferencias de Lab actualizadas correctamente.' });
  } catch (error) {
    console.error('Error actualizando preferencias del Lab:', error);
    res.status(500).json({ error: { message: 'Error interno del servidor.' } });
  }
});

module.exports = router;
