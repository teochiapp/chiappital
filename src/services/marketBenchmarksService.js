import finnhubService from './finnhubService';
import { priceConfig } from '../config/priceConfig';

class MarketBenchmarksService {
  constructor() {
    this.spySymbol = 'SPY';
    this.cacheTTL = 15 * 60 * 1000; // 15 minutos
    this.errorTTL = 5 * 60 * 1000; // 5 minutos para reutilizar errores
    this.spyCache = null;
    this.spyCacheError = null;
  }

  async getSPYYTDPerformance(forceRefresh = false) {
    const now = Date.now();

    if (!forceRefresh && this.spyCache && now - this.spyCache.timestamp < this.cacheTTL) {
      return this.spyCache.value;
    }

    if (!forceRefresh && this.spyCacheError && now - this.spyCacheError.timestamp < this.errorTTL) {
      throw this.spyCacheError.error;
    }

    let lastError = null;

    if (!priceConfig.demoMode) {
      try {
        const value = await this.fetchViaFinnhub();
        this.spyCache = { value, timestamp: Date.now() };
        this.spyCacheError = null;
        return value;
      } catch (error) {
        lastError = error;
        console.warn('⚠️ Finnhub YTD fetch failed:', error?.message || error);
      }
    } else {
      console.info('ℹ️ Finnhub YTD fetch omitido porque demoMode está habilitado.');
    }

    // Si Finnhub falla y no hay fallback configurado, propagar error controlado
    this.spyCacheError = { error: lastError || new Error('No se pudo obtener el YTD del SPY'), timestamp: Date.now() };
    throw this.spyCacheError.error;
  }

  async fetchViaFinnhub() {
    const now = new Date();
    const startOfYearUTC = Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0);
    const from = Math.floor(startOfYearUTC / 1000);
    const to = Math.floor(Date.now() / 1000);

    const [quote, candles] = await Promise.all([
      finnhubService.getQuote(this.spySymbol),
      finnhubService.getCandles(this.spySymbol, 'D', from, to)
    ]);

    return this.calculateYTD(quote, candles);
  }

  calculateYTD(quote, candles) {
    if (!candles || candles.length === 0) {
      throw new Error('No candles data available');
    }

    const sortedCandles = candles
      .filter(candle => candle && candle.close && candle.close > 0)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (sortedCandles.length === 0) {
      throw new Error('No valid closing prices found');
    }

    const startPrice = sortedCandles[0].close;

    let currentPrice = quote?.price;
    if (!currentPrice || currentPrice <= 0) {
      const latestCandle = sortedCandles[sortedCandles.length - 1];
      currentPrice = latestCandle?.close;
    }

    if (!currentPrice || currentPrice <= 0) {
      throw new Error('Unable to determine current price');
    }

    return this.calculateYTDFromPrices(startPrice, currentPrice);
  }

  calculateYTDFromPrices(startPrice, currentPrice) {
    if (!startPrice || !currentPrice || startPrice <= 0) {
      throw new Error('Invalid price data for YTD calculation');
    }

    return ((currentPrice - startPrice) / startPrice) * 100;
  }
}

export default new MarketBenchmarksService();
