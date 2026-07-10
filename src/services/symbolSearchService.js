// services/symbolSearchService.js - Servicio para búsqueda de símbolos
import { priceConfig, PRICE_PROVIDERS } from '../config/priceConfig';

class SymbolSearchService {
  constructor() {
    this.config = priceConfig;
    this.cache = new Map(); // Cache para búsquedas
    this.cacheExpiry = 300000; // 5 minutos de cache
    
    console.log('🔍 SymbolSearchService inicializado con:', {
      provider: this.config.provider,
      hasApiKey: !!this.config.apiKey && this.config.apiKey !== 'demo'
    });
  }

  // Método principal para buscar símbolos
  async searchSymbols(query) {
    if (!query || query.length < 2) {
      return this.getPopularSymbols();
    }

    try {
      // Verificar cache primero
      const cacheKey = query.toLowerCase();
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        console.log(`📦 Cache hit para búsqueda: ${query}`);
        return cached.results;
      }

      console.log(`🔍 Buscando símbolos para: "${query}"`);
      
      let results = [];
      
      // Si es demo key, usar símbolos predefinidos
      if (this.config.apiKey === 'demo') {
        results = this.searchMockSymbols(query);
      } else {
        // Usar API real según el proveedor
        results = await this.searchRealSymbols(query);
      }
      
      // Guardar en cache
      this.cache.set(cacheKey, {
        results,
        timestamp: Date.now()
      });

      return results;
    } catch (error) {
      console.error(`❌ Error buscando símbolos para "${query}":`, error);
      // Fallback a símbolos populares en caso de error
      return this.getPopularSymbols().filter(symbol => 
        symbol.symbol.toLowerCase().includes(query.toLowerCase()) ||
        symbol.name.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  // Búsqueda en símbolos predefinidos (modo demo)
  searchMockSymbols(query) {
    const mockSymbols = this.getAllMockSymbols();
    const queryLower = query.toLowerCase();
    
    return mockSymbols.filter(symbol => 
      symbol.symbol.toLowerCase().includes(queryLower) ||
      symbol.name.toLowerCase().includes(queryLower) ||
      symbol.sector.toLowerCase().includes(queryLower)
    ).slice(0, 10); // Máximo 10 resultados
  }

  // Búsqueda usando APIs reales
  async searchRealSymbols(query) {
    switch (this.config.provider) {
      case PRICE_PROVIDERS.IEX_CLOUD:
        return await this.searchIEXCloud(query);
      
      case PRICE_PROVIDERS.FINNHUB:
        return await this.searchFinnhub(query);
        
      default:
        return this.searchMockSymbols(query);
    }
  }

  // Búsqueda en IEX Cloud
  async searchIEXCloud(query) {
    const url = `https://cloud.iexapis.com/stable/search/${encodeURIComponent(query)}?token=${this.config.apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error en IEX Cloud search');
    
    const data = await response.json();
    
    return data.slice(0, 10).map(item => ({
      symbol: item.symbol,
      name: item.securityName,
      type: item.securityType,
      region: item.region || 'US',
      currency: 'USD',
      sector: item.sector || 'Unknown',
      price: null
    }));
  }

  // Búsqueda en Finnhub
  async searchFinnhub(query) {
    const url = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${this.config.apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error en Finnhub search');
    
    const data = await response.json();
    
    if (!data.result) return [];
    
    // Filtrar solo NYSE (US) y BYMA (Argentina)
    const filtered = data.result.filter(item => {
      const symbol = item.symbol || '';
      const displaySymbol = item.displaySymbol || '';
      
      // Excluir CDRs, ETPs, warrants, y otros instrumentos derivados
      if (symbol.includes('.') || displaySymbol.includes('.')) {
        // Permitir solo .BA (BYMA - Buenos Aires)
        if (!symbol.endsWith('.BA') && !displaySymbol.endsWith('.BA')) {
          return false;
        }
      }
      
      // Excluir símbolos con sufijos no deseados
      const excludedSuffixes = ['.NE', '.L', '.TO', '.V', '.CN', '.HK', '.SW', '.PA', '.DE', '.MI'];
      if (excludedSuffixes.some(suffix => symbol.endsWith(suffix) || displaySymbol.endsWith(suffix))) {
        return false;
      }
      
      // Solo Common Stock, ETFs e índices
      const allowedTypes = ['Common Stock', 'EQS', 'Equity', 'ETF', 'ETP', 'Index'];
      if (!allowedTypes.includes(item.type)) {
        return false;
      }
      
      return true;
    });
    
    return filtered.slice(0, 10).map(item => {
      const isArgentina = item.symbol.endsWith('.BA');
      return {
        symbol: item.symbol,
        name: item.description,
        type: item.type === 'Common Stock' ? 'Equity' : item.type,
        region: isArgentina ? 'AR' : 'US',
        currency: isArgentina ? 'ARS' : 'USD',
        sector: 'Unknown',
        price: null
      };
    });
  }

  // Símbolos populares por defecto
  getPopularSymbols() {
    return [
      // 📊 ETFs
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', sector: 'ETF', region: 'US', currency: 'USD', type: 'ETF' },
      { symbol: 'QQQ', name: 'Invesco QQQ Trust (Nasdaq-100)', sector: 'ETF', region: 'US', currency: 'USD', type: 'ETF' },
      { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF', sector: 'ETF', region: 'US', currency: 'USD', type: 'ETF' },
      { symbol: 'TQQQ', name: 'ProShares UltraPro QQQ (3x)', sector: 'ETF', region: 'US', currency: 'USD', type: 'ETF' },
      { symbol: 'PSQ', name: 'ProShares Short QQQ (Inverse ETF)', sector: 'ETF', region: 'US', currency: 'USD', type: 'ETF' },
      
      // 🇺🇸 Tecnología
      { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Tecnología', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'GOOGL', name: 'Alphabet Inc. (Google)', sector: 'Tecnología', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Tecnología', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'E-commerce', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotriz', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'META', name: 'Meta Platforms Inc. (Facebook)', sector: 'Tecnología', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Tecnología', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Entretenimiento', region: 'US', currency: 'USD', type: 'Equity' },
      
      // 🇺🇸 Financiero
      { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financiero', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'BAC', name: 'Bank of America Corp.', sector: 'Financiero', region: 'US', currency: 'USD', type: 'Equity' },
      
      // 🇦🇷 ADRs en NYSE
      { symbol: 'YPF', name: 'YPF S.A.', sector: 'Energía', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'PAM', name: 'Pampa Energía S.A.', sector: 'Energía', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'BMA', name: 'Banco Macro S.A.', sector: 'Financiero', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'GGAL', name: 'Grupo Financiero Galicia S.A.', sector: 'Financiero', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'SUPV', name: 'Grupo Supervielle S.A.', sector: 'Financiero', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'TEO', name: 'Telecom Argentina S.A.', sector: 'Telecomunicaciones', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'CEPU', name: 'Central Puerto S.A.', sector: 'Servicios Públicos', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'TX', name: 'Ternium Argentina S.A.', sector: 'Industrial', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'LOMA', name: 'Loma Negra C.I.A.S.A.', sector: 'Materiales', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'TGS', name: 'Transportadora de Gas del Sur S.A.', sector: 'Energía', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'EDN', name: 'Edenor S.A.', sector: 'Servicios Públicos', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'DESP', name: 'Despegar.com Corp.', sector: 'Tecnología', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'MELI', name: 'MercadoLibre Inc.', sector: 'Tecnología', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'IRS', name: 'IRSA Inversiones y Representaciones S.A.', sector: 'Bienes Raíces', region: 'AR', currency: 'USD', type: 'Equity' },
      
      // 🇧🇷 Brasil
      { symbol: 'VALE', name: 'Vale S.A.', sector: 'Minería', region: 'BR', currency: 'BRL', type: 'Equity' },
      { symbol: 'PETR4', name: 'Petróleo Brasileiro S.A.', sector: 'Energía', region: 'BR', currency: 'BRL', type: 'Equity' },
      { symbol: 'PBR', name: 'Petrobras ADR', sector: 'Energía', region: 'BR', currency: 'USD', type: 'Equity' },
      { symbol: 'JD', name: 'JD.com Inc.', sector: 'E-commerce', region: 'CN', currency: 'USD', type: 'Equity' },
      { symbol: 'BABA', name: 'Alibaba Group Holding Ltd.', sector: 'E-commerce', region: 'CN', currency: 'USD', type: 'Equity' },
      { symbol: 'NTES', name: 'NetEase Inc.', sector: 'Tecnología', region: 'CN', currency: 'USD', type: 'Equity' },
      { symbol: 'NU', name: 'Nu Holdings Ltd. (Nubank)', sector: 'Financiero', region: 'BR', currency: 'USD', type: 'Equity' },
      
      // 🏦 Crypto
      { symbol: 'BTC', name: 'Bitcoin', sector: 'Criptomoneda', region: 'Global', currency: 'USD', type: 'Crypto' },
      { symbol: 'ETH', name: 'Ethereum', sector: 'Criptomoneda', region: 'Global', currency: 'USD', type: 'Crypto' },
      { symbol: 'XRP', name: 'Ripple (XRP)', sector: 'Criptomoneda', region: 'Global', currency: 'USD', type: 'Crypto' }
    ];
  }

  // Todos los símbolos mock para búsqueda
  getAllMockSymbols() {
    return [
      // 📊 ETFs
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', sector: 'ETF', region: 'US', currency: 'USD', type: 'ETF' },
      { symbol: 'QQQ', name: 'Invesco QQQ Trust (Nasdaq-100)', sector: 'ETF', region: 'US', currency: 'USD', type: 'ETF' },
      { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF', sector: 'ETF', region: 'US', currency: 'USD', type: 'ETF' },
      { symbol: 'IWM', name: 'iShares Russell 2000 ETF', sector: 'ETF', region: 'US', currency: 'USD', type: 'ETF' },
      { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', sector: 'ETF', region: 'US', currency: 'USD', type: 'ETF' },
      { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', sector: 'ETF', region: 'US', currency: 'USD', type: 'ETF' },
      { symbol: 'TQQQ', name: 'ProShares UltraPro QQQ (3x)', sector: 'ETF', region: 'US', currency: 'USD', type: 'ETF' },
      { symbol: 'PSQ', name: 'ProShares Short QQQ (Inverse ETF)', sector: 'ETF', region: 'US', currency: 'USD', type: 'ETF' },
      
      // 🇺🇸 Estados Unidos - Tecnología
      { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Tecnología', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'GOOGL', name: 'Alphabet Inc. (Google)', sector: 'Tecnología', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'GOOG', name: 'Alphabet Inc. Class A', sector: 'Tecnología', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Tecnología', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Tecnología', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Tecnología', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Tecnología', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Tecnología', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'INTC', name: 'Intel Corporation', sector: 'Tecnología', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Tecnología', region: 'US', currency: 'USD', type: 'Equity' },
      
      // 🇺🇸 E-commerce y Consumo
      { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'E-commerce', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotriz', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Entretenimiento', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'DIS', name: 'Walt Disney Company', sector: 'Entretenimiento', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'NKE', name: 'Nike Inc.', sector: 'Consumo', region: 'US', currency: 'USD', type: 'Equity' },
      
      // 🇺🇸 Financiero
      { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financiero', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'BAC', name: 'Bank of America Corp.', sector: 'Financiero', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'WFC', name: 'Wells Fargo & Company', sector: 'Financiero', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'GS', name: 'Goldman Sachs Group Inc.', sector: 'Financiero', region: 'US', currency: 'USD', type: 'Equity' },
      
      // 🇺🇸 Salud
      { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Salud', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Salud', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'UNH', name: 'UnitedHealth Group Inc.', sector: 'Salud', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'MRNA', name: 'Moderna Inc.', sector: 'Salud', region: 'US', currency: 'USD', type: 'Equity' },
      
      // 🇺🇸 Energía
      { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energía', region: 'US', currency: 'USD', type: 'Equity' },
      { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energía', region: 'US', currency: 'USD', type: 'Equity' },
      
      // 🇦🇷 Argentina (NYSE - ADRs en USD)
      { symbol: 'YPFD', name: 'YPF S.A.', sector: 'Energía', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'PAMP', name: 'Pampa Energía S.A.', sector: 'Energía', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'TECO2', name: 'Telecom Argentina S.A.', sector: 'Telecomunicaciones', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'BMA', name: 'Banco Macro S.A.', sector: 'Financiero', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'SUPV', name: 'Grupo Supervielle S.A.', sector: 'Financiero', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'CEPU', name: 'Central Puerto S.A.', sector: 'Utilities', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'TX', name: 'Ternium Argentina S.A.', sector: 'Industrial', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'LOMA', name: 'Loma Negra C.I.A.S.A.', sector: 'Materiales', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'TGS', name: 'Transportadora de Gas del Sur S.A.', sector: 'Energía', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'EDN', name: 'Edenor S.A.', sector: 'Utilities', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'DESP', name: 'Despegar.com Corp.', sector: 'Tecnología', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'MELI', name: 'MercadoLibre Inc.', sector: 'Tecnología', region: 'AR', currency: 'USD', type: 'Equity' },
      { symbol: 'IRS', name: 'IRSA Inversiones y Representaciones S.A.', sector: 'Bienes Raíces', region: 'AR', currency: 'USD', type: 'Equity' },
      
      // 🇧🇷 Brasil
      { symbol: 'VALE', name: 'Vale S.A.', sector: 'Minería', region: 'BR', currency: 'BRL', type: 'Equity' },
      { symbol: 'PETR4', name: 'Petróleo Brasileiro S.A. (Petrobras)', sector: 'Energía', region: 'BR', currency: 'BRL', type: 'Equity' },
      { symbol: 'ITUB', name: 'Itaú Unibanco Holding S.A.', sector: 'Financiero', region: 'BR', currency: 'BRL', type: 'Equity' },
      { symbol: 'BBDC4', name: 'Banco Bradesco S.A.', sector: 'Financiero', region: 'BR', currency: 'BRL', type: 'Equity' },
      { symbol: 'ABEV', name: 'Ambev S.A.', sector: 'Consumo', region: 'BR', currency: 'BRL', type: 'Equity' },
      { symbol: 'PBR', name: 'Petrobras ADR', sector: 'Energía', region: 'BR', currency: 'USD', type: 'Equity' },
      { symbol: 'NU', name: 'Nu Holdings Ltd. (Nubank)', sector: 'Financiero', region: 'BR', currency: 'USD', type: 'Equity' },
      
      // 🇨🇳 China
      { symbol: 'BABA', name: 'Alibaba Group Holding Ltd.', sector: 'E-commerce', region: 'CN', currency: 'USD', type: 'Equity' },
      { symbol: 'JD', name: 'JD.com Inc.', sector: 'E-commerce', region: 'CN', currency: 'USD', type: 'Equity' },
      { symbol: 'TCEHY', name: 'Tencent Holdings Ltd.', sector: 'Tecnología', region: 'CN', currency: 'USD', type: 'Equity' },
      { symbol: 'NIO', name: 'NIO Inc.', sector: 'Automotriz', region: 'CN', currency: 'USD', type: 'Equity' },
      { symbol: 'BIDU', name: 'Baidu Inc.', sector: 'Tecnología', region: 'CN', currency: 'USD', type: 'Equity' },
      { symbol: 'NTES', name: 'NetEase Inc.', sector: 'Tecnología', region: 'CN', currency: 'USD', type: 'Equity' },
      
      // 🏦 Criptomonedas
      { symbol: 'BTC', name: 'Bitcoin', sector: 'Criptomoneda', region: 'Global', currency: 'USD', type: 'Crypto' },
      { symbol: 'ETH', name: 'Ethereum', sector: 'Criptomoneda', region: 'Global', currency: 'USD', type: 'Crypto' },
      { symbol: 'ADA', name: 'Cardano', sector: 'Criptomoneda', region: 'Global', currency: 'USD', type: 'Crypto' },
      { symbol: 'SOL', name: 'Solana', sector: 'Criptomoneda', region: 'Global', currency: 'USD', type: 'Crypto' },
      { symbol: 'MATIC', name: 'Polygon', sector: 'Criptomoneda', region: 'Global', currency: 'USD', type: 'Crypto' },
      { symbol: 'XRP', name: 'Ripple (XRP)', sector: 'Criptomoneda', region: 'Global', currency: 'USD', type: 'Crypto' }
    ];
  }

  // Limpiar cache manualmente
  clearCache() {
    this.cache.clear();
  }
}

export default new SymbolSearchService();
