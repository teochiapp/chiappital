import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useStrapiAuth } from '../../hooks/useApiTrades';

const ProtectedRoute = ({ children }) => {
  const { user, loading, error } = useStrapiAuth();

  useEffect(() => {
    console.log('🛡️ ProtectedRoute - Estado actual:', { 
      user: user ? `${user.email || user.username}` : null, 
      loading, 
      error 
    });
  }, [user, loading, error]);

  // Si está cargando, mostrar loader alineado con el diseño de la app
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Unbounded, sans-serif',
        fontSize: '1rem',
        background: '#0f172a',
        color: '#94a3b8',
        gap: '1rem',
      }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
        <div>Verificando sesión...</div>
        {error && (
          <div style={{ fontSize: '0.85rem', color: '#f43f5e' }}>
            Error: {error}
          </div>
        )}
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigir al Login
  if (!user) {
    console.log('🚫 ProtectedRoute - No hay usuario, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ ProtectedRoute - Usuario autenticado, mostrando contenido');
  return children;
};

export default ProtectedRoute;
