// routes/personal.js - Rutas para el Personal Hub
const express = require('express');
const { getPool } = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// ─── Feature Flags ────────────────────────────────────────────────────────────

// GET /api/personal/features
router.get('/features', async (req, res) => {
  try {
    const db = getPool();
    const userId = req.user.id;
    const [rows] = await db.execute(
      'SELECT feature_name, enabled FROM features WHERE user_id = ?',
      [userId]
    );
    const features = {};
    rows.forEach(r => { features[r.feature_name] = !!r.enabled; });
    // Defaults si no existen aún
    if (!('personal_hub' in features)) features.personal_hub = false;
    if (!('investment_hub' in features)) features.investment_hub = true;
    res.json({ features });
  } catch (error) {
    console.error('Error obteniendo features:', error);
    res.status(500).json({ error: { message: 'Error interno del servidor.' } });
  }
});

// PUT /api/personal/features
router.put('/features', async (req, res) => {
  try {
    const db = getPool();
    const userId = req.user.id;
    const { feature_name, enabled } = req.body;
    if (!feature_name) return res.status(400).json({ error: { message: 'feature_name requerido.' } });

    await db.execute(
      `INSERT INTO features (user_id, feature_name, enabled)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE enabled = VALUES(enabled)`,
      [userId, feature_name, enabled ? 1 : 0]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error actualizando feature:', error);
    res.status(500).json({ error: { message: 'Error interno del servidor.' } });
  }
});

// ─── Hábitos ──────────────────────────────────────────────────────────────────

// GET /api/personal/habits
router.get('/habits', async (req, res) => {
  try {
    const db = getPool();
    const userId = req.user.id;
    const [habits] = await db.execute(
      'SELECT * FROM habits WHERE user_id = ? AND active = 1 ORDER BY created_at ASC',
      [userId]
    );
    // Para cada hábito, traer completados de los últimos 90 días
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const dateStr = ninetyDaysAgo.toISOString().split('T')[0];

    const [completions] = await db.execute(
      'SELECT habit_id, completed_on FROM habit_completions WHERE user_id = ? AND completed_on >= ?',
      [userId, dateStr]
    );

    const completionMap = {};
    completions.forEach(c => {
      if (!completionMap[c.habit_id]) completionMap[c.habit_id] = [];
      completionMap[c.habit_id].push(c.completed_on.toISOString().split('T')[0]);
    });

    const result = habits.map(h => ({
      ...h,
      completions: completionMap[h.id] || []
    }));

    res.json({ habits: result });
  } catch (error) {
    console.error('Error obteniendo hábitos:', error);
    res.status(500).json({ error: { message: 'Error interno del servidor.' } });
  }
});

// POST /api/personal/habits
router.post('/habits', async (req, res) => {
  try {
    const db = getPool();
    const userId = req.user.id;
    const { name, description, frequency, color, icon } = req.body;
    if (!name) return res.status(400).json({ error: { message: 'name requerido.' } });

    const [result] = await db.execute(
      'INSERT INTO habits (user_id, name, description, frequency, color, icon) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, name, description || null, frequency || 'daily', color || '#52B788', icon || null]
    );
    const [rows] = await db.execute('SELECT * FROM habits WHERE id = ?', [result.insertId]);
    res.status(201).json({ habit: { ...rows[0], completions: [] } });
  } catch (error) {
    console.error('Error creando hábito:', error);
    res.status(500).json({ error: { message: 'Error interno del servidor.' } });
  }
});

// PUT /api/personal/habits/:id
router.put('/habits/:id', async (req, res) => {
  try {
    const db = getPool();
    const userId = req.user.id;
    const { name, description, frequency, color, icon, active } = req.body;
    await db.execute(
      `UPDATE habits SET name=COALESCE(?,name), description=COALESCE(?,description),
       frequency=COALESCE(?,frequency), color=COALESCE(?,color), icon=COALESCE(?,icon),
       active=COALESCE(?,active) WHERE id=? AND user_id=?`,
      [name, description, frequency, color, icon, active !== undefined ? (active ? 1 : 0) : null, req.params.id, userId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error actualizando hábito:', error);
    res.status(500).json({ error: { message: 'Error interno del servidor.' } });
  }
});

// DELETE /api/personal/habits/:id
router.delete('/habits/:id', async (req, res) => {
  try {
    const db = getPool();
    await db.execute(
      'UPDATE habits SET active = 0 WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando hábito:', error);
    res.status(500).json({ error: { message: 'Error interno del servidor.' } });
  }
});

// POST /api/personal/habits/:id/toggle — marcar/desmarcar completado para HOY
router.post('/habits/:id/toggle', async (req, res) => {
  try {
    const db = getPool();
    const userId = req.user.id;
    const habitId = req.params.id;
    const today = new Date().toISOString().split('T')[0];

    const [existing] = await db.execute(
      'SELECT id FROM habit_completions WHERE habit_id = ? AND user_id = ? AND completed_on = ?',
      [habitId, userId, today]
    );

    if (existing.length > 0) {
      await db.execute('DELETE FROM habit_completions WHERE habit_id = ? AND user_id = ? AND completed_on = ?',
        [habitId, userId, today]);
      res.json({ completed: false, date: today });
    } else {
      await db.execute('INSERT INTO habit_completions (habit_id, user_id, completed_on) VALUES (?, ?, ?)',
        [habitId, userId, today]);
      res.json({ completed: true, date: today });
    }
  } catch (error) {
    console.error('Error toggling hábito:', error);
    res.status(500).json({ error: { message: 'Error interno del servidor.' } });
  }
});

// ─── Objetivos ────────────────────────────────────────────────────────────────

// GET /api/personal/goals
router.get('/goals', async (req, res) => {
  try {
    const db = getPool();
    const [goals] = await db.execute(
      'SELECT * FROM personal_goals WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ goals });
  } catch (error) {
    console.error('Error obteniendo objetivos:', error);
    res.status(500).json({ error: { message: 'Error interno del servidor.' } });
  }
});

// POST /api/personal/goals
router.post('/goals', async (req, res) => {
  try {
    const db = getPool();
    const userId = req.user.id;
    const { title, description, category, deadline, progress } = req.body;
    if (!title) return res.status(400).json({ error: { message: 'title requerido.' } });

    const [result] = await db.execute(
      'INSERT INTO personal_goals (user_id, title, description, category, deadline, progress) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, title, description || null, category || 'desarrollo', deadline || null, progress || 0]
    );
    const [rows] = await db.execute('SELECT * FROM personal_goals WHERE id = ?', [result.insertId]);
    res.status(201).json({ goal: rows[0] });
  } catch (error) {
    console.error('Error creando objetivo:', error);
    res.status(500).json({ error: { message: 'Error interno del servidor.' } });
  }
});

// PUT /api/personal/goals/:id
router.put('/goals/:id', async (req, res) => {
  try {
    const db = getPool();
    const { title, description, category, progress, deadline, status } = req.body;
    await db.execute(
      `UPDATE personal_goals SET
        title=COALESCE(?,title), description=COALESCE(?,description),
        category=COALESCE(?,category), progress=COALESCE(?,progress),
        deadline=COALESCE(?,deadline), status=COALESCE(?,status)
       WHERE id=? AND user_id=?`,
      [title, description, category, progress, deadline, status, req.params.id, req.user.id]
    );
    const [rows] = await db.execute('SELECT * FROM personal_goals WHERE id = ?', [req.params.id]);
    res.json({ goal: rows[0] });
  } catch (error) {
    console.error('Error actualizando objetivo:', error);
    res.status(500).json({ error: { message: 'Error interno del servidor.' } });
  }
});

// DELETE /api/personal/goals/:id
router.delete('/goals/:id', async (req, res) => {
  try {
    const db = getPool();
    await db.execute('DELETE FROM personal_goals WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando objetivo:', error);
    res.status(500).json({ error: { message: 'Error interno del servidor.' } });
  }
});

// ─── Vocabulario (Idiomas) ───────────────────────────────────────────────────

// GET /api/personal/vocabulary
router.get('/vocabulary', async (req, res) => {
  try {
    const db = getPool();
    const userId = req.user.id;
    const [vocabulary] = await db.execute(
      'SELECT * FROM vocabulary WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json({ vocabulary });
  } catch (error) {
    console.error('Error obteniendo vocabulario:', error);
    res.status(500).json({ error: { message: 'Error interno del servidor.' } });
  }
});

// POST /api/personal/vocabulary
router.post('/vocabulary', async (req, res) => {
  try {
    const db = getPool();
    const userId = req.user.id;
    const { word, translation, language, notes } = req.body;
    if (!word || !translation) return res.status(400).json({ error: { message: 'word y translation requeridos.' } });

    const today = new Date().toISOString().split('T')[0];

    const [result] = await db.execute(
      'INSERT INTO vocabulary (user_id, word, translation, language, notes, next_review) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, word, translation, language || 'portugués', notes || null, today]
    );
    const [rows] = await db.execute('SELECT * FROM vocabulary WHERE id = ?', [result.insertId]);
    res.status(201).json({ word: rows[0] });
  } catch (error) {
    console.error('Error creando vocabulario:', error);
    res.status(500).json({ error: { message: 'Error interno del servidor.' } });
  }
});

// PUT /api/personal/vocabulary/:id/review
router.put('/vocabulary/:id/review', async (req, res) => {
  try {
    const db = getPool();
    const userId = req.user.id;
    const { quality } = req.body; // 0=Again, 1=Hard, 2=Good, 3=Easy
    
    // Obtener la palabra actual
    const [rows] = await db.execute('SELECT * FROM vocabulary WHERE id = ? AND user_id = ?', [req.params.id, userId]);
    if (rows.length === 0) return res.status(404).json({ error: { message: 'Palabra no encontrada.' } });
    
    const word = rows[0];
    let { repetition, ease_factor, interval_days } = word;

    // Algoritmo SM-2 simplificado
    if (quality < 1) {
      // Si falló (Again)
      repetition = 0;
      interval_days = 1;
    } else {
      // Si acertó
      if (repetition === 0) {
        interval_days = 1;
      } else if (repetition === 1) {
        interval_days = 6;
      } else {
        interval_days = Math.round(interval_days * ease_factor);
      }
      repetition += 1;
    }

    // Actualizar Ease Factor
    ease_factor = ease_factor + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02));
    if (ease_factor < 1.3) ease_factor = 1.3;

    // Calcular próxima fecha
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval_days);
    const nextReviewStr = nextReviewDate.toISOString().split('T')[0];

    await db.execute(
      `UPDATE vocabulary SET 
        repetition = ?, ease_factor = ?, interval_days = ?, next_review = ?
       WHERE id = ?`,
      [repetition, ease_factor, interval_days, nextReviewStr, req.params.id]
    );

    const [updatedRows] = await db.execute('SELECT * FROM vocabulary WHERE id = ?', [req.params.id]);
    res.json({ word: updatedRows[0] });
  } catch (error) {
    console.error('Error actualizando revisión:', error);
    res.status(500).json({ error: { message: 'Error interno del servidor.' } });
  }
});

// DELETE /api/personal/vocabulary/:id
router.delete('/vocabulary/:id', async (req, res) => {
  try {
    const db = getPool();
    await db.execute('DELETE FROM vocabulary WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando vocabulario:', error);
    res.status(500).json({ error: { message: 'Error interno del servidor.' } });
  }
});

module.exports = router;
