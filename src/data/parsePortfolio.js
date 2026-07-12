const fs = require('fs');

const content = fs.readFileSync('c:/Users/teoch/OneDrive/Desktop/React/Chiappital/Chiappital/src/data/IEB-2026-07-11-Portafolio-347621-ARS - Patrimonio.csv', 'utf8');
const lines = content.split('\n');

const openTrades = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line || line.startsWith(',,') || line.startsWith('Disponible') || line.startsWith('Liquidar') || line.startsWith('Subtotal') || line.startsWith('Especie') || line.startsWith('Fecha') || line.startsWith('Patrimonio') || line.startsWith('Tenencia') || line.startsWith('Cedears') || line.startsWith('Otros') || line.startsWith('DOLARUSA')) {
    continue;
  }
  
  // Simple CSV split considering quotes
  let cols = [];
  let inQuotes = false;
  let current = '';
  for (let char of line) {
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) { cols.push(current); current = ''; }
    else current += char;
  }
  cols.push(current);
  
  if (cols.length < 6) continue;

  const symbolFull = cols[0];
  if (!symbolFull.includes(' - ')) continue;
  
  const symbol = symbolFull.split(' - ')[0];
  const qtyStr = cols[2];
  const pppStr = cols[5]; // PPP
  
  const qty = parseFloat(qtyStr.replace(/\./g, '').replace(',', '.'));
  const ppp = parseFloat(pppStr.replace(/\./g, '').replace(',', '.'));
  
  if (isNaN(ppp)) continue;

  openTrades.push({
    symbol: symbol,
    type: 'buy',
    status: 'open',
    entry_price: ppp,
    createdAt: new Date().toISOString(),
    notes: `Qty: ${qty} (Portafolio IEB)`
  });
}

fs.writeFileSync('c:/Users/teoch/OneDrive/Desktop/React/Chiappital/Chiappital/src/data/parsedPortfolio.json', JSON.stringify(openTrades, null, 2));
console.log(`Generated ${openTrades.length} open trades.`);
