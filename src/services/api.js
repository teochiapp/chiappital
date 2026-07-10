// services/api.js - Servicio para manejar llamadas a la API
class ApiService {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`);
      return await response.json();
    } catch (error) {
      console.error('Error en GET request:', error);
      throw error;
    }
  }

  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Error en POST request:', error);
      throw error;
    }
  }
}

export default ApiService;
