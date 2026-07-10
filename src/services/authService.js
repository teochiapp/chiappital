// services/authService.js - Servicio de autenticación
class AuthService {
  constructor() {
    this.isAuthenticated = false;
    this.user = null;
    this.token = null;
  }

  // Simular login (en producción esto sería una llamada a la API)
  async login(email, password) {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Credenciales demo
      if (email === 'demo@simpletrade.com' && password === 'demo123') {
        this.isAuthenticated = true;
        this.user = {
          id: 1,
          email: email,
          name: 'Usuario Demo',
          role: 'trader'
        };
        this.token = 'demo-token-123';
        
        // Guardar en localStorage
        localStorage.setItem('authToken', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return { success: true, user: this.user };
      } else {
        return { success: false, error: 'Credenciales incorrectas' };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  }

  // Cerrar sesión
  logout() {
    this.isAuthenticated = false;
    this.user = null;
    this.token = null;
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Verificar si está autenticado
  checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      this.isAuthenticated = true;
      this.token = token;
      this.user = JSON.parse(user);
      return true;
    }
    
    return false;
  }

  // Obtener usuario actual
  getCurrentUser() {
    return this.user;
  }

  // Verificar si tiene token válido
  hasValidToken() {
    return this.token && this.isAuthenticated;
  }
}

// Crear instancia singleton
const authService = new AuthService();

export default authService;
