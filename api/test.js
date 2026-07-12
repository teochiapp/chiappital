require('dotenv').config();
const { getPool } = require('./database/db');

async function test() {
  try {
    const db = getPool();
    const query = `
      INSERT INTO lab_preferences (user_id, country_analysis)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE country_analysis = VALUES(country_analysis)
    `;
    const vals = [1, JSON.stringify({ spy: { dailyTrend: 'alcista' } })];
    await db.execute(query, vals);
    console.log("Success inserting!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit(0);
  }
}
test();
