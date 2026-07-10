const express = require('express');
const { getPool } = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// ─── GET /api/balances ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const accountType = req.query.account_type || 'propia';

    if (!['propia', 'compartida'].includes(accountType)) {
      return res.status(400).json({ error: { message: 'account_type debe ser propia o compartida.' } });
    }

    const db = getPool();
    const [rows] = await db.execute(
      'SELECT total_usd FROM portfolio_balances WHERE user_id = ? AND account_type = ?',
      [req.user.id, accountType]
    );

    const totalUsd = rows.length > 0 ? parseFloat(rows[0].total_usd) : 0;

    return res.json({ data: { total_usd: totalUsd } });
  } catch (error) {
    console.error('Error en GET /balances:', error);
    return res.status(500).json({ error: { message: 'Error al obtener balances.' } });
  }
});

// ─── PUT /api/balances ─────────────────────────────────────────────────────────
router.put('/', async (req, res) => {
  try {
    const { account_type, total_usd } = req.body;
    
    if (!account_type || !['propia', 'compartida'].includes(account_type)) {
      return res.status(400).json({ error: { message: 'account_type debe ser propia o compartida.' } });
    }

    if (total_usd === undefined || isNaN(parseFloat(total_usd))) {
      return res.status(400).json({ error: { message: 'total_usd es requerido y debe ser un número.' } });
    }

    const db = getPool();
    
    // Insert on duplicate key update
    await db.execute(
      `INSERT INTO portfolio_balances (user_id, account_type, total_usd)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE total_usd = ?`,
      [req.user.id, account_type, parseFloat(total_usd), parseFloat(total_usd)]
    );

    console.log(`✅ Balance actualizado para user ${req.user.id} (${account_type}): $${total_usd}`);

    return res.json({ data: { total_usd: parseFloat(total_usd) } });
  } catch (error) {
    console.error('Error en PUT /balances:', error);
    return res.status(500).json({ error: { message: 'Error al actualizar balance.' } });
  }
});

module.exports = router;
