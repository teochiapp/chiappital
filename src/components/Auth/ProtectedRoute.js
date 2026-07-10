import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useStrapiAuth } from '../../hooks/useApiTrades';
import DevAuth from './DevAuth';

const ProtectedRoute = ({ children }) => {
  const { user, loading, error } = useStrapiAuth();

  // Debug logging
  useEffect(() => {
    console.log('🛡️ ProtectedRoute - Estado actual:', { 
      user: user ? `${user.email || user.username}` : null, 
      loading, 
      error 
    });
  }, [user, loading, error]);

  // Si está cargando, mostrar loader
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Unbounded, sans-serif',
        fontSize: '1.2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ marginBottom: '1rem' }}>⏳</div>
        <div>Verificando autenticación...</div>
        {error && (
          <div style={{ 
            marginTop: '1rem', 
            fontSize: '0.9rem', 
            color: '#ffcccc' 
          }}>
            Error: {error}
          </div>
        )}
      </div>
    );
  }

  // Si no hay usuario autenticado, mostrar login
  if (!user) {
    console.log('🚫 ProtectedRoute - No hay usuario, mostrando DevAuth');
    return <DevAuth />;
  }

  // Si está autenticado, mostrar el contenido protegido
  console.log('✅ ProtectedRoute - Usuario autenticado, mostrando contenido');
  return children;
};

export default ProtectedRoute;
