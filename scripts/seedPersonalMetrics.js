require('dotenv').config({ path: '../api/.env' });
const fs = require('fs');
const path = require('path');
const { getPool, initializeDatabase } = require('../api/database/db');

async function seed() {
  await initializeDatabase();
  const db = getPool();

  const csvPath = path.join(__dirname, '../public/mi_cuenta_metricas_clean.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.split('\n').filter(l => l.trim() !== '');

  // Omitir cabecera
  const dataLines = lines.slice(1);

  // El user_id para Teo suele ser 1
  const userId = 1;
  const accountType = 'propia';

  console.log(`Encontradas ${dataLines.length} filas para insertar en cuenta propia...`);

  let count = 0;
  for (const line of dataLines) {
    const cols = line.split(',');
    if (cols.length < 7) continue;

    // "MES","USD INICIO","APORTES","USD FINAL","VAR (%)","VAR SPY(%)","DIFERENCIA"
    const month = cols[0].trim();
    if (!month) continue;

    const cleanNumber = (str) => {
      if (!str) return 0;
      const cleaned = str.replace('%', '').trim();
      if (cleaned.match(/^\d+\.\d{3}$/)) {
        return parseFloat(cleaned.replace('.', ''));
      }
      return parseFloat(cleaned) || 0;
    };

    const usdStart = cleanNumber(cols[1]);
    const deposits = cleanNumber(cols[2]);
    const usdEnd = cleanNumber(cols[3]);
    const varPercent = cleanNumber(cols[4]);
    const varSpy = cleanNumber(cols[5]);
    const diff = cleanNumber(cols[6]);

    try {
      await db.execute(`
        INSERT INTO historical_metrics 
        (user_id, account_type, month_year, usd_start, deposits, usd_end, var_percent, var_spy, difference)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        usd_start = VALUES(usd_start),
        deposits = VALUES(deposits),
        usd_end = VALUES(usd_end),
        var_percent = VALUES(var_percent),
        var_spy = VALUES(var_spy),
        difference = VALUES(difference)
      `, [userId, accountType, month, usdStart, deposits, usdEnd, varPercent, varSpy, diff]);
      count++;
    } catch (err) {
      console.error(`Error insertando ${month}:`, err.message);
    }
  }

  console.log(`✅ Se insertaron/actualizaron ${count} métricas históricas (Cuenta Propia).`);
  process.exit(0);
}

seed();
