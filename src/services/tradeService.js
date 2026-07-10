// services/tradeService.js - Servicio para manejar datos de trades
class TradeService {
  constructor() {
    this.trades = JSON.parse(localStorage.getItem('trades')) || [];
  }

  // Guardar trades en localStorage
  saveTrades() {
    localStorage.setItem('trades', JSON.stringify(this.trades));
  }

  // Crear un nuevo trade
  createTrade(tradeData) {
    const newTrade = {
      id: Date.now().toString(),
      ...tradeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.trades.unshift(newTrade); // Agregar al inicio
    this.saveTrades();
    return newTrade;
  }

  // Obtener todos los trades
  getAllTrades() {
    return this.trades.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Obtener trade por ID
  getTradeById(id) {
    return this.trades.find(trade => trade.id === id);
  }

  // Actualizar un trade
  updateTrade(id, updatedData) {
    const index = this.trades.findIndex(trade => trade.id === id);
    if (index !== -1) {
      this.trades[index] = {
        ...this.trades[index],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      this.saveTrades();
      return this.trades[index];
    }
    return null;
  }

  // Eliminar un trade
  deleteTrade(id) {
    const index = this.trades.findIndex(trade => trade.id === id);
    if (index !== -1) {
      const deletedTrade = this.trades.splice(index, 1)[0];
      this.saveTrades();
      return deletedTrade;
    }
    return null;
  }

  // Obtener estadísticas de trades
  getTradeStats() {
    if (this.trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalProfit: 0,
        averageWin: 0,
        averageLoss: 0,
        profitFactor: 0
      };
    }

    const winningTrades = this.trades.filter(trade => trade.result > 0);
    const losingTrades = this.trades.filter(trade => trade.result < 0);
    const totalProfit = this.trades.reduce((sum, trade) => sum + trade.result, 0);
    const totalWins = winningTrades.reduce((sum, trade) => sum + trade.result, 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.result, 0));

    return {
      totalTrades: this.trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: (winningTrades.length / this.trades.length) * 100,
      totalProfit,
      averageWin: winningTrades.length > 0 ? totalWins / winningTrades.length : 0,
      averageLoss: losingTrades.length > 0 ? totalLosses / losingTrades.length : 0,
      profitFactor: totalLosses > 0 ? totalWins / totalLosses : 0
    };
  }

  // Filtrar trades por fecha
  getTradesByDateRange(startDate, endDate) {
    return this.trades.filter(trade => {
      const tradeDate = new Date(trade.createdAt);
      return tradeDate >= startDate && tradeDate <= endDate;
    });
  }

  // Filtrar trades por símbolo
  getTradesBySymbol(symbol) {
    return this.trades.filter(trade => 
      trade.symbol.toLowerCase().includes(symbol.toLowerCase())
    );
  }

  // Exportar trades a JSON
  exportTrades() {
    return JSON.stringify(this.trades, null, 2);
  }

  // Importar trades desde JSON
  importTrades(jsonData) {
    try {
      const importedTrades = JSON.parse(jsonData);
      if (Array.isArray(importedTrades)) {
        this.trades = importedTrades;
        this.saveTrades();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing trades:', error);
      return false;
    }
  }
}

// Crear instancia singleton
const tradeService = new TradeService();

export default tradeService;
