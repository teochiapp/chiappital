// routes/auth.js - Rutas de autenticación
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * Genera un JWT para el usuario dado.
 */
function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ─── POST /api/auth/login y /api/auth/local ──────────────────────────────────
const loginHandler = async (req, res) => {
  try {
    const { identifier, email, password } = req.body;

    // Strapi usa "identifier" para el campo de login, aceptamos ambos
    const loginEmail = identifier || email;

    if (!loginEmail || !password) {
      return res.status(400).json({
        error: { message: 'Email y contraseña son requeridos.' }
      });
    }

    const db = getPool();

    // Buscar usuario por email o username (igual que Strapi)
    const [rows] = await db.execute(
      'SELECT id, username, email, password FROM users WHERE email = ? OR username = ?',
      [loginEmail, loginEmail]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        error: { message: 'Credenciales incorrectas.' }
      });
    }

    const user = rows[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        error: { message: 'Credenciales incorrectas.' }
      });
    }

    // Generar token JWT
    const token = generateToken(user.id);

    console.log(`✅ Login exitoso: ${user.email}`);

    return res.json({
      jwt: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Error en /auth/login:', error);
    return res.status(500).json({
      error: { message: 'Error interno del servidor.' }
    });
  }
};

router.post('/login', loginHandler);
router.post('/local', loginHandler);

// ─── POST /api/auth/family ─────────────────────────────────────────────────────
router.post('/family', async (req, res) => {
  try {
    const { answer } = req.body;

    if (!answer || answer.trim().toLowerCase() !== 'lila') {
      return res.status(400).json({
        error: { message: 'Respuesta incorrecta.' }
      });
    }

    const email = 'teochiapps@gmail.com'; // El usuario principal
    const db = getPool();

    const [rows] = await db.execute(
      'SELECT id, username, email FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: { message: 'El usuario principal no existe. Por favor, crealo primero.' }
      });
    }

    const user = rows[0];
    const token = generateToken(user.id);

    console.log(`✅ Login familiar exitoso: ${user.email}`);

    return res.json({
      jwt: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Error en /auth/family:', error);
    return res.status(500).json({
      error: { message: 'Error interno del servidor.' }
    });
  }
});

// ─── GET /api/users/me ─────────────────────────────────────────────────────────
// Nota: Esta ruta se monta en /api/users/me desde server.js
router.get('/me', authenticate, (req, res) => {
  return res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
  });
});

module.exports = router;
