require('dotenv').config({ path: '../api/.env' });
const fs = require('fs');
const path = require('path');
const { getPool, initializeDatabase } = require('../api/database/db');

async function seed() {
  await initializeDatabase();
  const db = getPool();

  const csvPath = path.join(__dirname, '../public/shared_account_data.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.split('\n').filter(l => l.trim() !== '');

  // Omitir cabecera
  const dataLines = lines.slice(1);

  // El user_id para Teo suele ser 1
  const userId = 1;
  const accountType = 'compartida';

  console.log(`Encontradas ${dataLines.length} filas para insertar...`);

  let count = 0;
  for (const line of dataLines) {
    const cols = line.split(',');
    if (cols.length < 7) continue;

    // "MES","USD INICIO","APORTES","USD FINAL","VAR (%)","VAR SPY(%)","DIFERENCIA"
    const month = cols[0].trim();
    // Parse values safely since they might have dots for thousands (e.g., 1.192 in the CSV, wait, no, the CSV has '1.192' but we can just use parseFloat directly because the CSV seems to just use '.' for thousands incorrectly sometimes, like '1.192' -> 1192?
    // Let's look at the CSV: "OCTUBRE (2024),1159,275,1.192,..." Wait, 1.192 is 1192.
    const cleanNumber = (str) => {
      if (!str) return 0;
      // If there are multiple dots, it's weird, but if there's one dot and exactly 3 digits after it, it's probably thousands
      const cleaned = str.replace('%', '').trim();
      // Actually let's just assume `1.192` means 1192 and `158.0` means 158.
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

  console.log(`✅ Se insertaron/actualizaron ${count} métricas históricas.`);
  process.exit(0);
}

seed();
