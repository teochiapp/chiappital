import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStyles } from './styles/GlobalStyles';

// Importar containers
import LoginContainer from './containers/LoginContainer';
import AccountSelectionContainer from './containers/AccountSelectionContainer';
import DashboardContainer from './containers/DashboardContainer';
import TradeLogsContainer from './containers/TradeLogsContainer';

// Importar Contexto
import { AccountProvider } from './context/AccountContext';

// Componentes
import Header from './components/common/Header';

// Componente para rutas protegidas
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <>
      <GlobalStyles />
      <AccountProvider>
        <Router>
          <div className="App">
            <Header />
            <Routes>
              <Route path="/login" element={<LoginContainer />} />
              <Route 
                path="/select-account" 
                element={
                  <ProtectedRoute>
                    <AccountSelectionContainer />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardContainer />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/trades" 
                element={
                  <ProtectedRoute>
                    <TradeLogsContainer />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </AccountProvider>
    </>
  );
}

export default App;
