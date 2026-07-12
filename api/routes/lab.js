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
    const userId = req.user.id; // Corregido: req.user.id

    const [rows] = await db.execute(
      'SELECT sector_analysis, country_analysis, checklist_history FROM lab_preferences WHERE user_id = ?',
      [userId]
    );

    const parseJson = (val, fallback) => {
      if (!val) return fallback;
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return fallback; }
      }
      return val;
    };

    if (rows.length === 0) {
      // No existe registro, devolvemos preferencias vacías (no es un error)
      return res.json({
        sectorAnalysis: {},
        countryAnalysis: {},
        checklistHistory: []
      });
    }

    const pref = rows[0];

    res.json({
      sectorAnalysis: parseJson(pref.sector_analysis, {}),
      countryAnalysis: parseJson(pref.country_analysis, {}),
      checklistHistory: parseJson(pref.checklist_history, [])
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
    const userId = req.user.id; // Corregido: req.user.id
    const { sectorAnalysis, countryAnalysis, checklistHistory } = req.body;
    
    console.log('--- EMPEZANDO GUARDADO DE LAB PREFERENCES ---');
    console.log('UserId:', userId);
    console.log('Body recibido:', Object.keys(req.body));

    const cols = ['user_id'];
    const vals = [userId];
    const updates = [];

    if (sectorAnalysis !== undefined) {
      cols.push('sector_analysis');
      vals.push(JSON.stringify(sectorAnalysis));
      updates.push('sector_analysis = VALUES(sector_analysis)');
      console.log('Preparando sectorAnalysis:', JSON.stringify(sectorAnalysis).substring(0, 50) + '...');
    }
    
    if (countryAnalysis !== undefined) {
      cols.push('country_analysis');
      vals.push(JSON.stringify(countryAnalysis));
      updates.push('country_analysis = VALUES(country_analysis)');
      console.log('Preparando countryAnalysis:', JSON.stringify(countryAnalysis).substring(0, 50) + '...');
    }
    
    if (checklistHistory !== undefined) {
      cols.push('checklist_history');
      vals.push(JSON.stringify(checklistHistory));
      updates.push('checklist_history = VALUES(checklist_history)');
      console.log('Preparando checklistHistory con', checklistHistory?.length || 0, 'elementos');
    }

    if (updates.length === 0) {
      console.log('Abordando: No hay campos para actualizar.');
      return res.status(400).json({ error: { message: 'No hay datos para actualizar.' } });
    }

    const placeholders = cols.map(() => '?').join(', ');
    const query = `
      INSERT INTO lab_preferences (${cols.join(', ')})
      VALUES (${placeholders})
      ON DUPLICATE KEY UPDATE ${updates.join(', ')}
    `;
    
    console.log('Query a ejecutar:', query);
    console.log('Valores a inyectar:', vals);

    const [result] = await db.execute(query, vals);
    console.log('Resultado de DB:', result);
    console.log('--- GUARDADO EXITOSO ---');

    res.json({ success: true, message: 'Preferencias de Lab actualizadas correctamente.' });
  } catch (error) {
    console.error('--- ERROR AL ACTUALIZAR PREFERENCIAS DEL LAB ---');
    console.error('Error completo:', error);
    console.error('Mensaje:', error.message);
    if (error.sql) console.error('SQL fallido:', error.sql);
    console.error('------------------------------------------------');
    res.status(500).json({ error: { message: 'Error interno del servidor.', details: error.message } });
  }
});

module.exports = router;
