import { priceConfig } from '../config/priceConfig';

class AlphaVantageService {
  constructor() {
    this.apiKey = priceConfig.alphaVantageApiKey;
    this.baseUrl = 'https://www.alphavantage.co/query';
    this.rateLimitMs = 15 * 1000; // Alpha Vantage permite ~4-5 requests/min con clave gratuita
    this.lastRequestTimestamp = 0;
    this.cache = new Map();
    this.cacheTTL = 10 * 60 * 1000; // 10 minutos
  }

  async waitForRateLimit() {
    const now = Date.now();
    const elapsed = now - this.lastRequestTimestamp;
    if (elapsed < this.rateLimitMs) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitMs - elapsed));
    }
    this.lastRequestTimestamp = Date.now();
  }

  ensureApiKey() {
    if (!this.apiKey) {
      throw new Error('Alpha Vantage API key no configurada. Define REACT_APP_ALPHA_VANTAGE_KEY.');
    }
  }

  buildUrl(params) {
    const urlParams = new URLSearchParams({ ...params, apikey: this.apiKey });
    return `${this.baseUrl}?${urlParams.toString()}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getQuote(symbol) {
    this.ensureApiKey();
    const cacheKey = `quote_${symbol}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    await this.waitForRateLimit();

    const url = this.buildUrl({
      function: 'GLOBAL_QUOTE',
      symbol
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Alpha Vantage GLOBAL_QUOTE HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.Note) {
      throw new Error('Alpha Vantage rate limit alcanzado. Intenta de nuevo en un minuto.');
    }

    if (!data['Global Quote'] || !data['Global Quote']['05. price']) {
      throw new Error('Respuesta inválida de Alpha Vantage para GLOBAL_QUOTE');
    }

    const price = parseFloat(data['Global Quote']['05. price']);
    if (Number.isNaN(price) || price <= 0) {
      throw new Error('Precio inválido en respuesta de Alpha Vantage');
    }

    const quote = {
      symbol,
      price,
      previousClose: parseFloat(data['Global Quote']['08. previous close']) || null,
      changePercent: parseFloat(data['Global Quote']['10. change percent']) || null
    };

    this.setCache(cacheKey, quote);
    return quote;
  }

  async getDailySeries(symbol, outputSize = 'compact') {
    this.ensureApiKey();
    const cacheKey = `daily_${symbol}_${outputSize}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    await this.waitForRateLimit();

    const url = this.buildUrl({
      function: 'TIME_SERIES_DAILY_ADJUSTED',
      symbol,
      outputsize: outputSize
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Alpha Vantage TIME_SERIES_DAILY HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.Note) {
      throw new Error('Alpha Vantage rate limit alcanzado. Intenta de nuevo en un minuto.');
    }

    const series = data['Time Series (Daily)'];
    if (!series || typeof series !== 'object') {
      throw new Error('Respuesta inválida de Alpha Vantage para TIME_SERIES_DAILY');
    }

    const candles = Object.entries(series)
      .map(([date, values]) => ({
        timestamp: Date.parse(date),
        close: parseFloat(values['4. close'])
      }))
      .filter(item => !Number.isNaN(item.timestamp) && item.close > 0)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (candles.length === 0) {
      throw new Error('Alpha Vantage no devolvió velas válidas');
    }

    this.setCache(cacheKey, candles);
    return candles;
  }
}

export default new AlphaVantageService();
