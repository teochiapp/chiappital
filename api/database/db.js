// database/db.js - Conexión MySQL con pool de conexiones
const mysql = require('mysql2/promise');

let pool = null;

/**
 * Obtiene (o crea) el pool de conexiones MySQL.
 */
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      // Reconectar automáticamente en caso de pérdida de conexión
      enableKeepAlive: true,
      keepAliveInitialDelay: 30000,
    });
  }
  return pool;
}

/**
 * Inicializa las tablas si no existen.
 * Se llama una vez al arrancar el servidor.
 */
async function initializeDatabase() {
  const db = getPool();

  // Tabla de usuarios
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      username    VARCHAR(100) NOT NULL UNIQUE,
      email       VARCHAR(255) NOT NULL UNIQUE,
      password    VARCHAR(255) NOT NULL,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Tabla de trades
  await db.execute(`
    CREATE TABLE IF NOT EXISTS trades (
      id                   INT AUTO_INCREMENT PRIMARY KEY,
      user_id              INT NOT NULL,
      symbol               VARCHAR(20) NOT NULL,
      type                 ENUM('buy', 'sell') NOT NULL,
      account_type         ENUM('propia', 'compartida') NOT NULL DEFAULT 'propia',
      entry_price          DECIMAL(15, 6) NOT NULL,
      entry_price_ars      DECIMAL(15, 6) DEFAULT NULL,
      exit_price           DECIMAL(15, 6) DEFAULT NULL,
      portfolio_percentage DECIMAL(5, 2) DEFAULT NULL,
      stop_loss            DECIMAL(15, 6) DEFAULT NULL,
      take_profit          DECIMAL(15, 6) DEFAULT NULL,
      strategy             VARCHAR(100) DEFAULT NULL,
      emotions             ENUM('confident','nervous','greedy','fearful','calm','frustrated') DEFAULT NULL,
      notes                TEXT DEFAULT NULL,
      status               ENUM('open','closed','cancelled') NOT NULL DEFAULT 'open',
      result               DECIMAL(10, 4) DEFAULT NULL,
      closed_at            DATETIME DEFAULT NULL,
      created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_status (status),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Tabla de balances (capital total)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS portfolio_balances (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      user_id      INT NOT NULL,
      account_type ENUM('propia', 'compartida') NOT NULL,
      total_usd    DECIMAL(15, 2) NOT NULL DEFAULT 0,
      updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY idx_user_account (user_id, account_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Tabla de métricas históricas
  await db.execute(`
    CREATE TABLE IF NOT EXISTS historical_metrics (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      user_id      INT NOT NULL,
      account_type ENUM('propia', 'compartida') NOT NULL DEFAULT 'compartida',
      month_year   VARCHAR(50) NOT NULL,
      usd_start    DECIMAL(15, 2) NOT NULL DEFAULT 0,
      deposits     DECIMAL(15, 2) NOT NULL DEFAULT 0,
      usd_end      DECIMAL(15, 2) NOT NULL DEFAULT 0,
      var_percent  DECIMAL(10, 4) NOT NULL DEFAULT 0,
      var_spy      DECIMAL(10, 4) NOT NULL DEFAULT 0,
      difference   DECIMAL(10, 4) NOT NULL DEFAULT 0,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY idx_user_account_month (user_id, account_type, month_year)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Migración para BD existente en Hostinger: Agregar columna account_type si no existe
  try {
    await db.execute(`
      ALTER TABLE trades 
      ADD COLUMN account_type ENUM('propia', 'compartida') NOT NULL DEFAULT 'propia' AFTER type;
    `);
    console.log('✅ Migración: Columna account_type agregada a trades');
  } catch (error) {
    // Ignorar error si la columna ya existe (ER_DUP_FIELDNAME - 1060)
    if (error.code !== 'ER_DUP_FIELDNAME') {
      console.error('⚠️ Error al intentar agregar account_type:', error.message);
    }
  }

  // Migración: Agregar columna entry_price_ars
  try {
    await db.execute(`
      ALTER TABLE trades 
      ADD COLUMN entry_price_ars DECIMAL(15, 6) DEFAULT NULL AFTER entry_price;
    `);
    console.log('✅ Migración: Columna entry_price_ars agregada a trades');
  } catch (error) {
    if (error.code !== 'ER_DUP_FIELDNAME') {
      console.error('⚠️ Error al intentar agregar entry_price_ars:', error.message);
    }
  }

  console.log('✅ Base de datos inicializada correctamente');
}

module.exports = { getPool, initializeDatabase };
