// services/companyLogoService.js - Servicio para obtener logos de empresas
import { Building2 } from 'lucide-react';

class CompanyLogoService {
  constructor() {
    // Cache para logos ya obtenidos
    this.logoCache = new Map();
    
    // Mapeo manual para símbolos conocidos (puedes expandir esta lista)
    this.knownLogos = {
      // ETFs principales
      'SPY': 'https://logo.clearbit.com/ssga.com',
      'QQQ': 'https://logo.clearbit.com/invesco.com',
      'DIA': 'https://logo.clearbit.com/ssga.com',
      'IWM': 'https://logo.clearbit.com/ishares.com',
      'VTI': 'https://logo.clearbit.com/vanguard.com',
      'VOO': 'https://logo.clearbit.com/vanguard.com',
      
      // Empresas US
      'AAPL': 'https://logo.clearbit.com/apple.com',
      'GOOGL': 'https://logo.clearbit.com/google.com',
      'GOOGLE': 'https://logo.clearbit.com/google.com',
      'MSFT': 'https://logo.clearbit.com/microsoft.com',
      'AMZN': 'https://logo.clearbit.com/amazon.com',
      'TSLA': 'https://logo.clearbit.com/tesla.com',
      'META': 'https://logo.clearbit.com/meta.com',
      'FB': 'https://logo.clearbit.com/meta.com',
      'NFLX': 'https://logo.clearbit.com/netflix.com',
      'NVDA': 'https://logo.clearbit.com/nvidia.com',
      'BABA': 'https://logo.clearbit.com/alibaba.com',
      'JNJ': 'https://logo.clearbit.com/jnj.com',
      'V': 'https://logo.clearbit.com/visa.com',
      'WMT': 'https://logo.clearbit.com/walmart.com',
      'PG': 'https://logo.clearbit.com/pg.com',
      'UNH': 'https://logo.clearbit.com/unitedhealthgroup.com',
      'HD': 'https://logo.clearbit.com/homedepot.com',
      'DIS': 'https://logo.clearbit.com/disney.com',
      'PYPL': 'https://logo.clearbit.com/paypal.com',
      'ADBE': 'https://logo.clearbit.com/adobe.com',
      'CRM': 'https://logo.clearbit.com/salesforce.com',
      'ORCL': 'https://logo.clearbit.com/oracle.com',
      'NKE': 'https://logo.clearbit.com/nike.com',
      'INTC': 'https://logo.clearbit.com/intel.com',
      'AMD': 'https://logo.clearbit.com/amd.com',
      'UBER': 'https://logo.clearbit.com/uber.com',
      'ZOOM': 'https://logo.clearbit.com/zoom.us',
      'SPOT': 'https://logo.clearbit.com/spotify.com',
      'TWTR': 'https://logo.clearbit.com/twitter.com',
      'X': 'https://logo.clearbit.com/x.com',
      'SNAP': 'https://logo.clearbit.com/snap.com',
      'SQ': 'https://logo.clearbit.com/squareup.com',
      'SHOP': 'https://logo.clearbit.com/shopify.com',
      'ROKU': 'https://logo.clearbit.com/roku.com',
      'PINS': 'https://logo.clearbit.com/pinterest.com',
      
      // Empresas argentinas (NYSE ADRs)
      'YPFD': 'https://logo.clearbit.com/ypf.com',
      'YPF': 'https://logo.clearbit.com/ypf.com',
      'GGAL': 'https://logo.clearbit.com/grupogalicia.com',
      'BMA': 'https://logo.clearbit.com/macro.com.ar',
      'TEO': 'https://logo.clearbit.com/telecom.com.ar',
      'TX': 'https://logo.clearbit.com/ternium.com',
      'PAM': 'https://logo.clearbit.com/pampaenergia.com',
      'PAMP': 'https://logo.clearbit.com/pampaenergia.com',
      'SUPV': 'https://logo.clearbit.com/supervielle.com.ar',
      'COME': 'https://logo.clearbit.com/bancor.com.ar',
      'CEPU': 'https://logo.clearbit.com/cepsa.com',
      
      // Empresas argentinas (BYMA)
      'GGAL.BA': 'https://logo.clearbit.com/grupogalicia.com',
      'YPF.BA': 'https://logo.clearbit.com/ypf.com',
      'PAMP.BA': 'https://logo.clearbit.com/pampaenergia.com',
      'ALUA.BA': 'https://logo.clearbit.com/aluar.com.ar',
      'TRAN.BA': 'https://logo.clearbit.com/transener.com.ar',
      'COME.BA': 'https://logo.clearbit.com/soccomdelplata.com.ar',
      'EDN.BA': 'https://logo.clearbit.com/edenor.com.ar',
      'TXAR.BA': 'https://logo.clearbit.com/ternium.com',
      'MIRG.BA': 'https://logo.clearbit.com/mirgor.com.ar',
      'LOMA.BA': 'https://logo.clearbit.com/lomanegra.com',
      
      // Empresas brasileñas
      'VALE': 'https://logo.clearbit.com/vale.com',
      'ITUB': 'https://logo.clearbit.com/itau.com.br',
      'ABEV': 'https://logo.clearbit.com/ambev.com.br',
      'BBD': 'https://logo.clearbit.com/bb.com.br',
      'PBR': 'https://logo.clearbit.com/petrobras.com.br',
      'SBS': 'https://logo.clearbit.com/santander.com.br',
      
      // Empresas chinas
      'JD': 'https://logo.clearbit.com/jd.com',
      'BILI': 'https://logo.clearbit.com/bilibili.com',
      'NIO': 'https://logo.clearbit.com/nio.com',
      'LI': 'https://logo.clearbit.com/lixiang.com',
      'XPEV': 'https://logo.clearbit.com/xiaopeng.com',
      'PDD': 'https://logo.clearbit.com/pdd.com',
      'DIDI': 'https://logo.clearbit.com/didiglobal.com'
    };
  }

  /**
   * Obtiene el logo de una empresa por su símbolo
   * @param {string} symbol - Símbolo de la empresa (ej: 'AAPL')
   * @returns {Promise<string|null>} - URL del logo o null si no se encuentra
   */
  async getCompanyLogo(symbol) {
    if (!symbol) return null;

    const upperSymbol = symbol.toUpperCase();

    // Revisar cache primero
    if (this.logoCache.has(upperSymbol)) {
      return this.logoCache.get(upperSymbol);
    }

    try {
      // Revisar logos conocidos primero
      if (this.knownLogos[upperSymbol]) {
        const logoUrl = this.knownLogos[upperSymbol];
        
        // Verificar que la imagen exista
        const isValid = await this.validateImageUrl(logoUrl);
        if (isValid) {
          this.logoCache.set(upperSymbol, logoUrl);
          return logoUrl;
        }
      }

      // Intentar diferentes proveedores de logos
      const logoProviders = [
        `https://logo.clearbit.com/${this.getCompanyDomain(upperSymbol)}`,
        `https://financialmodelingprep.com/image-stock/${upperSymbol}.png`,
        `https://assets.stockbit.com/logos/${upperSymbol}.png`
      ];

      for (const logoUrl of logoProviders) {
        const isValid = await this.validateImageUrl(logoUrl);
        if (isValid) {
          this.logoCache.set(upperSymbol, logoUrl);
          return logoUrl;
        }
      }

      // Si no se encuentra logo, cachear null para evitar requests repetidos
      this.logoCache.set(upperSymbol, null);
      return null;

    } catch (error) {
      console.warn(`Error obteniendo logo para ${symbol}:`, error);
      this.logoCache.set(upperSymbol, null);
      return null;
    }
  }

  /**
   * Valida si una URL de imagen es válida
   * @param {string} url - URL a validar
   * @returns {Promise<boolean>} - true si la imagen es válida
   */
  async validateImageUrl(url) {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        resolve(false);
      }, 3000); // Timeout de 3 segundos

      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };

      img.src = url;
    });
  }

  /**
   * Intenta obtener el dominio de la empresa basado en el símbolo
   * @param {string} symbol - Símbolo de la empresa
   * @returns {string} - Dominio estimado
   */
  getCompanyDomain(symbol) {
    // Mapeo básico para algunos símbolos conocidos
    const domainMap = {
      'AAPL': 'apple.com',
      'GOOGL': 'google.com',
      'MSFT': 'microsoft.com',
      'AMZN': 'amazon.com',
      'TSLA': 'tesla.com',
      'META': 'meta.com',
      'NFLX': 'netflix.com',
      'NVDA': 'nvidia.com'
    };

    return domainMap[symbol] || `${symbol.toLowerCase()}.com`;
  }

  /**
   * Limpia el cache de logos
   */
  clearCache() {
    this.logoCache.clear();
  }

  /**
   * Obtiene estadísticas del cache
   * @returns {Object} - Estadísticas del cache
   */
  getCacheStats() {
    return {
      size: this.logoCache.size,
      entries: Array.from(this.logoCache.entries())
    };
  }
}

// Crear instancia única del servicio
const companyLogoService = new CompanyLogoService();

export default companyLogoService;
