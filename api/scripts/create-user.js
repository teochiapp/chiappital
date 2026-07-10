#!/usr/bin/env node
// scripts/create-user.js - Script CLI para crear usuarios manualmente
// Uso: node scripts/create-user.js <email> <password> [username]
// Ejemplo: node scripts/create-user.js admin@simpletrade.com MiPassword123 admin

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const bcrypt = require('bcryptjs');
const { getPool, initializeDatabase } = require('../database/db');

async function createUser(email, password, username) {
  if (!email || !password) {
    console.error('❌ Uso: node scripts/create-user.js <email> <password> [username]');
    process.exit(1);
  }

  // Username por defecto: parte del email antes del @
  const resolvedUsername = username || email.split('@')[0];

  console.log(`\n📝 Creando usuario:`);
  console.log(`   Email:    ${email}`);
  console.log(`   Username: ${resolvedUsername}`);

  try {
    await initializeDatabase();
    const db = getPool();

    // Verificar si ya existe
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, resolvedUsername]
    );

    if (existing.length > 0) {
      console.error(`\n❌ Ya existe un usuario con ese email o username.`);
      process.exit(1);
    }

    // Hashear contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insertar usuario
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [resolvedUsername, email, hashedPassword]
    );

    console.log(`\n✅ Usuario creado exitosamente!`);
    console.log(`   ID: ${result.insertId}`);
    console.log(`\n🔐 Ya podés iniciar sesión con:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: (la que especificaste)\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al crear usuario:');
    console.error('   Código:', error.code || 'N/A');
    console.error('   Mensaje:', error.message || String(error));
    if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === 'ENOTFOUND') {
      console.error('\n💡 Verifica que:');
      console.error('   1. MySQL está corriendo en tu máquina');
      console.error('   2. El archivo api/.env tiene los datos correctos (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)');
      console.error('   3. La base de datos existe en MySQL');
    }
    process.exit(1);
  }
}

// Obtener argumentos de la línea de comandos
const [,, email, password, username] = process.argv;
createUser(email, password, username);
