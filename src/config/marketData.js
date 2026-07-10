// config/marketData.js - Configuración de mercados y sectores para diversificación

export const COUNTRIES = {
  USA: 'Estados Unidos',
  ARG: 'Argentina',
  BRA: 'Brasil', 
  CHN: 'China',
  EUR: 'Europa',
  JPN: 'Japón',
  KOR: 'Corea del Sur',
  IND: 'India',
  CAN: 'Canadá',
  AUS: 'Australia',
  OTHER: 'Otro'
};

export const SECTORS = {
  TECHNOLOGY: 'Tecnología',
  HEALTHCARE: 'Salud',
  FINANCIAL: 'Financiero',
  ENERGY: 'Energía',
  INDUSTRIAL: 'Industrial',
  CONSUMER_DISCRETIONARY: 'Consumo Discrecional',
  CONSUMER_STAPLES: 'Consumo Básico',
  UTILITIES: 'Servicios Públicos',
  MATERIALS: 'Materiales',
  REAL_ESTATE: 'Bienes Raíces',
  TELECOMMUNICATIONS: 'Telecomunicaciones',
  CRYPTO: 'Criptomonedas',
  ETF: 'ETF',
  OTHER: 'Otro'
};

// Mapeo de símbolos a países y sectores
export const symbolMapping = {
  // 📊 ETFs
  'SPY': { country: 'USA', sector: 'ETF', company: 'SPDR S&P 500 ETF Trust' },
  'QQQ': { country: 'USA', sector: 'ETF', company: 'Invesco QQQ Trust' },
  'DIA': { country: 'USA', sector: 'ETF', company: 'SPDR Dow Jones Industrial Average ETF' },
  'IWM': { country: 'USA', sector: 'ETF', company: 'iShares Russell 2000 ETF' },
  'VTI': { country: 'USA', sector: 'ETF', company: 'Vanguard Total Stock Market ETF' },
  'VOO': { country: 'USA', sector: 'ETF', company: 'Vanguard S&P 500 ETF' },
  'TQQQ': { country: 'USA', sector: 'ETF', company: 'ProShares UltraPro QQQ' },
  'PSQ': { country: 'USA', sector: 'ETF', company: 'ProShares Short QQQ' },
  
  // 🇺🇸 Estados Unidos - Tecnología
  'AAPL': { country: 'USA', sector: 'TECHNOLOGY', company: 'Apple Inc.' },
  'GOOGL': { country: 'USA', sector: 'TECHNOLOGY', company: 'Alphabet Inc.' },
  'GOOG': { country: 'USA', sector: 'TECHNOLOGY', company: 'Alphabet Inc.' },
  'MSFT': { country: 'USA', sector: 'TECHNOLOGY', company: 'Microsoft Corp.' },
  'AMZN': { country: 'USA', sector: 'CONSUMER_DISCRETIONARY', company: 'Amazon.com Inc.' },
  'TSLA': { country: 'USA', sector: 'CONSUMER_DISCRETIONARY', company: 'Tesla Inc.' },
  'META': { country: 'USA', sector: 'TECHNOLOGY', company: 'Meta Platforms Inc.' },
  'NVDA': { country: 'USA', sector: 'TECHNOLOGY', company: 'NVIDIA Corp.' },
  'NFLX': { country: 'USA', sector: 'CONSUMER_DISCRETIONARY', company: 'Netflix Inc.' },
  'ADBE': { country: 'USA', sector: 'TECHNOLOGY', company: 'Adobe Inc.' },
  
  // 🇺🇸 Estados Unidos - Financiero
  'JPM': { country: 'USA', sector: 'FINANCIAL', company: 'JPMorgan Chase & Co.' },
  'BAC': { country: 'USA', sector: 'FINANCIAL', company: 'Bank of America Corp.' },
  'WFC': { country: 'USA', sector: 'FINANCIAL', company: 'Wells Fargo & Co.' },
  'GS': { country: 'USA', sector: 'FINANCIAL', company: 'Goldman Sachs Group Inc.' },
  
  // 🇺🇸 Estados Unidos - Salud
  'JNJ': { country: 'USA', sector: 'HEALTHCARE', company: 'Johnson & Johnson' },
  'PFE': { country: 'USA', sector: 'HEALTHCARE', company: 'Pfizer Inc.' },
  'UNH': { country: 'USA', sector: 'HEALTHCARE', company: 'UnitedHealth Group Inc.' },
  'MRNA': { country: 'USA', sector: 'HEALTHCARE', company: 'Moderna Inc.' },
  
  // 🇺🇸 Estados Unidos - Energía
  'XOM': { country: 'USA', sector: 'ENERGY', company: 'Exxon Mobil Corp.' },
  'CVX': { country: 'USA', sector: 'ENERGY', company: 'Chevron Corp.' },
  
  // 🇺🇸 Estados Unidos - Industrial
  'BA': { country: 'USA', sector: 'INDUSTRIAL', company: 'Boeing Co.' },
  'CAT': { country: 'USA', sector: 'INDUSTRIAL', company: 'Caterpillar Inc.' },
  
  // 🇦🇷 Argentina (NYSE - ADRs)
  'YPFD': { country: 'ARG', sector: 'ENERGY', company: 'YPF S.A.' },
  'TECO2': { country: 'ARG', sector: 'TELECOMMUNICATIONS', company: 'Telecom Argentina' },
  'PAMP': { country: 'ARG', sector: 'ENERGY', company: 'Pampa Energía' },
  'BMA': { country: 'ARG', sector: 'FINANCIAL', company: 'Banco Macro' },
  'SUPV': { country: 'ARG', sector: 'FINANCIAL', company: 'Grupo Supervielle' },
  'CEPU': { country: 'ARG', sector: 'UTILITIES', company: 'Central Puerto' },
  
  // 🇦🇷 Argentina (BYMA - Bolsa de Buenos Aires)
  'AGRO.BA': { country: 'ARG', sector: 'CONSUMER_STAPLES', company: 'Adecoagro S.A.' },
  'ALUA.BA': { country: 'ARG', sector: 'INDUSTRIAL', company: 'Aluar Aluminio Argentino S.A.I.C.' },
  'AUSO.BA': { country: 'ARG', sector: 'INDUSTRIAL', company: 'Autopistas del Sol S.A.' },
  'BBAR.BA': { country: 'ARG', sector: 'FINANCIAL', company: 'BBVA Argentina S.A.' },
  'BHIP.BA': { country: 'ARG', sector: 'FINANCIAL', company: 'Banco Hipotecario S.A.' },
  'BMA.BA': { country: 'ARG', sector: 'FINANCIAL', company: 'Banco Macro S.A.' },
  'BYMA.BA': { country: 'ARG', sector: 'FINANCIAL', company: 'Bolsas y Mercados Argentinos S.A.' },
  'CECO2.BA': { country: 'ARG', sector: 'UTILITIES', company: 'Central Costanera S.A.' },
  'CEPU.BA': { country: 'ARG', sector: 'UTILITIES', company: 'Central Puerto S.A.' },
  'COME.BA': { country: 'ARG', sector: 'INDUSTRIAL', company: 'Sociedad Comercial del Plata S.A.' },
  'CRES.BA': { country: 'ARG', sector: 'REAL_ESTATE', company: 'Cresud S.A.C.I.F.yA.' },
  'CVH.BA': { country: 'ARG', sector: 'TELECOMMUNICATIONS', company: 'Cablevisión Holding S.A.' },
  'DGCU2.BA': { country: 'ARG', sector: 'UTILITIES', company: 'Distribuidora de Gas Cuyana S.A.' },
  'EDN.BA': { country: 'ARG', sector: 'UTILITIES', company: 'Edenor S.A.' },
  'GCLA.BA': { country: 'ARG', sector: 'TELECOMMUNICATIONS', company: 'Grupo Clarín S.A.' },
  'GGAL.BA': { country: 'ARG', sector: 'FINANCIAL', company: 'Grupo Financiero Galicia S.A.' },
  'HAVA.BA': { country: 'ARG', sector: 'CONSUMER_DISCRETIONARY', company: 'Havanna Holding S.A.' },
  'IMV.BA': { country: 'ARG', sector: 'INDEX', company: 'S&P MERVAL Argentina Index' },
  'IRCP.BA': { country: 'ARG', sector: 'REAL_ESTATE', company: 'IRSA Propiedades Comerciales S.A.' },
  'IRSA.BA': { country: 'ARG', sector: 'REAL_ESTATE', company: 'IRSA Inversiones y Representaciones S.A.' },
  'LEDE.BA': { country: 'ARG', sector: 'CONSUMER_STAPLES', company: 'Ledesma S.A.A.I.' },
  'LOMA.BA': { country: 'ARG', sector: 'MATERIALS', company: 'Loma Negra C.I.A.S.A.' },
  'LONG.BA': { country: 'ARG', sector: 'INDUSTRIAL', company: 'Longvie S.A.' },
  'MERVAL.BA': { country: 'ARG', sector: 'INDEX', company: 'MERVAL Index' },
  'METR.BA': { country: 'ARG', sector: 'UTILITIES', company: 'Metrogas S.A.' },
  'MERV.BA': { country: 'ARG', sector: 'INDEX', company: 'S&P MERVAL Index' },
  'MIRG.BA': { country: 'ARG', sector: 'TECHNOLOGY', company: 'Mirgor S.A.C.I.F.I.A.' },
  'MOLA.BA': { country: 'ARG', sector: 'CONSUMER_STAPLES', company: 'Molinos Agro S.A.' },
  'MOLI.BA': { country: 'ARG', sector: 'CONSUMER_STAPLES', company: 'Molinos Río de la Plata S.A.' },
  'OEST.BA': { country: 'ARG', sector: 'INDUSTRIAL', company: 'Grupo Concesionario del Oeste S.A.' },
  'PAMP.BA': { country: 'ARG', sector: 'ENERGY', company: 'Pampa Energía S.A.' },
  'RICH.BA': { country: 'ARG', sector: 'HEALTHCARE', company: 'Laboratorios Richmond S.A.C.I.F.' },
  'SAMI.BA': { country: 'ARG', sector: 'CONSUMER_STAPLES', company: 'San Miguel S.A.' },
  'SPMERVAL.BA': { country: 'ARG', sector: 'INDEX', company: 'S&P MERVAL Total Return' },
  'SUPV.BA': { country: 'ARG', sector: 'FINANCIAL', company: 'Grupo Supervielle S.A.' },
  'TECO2.BA': { country: 'ARG', sector: 'TELECOMMUNICATIONS', company: 'Telecom Argentina S.A.' },
  'TGNO4.BA': { country: 'ARG', sector: 'ENERGY', company: 'Transportadora de Gas del Norte S.A.' },
  'TGSU2.BA': { country: 'ARG', sector: 'ENERGY', company: 'Transportadora de Gas del Sur S.A.' },
  'TRAN.BA': { country: 'ARG', sector: 'UTILITIES', company: 'Transener S.A.' },
  'TXAR.BA': { country: 'ARG', sector: 'INDUSTRIAL', company: 'Ternium Argentina' },
  'VALO.BA': { country: 'ARG', sector: 'FINANCIAL', company: 'Grupo Financiero Valores S.A.' },
  'YPF.BA': { country: 'ARG', sector: 'ENERGY', company: 'YPF S.A.' },
  
  // 🇧🇷 Brasil
  'VALE': { country: 'BRA', sector: 'MATERIALS', company: 'Vale S.A.' },
  'PETR4': { country: 'BRA', sector: 'ENERGY', company: 'Petrobras' },
  'ITUB': { country: 'BRA', sector: 'FINANCIAL', company: 'Itaú Unibanco' },
  'BBDC4': { country: 'BRA', sector: 'FINANCIAL', company: 'Bradesco' },
  'ABEV': { country: 'BRA', sector: 'CONSUMER_STAPLES', company: 'Ambev S.A.' },
  
  // 🇨🇳 China
  'BABA': { country: 'CHN', sector: 'CONSUMER_DISCRETIONARY', company: 'Alibaba Group' },
  'JD': { country: 'CHN', sector: 'CONSUMER_DISCRETIONARY', company: 'JD.com Inc.' },
  'TCEHY': { country: 'CHN', sector: 'TECHNOLOGY', company: 'Tencent Holdings' },
  'NIO': { country: 'CHN', sector: 'CONSUMER_DISCRETIONARY', company: 'NIO Inc.' },
  'BIDU': { country: 'CHN', sector: 'TECHNOLOGY', company: 'Baidu Inc.' },
  
  // 🇪🇺 Europa
  'ASML': { country: 'EUR', sector: 'TECHNOLOGY', company: 'ASML Holding N.V.' },
  'SAP': { country: 'EUR', sector: 'TECHNOLOGY', company: 'SAP SE' },
  'NESN': { country: 'EUR', sector: 'CONSUMER_STAPLES', company: 'Nestlé S.A.' },
  'LVMH': { country: 'EUR', sector: 'CONSUMER_DISCRETIONARY', company: 'LVMH' },
  
  // 🏦 Criptomonedas
  'BTC': { country: 'USA', sector: 'CRYPTO', company: 'Bitcoin' },
  'ETH': { country: 'USA', sector: 'CRYPTO', company: 'Ethereum' },
  'ADA': { country: 'USA', sector: 'CRYPTO', company: 'Cardano' },
  'SOL': { country: 'USA', sector: 'CRYPTO', company: 'Solana' },
};

// Función para obtener datos de un símbolo
export const getSymbolData = (symbol) => {
  const data = symbolMapping[symbol?.toUpperCase()];
  
  if (!data) {
    // Valores por defecto para símbolos no reconocidos
    return {
      country: 'OTHER',
      sector: 'OTHER',
      company: symbol || 'Desconocido',
      countryName: 'Otro',
      sectorName: 'Otro'
    };
  }
  
  return {
    ...data,
    countryName: COUNTRIES[data.country] || 'Otro',
    sectorName: SECTORS[data.sector] || 'Otro'
  };
};

// Función para obtener todos los países únicos
export const getAllCountries = () => {
  return Object.keys(COUNTRIES).map(code => ({
    code,
    name: COUNTRIES[code]
  }));
};

// Función para obtener todos los sectores únicos
export const getAllSectors = () => {
  return Object.keys(SECTORS).map(code => ({
    code,
    name: SECTORS[code]
  }));
};

// Colores para los gráficos
export const CHART_COLORS = [
  '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#27ae60',
  '#2980b9', '#8e44ad', '#16a085', '#f1c40f', '#d35400',
  '#7f8c8d', '#c0392b', '#8e44ad', '#2c3e50', '#f39c12'
];
