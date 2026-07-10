// services/priceService.js - Servicio para obtener precios en tiempo real
import { priceConfig, buildPriceUrl, extractPriceFromResponse } from '../config/priceConfig';
import yahooFinanceService from './yahooFinanceService';

class PriceService {
  constructor() {
    this.config = priceConfig;
    this.cache = new Map(); // Cache para evitar muchas llamadas
    this.cacheExpiry = 4 * 60 * 60 * 1000; // 4 horas de cache (suficiente para trading diario)
    this.pendingRequests = new Map(); // Para evitar requests duplicados
    
    console.log('🔧 PriceService inicializado con:', {
      provider: this.config.provider,
      hasApiKey: !!this.config.apiKey && this.config.apiKey !== 'demo',
      gracefulDegradation: this.config.gracefulDegradation,
      cacheExpiry: '4 horas'
    });
  }

  // Método genérico para obtener precio actual
  async getCurrentPrice(symbol) {
    const cacheKey = symbol.toUpperCase();
    
    try {
      // Si está en modo demo, generar precio mock directamente
      if (this.config.demoMode) {
        console.log(`🎭 Demo mode enabled - generating mock price for ${symbol}`);
        const mockPrice = this.generateMockPrice(symbol);
        console.log(`🎭 Mock price for ${symbol}: $${mockPrice}`);
        return mockPrice;
      }
      
      // Verificar cache primero
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        const minutesOld = Math.round((Date.now() - cached.timestamp) / (1000 * 60));
        const priceType = cached.isMock ? 'mock' : (cached.isDelayed ? 'delayed' : 'real');
        console.log(`📦 Cache hit para ${symbol}: $${cached.price} (${minutesOld} min antiguo, ${priceType})`);
        return cached.price;
      }

      // Verificar si ya hay una request pendiente para este símbolo
      if (this.pendingRequests.has(cacheKey)) {
        console.log(`⏳ Request pendiente para ${symbol}, esperando...`);
        return await this.pendingRequests.get(cacheKey);
      }

      console.log(`🔍 Obteniendo precio para ${symbol}`);
      
      // Crear promesa para la request y guardarla
      const requestPromise = this.fetchPriceWithFallback(symbol, cacheKey);

      // Guardar la promesa como request pendiente
      this.pendingRequests.set(cacheKey, requestPromise);
      
      return await requestPromise;
    } catch (error) {
      console.error(`❌ Error getting price for ${symbol}:`, error);
      
      // Si gracefulDegradation está activado, retornar null en lugar de mock
      if (this.config.gracefulDegradation) {
        console.log(`⚠️ Graceful degradation activado - retornando null para ${symbol}`);
        return null;
      }
      
      // Generar precio mock en caso de error
      console.log(`🎭 Generando precio mock para ${symbol} debido a error de API`);
      const mockPrice = this.generateMockPrice(symbol);
      
      // Guardar precio mock en cache
      this.cache.set(cacheKey, {
        price: mockPrice,
        timestamp: Date.now(),
        isMock: true
      });
      
      console.log(`🎭 Precio mock generado para ${symbol}: $${mockPrice}`);
      return mockPrice;
    }
  }

  // Método con fallback en cascada: Finnhub -> Yahoo (si se configuró) -> null/mock
  async fetchPriceWithFallback(symbol, cacheKey) {
    let lastError = null;

    // Intentar con Finnhub primero (si no está en demoMode)
    if (!this.config.demoMode && this.config.provider === 'finnhub') {
      try {
        const price = await this.fetchFromFinnhub(symbol);
        this.cache.set(cacheKey, {
          price,
          timestamp: Date.now(),
          isDelayed: false
        });
        this.pendingRequests.delete(cacheKey);
        console.log(`✅ Finnhub - Precio ${symbol}: $${price}`);
        return price;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Finnhub falló para ${symbol}:`, error.message);
      }
    }

    // Intentar con Yahoo Finance (solo posible si hay backend que evite CORS)
    try {
      const quote = await yahooFinanceService.getQuote(symbol);
      if (quote?.price) {
        const price = quote.price;
        this.cache.set(cacheKey, {
          price,
          timestamp: Date.now(),
          isDelayed: true
        });
        this.pendingRequests.delete(cacheKey);
        console.log(`✅ Yahoo Finance (delayed) - Precio ${symbol}: $${price}`);
        return price;
      }
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Yahoo Finance falló para ${symbol}:`, error.message);
    }

    this.pendingRequests.delete(cacheKey);
    throw lastError || new Error(`No se pudo obtener precio para ${symbol}`);
  }

  // Fetch desde Finnhub
  async fetchFromFinnhub(symbol) {
    const url = buildPriceUrl(symbol, 'finnhub', this.config.apiKey);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const price = extractPriceFromResponse(data, 'finnhub');
    
    if (!price || isNaN(price) || price <= 0) {
      throw new Error('Invalid price data');
    }
    
    return price;
  }

  // Método para obtener múltiples precios de una vez
  async getMultiplePrices(symbols) {
    const promises = symbols.map(symbol => this.getCurrentPrice(symbol));
    const results = await Promise.allSettled(promises);
    
    const prices = {};
    symbols.forEach((symbol, index) => {
      if (results[index].status === 'fulfilled') {
        prices[symbol.toUpperCase()] = results[index].value;
      } else {
        prices[symbol.toUpperCase()] = null;
      }
    });

    return prices;
  }

  // Generar precio simulado para demo
  generateMockPrice(symbol) {
    // Precios base simulados para diferentes símbolos
    const basePrices = {
      // ETFs
      'SPY': 450,
      'QQQ': 380,
      'DIA': 350,
      'IWM': 200,
      'VTI': 240,
      'VOO': 420,
      'TQQQ': 120,
      'PSQ': 12,
      // US Stocks
      'AAPL': 150,
      'GOOGL': 130,
      'MSFT': 300,
      'TSLA': 200,
      'AMZN': 120,
      'NVDA': 400,
      'META': 250,
      // ADRs Argentinos
      'YPF': 18,
      'PAM': 12,
      'BMA': 20,
      'GGAL': 13,
      'SUPV': 5,
      'TEO': 6,
      'CEPU': 10,
      'TX': 40,
      'LOMA': 8,
      'TGS': 9,
      'EDN': 4,
      'DESP': 10,
      'MELI': 1200,
      'IRS': 7,
      // Brasil ADR
      'PBR': 15,
      // Genérico
      'VALE': 14,
      'PETR4': 7,
      'ITUB': 6,
      'BBDC4': 4,
      'ABEV': 3
    };
    
    const upperSymbol = symbol.toUpperCase();
    const basePrice = basePrices[upperSymbol] || 100;
    // Agregar variación aleatoria de ±5%
    const variation = (Math.random() - 0.5) * 0.1; // -5% a +5%
    const mockPrice = basePrice * (1 + variation);
    
    console.log(`🎭 Precio simulado para ${symbol}: $${mockPrice.toFixed(2)}`);
    return parseFloat(mockPrice.toFixed(2));
  }

  // Método de utilidad para calcular ganancia/pérdida no realizada
  calculateUnrealizedPnL(entryPrice, currentPrice, tradeType) {
    if (!currentPrice || !entryPrice) return 0;

    let pnlPercent = 0;
    if (tradeType === 'buy') {
      pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100;
    } else { // sell (short)
      pnlPercent = ((entryPrice - currentPrice) / entryPrice) * 100;
    }

    return pnlPercent;
  }

  // Limpiar cache manualmente si es necesario
  clearCache() {
    this.cache.clear();
  }
}

export default new PriceService();
