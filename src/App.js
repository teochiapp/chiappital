import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStyles } from './styles/GlobalStyles';

// Importar containers
import LoginContainer from './containers/LoginContainer';
import AccountSelectionContainer from './containers/AccountSelectionContainer';
import DashboardContainer from './containers/DashboardContainer';
import TradeLogsContainer from './containers/TradeLogsContainer';
import MethodologyContainer from './containers/MethodologyContainer';
import LabContainer from './containers/LabContainer';

// Personal Hub
import PersonalHub from './modules/personal/pages/PersonalHub';
import HabitsPage from './modules/personal/pages/HabitsPage';
import GoalsPage from './modules/personal/pages/GoalsPage';
import LanguagesPage from './modules/personal/pages/LanguagesPage';
import { PersonalHubProvider } from './context/PersonalHubContext';

// Importar Contexto
import { AccountProvider } from './context/AccountContext';

// Componentes
import Header from './components/common/Header';

// Personal Hub Layout
import PersonalLayout from './modules/personal/components/PersonalLayout';

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
              <Route 
                path="/metodologia" 
                element={
                  <ProtectedRoute>
                    <MethodologyContainer />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/lab" 
                element={
                  <ProtectedRoute>
                    <LabContainer />
                  </ProtectedRoute>
                } 
              />

              {/* ─── Personal Hub (ruta oculta, acceso directo por URL) ─── */}
              <Route
                path="/personal"
                element={
                  <ProtectedRoute>
                    <PersonalHubProvider>
                      <PersonalLayout />
                    </PersonalHubProvider>
                  </ProtectedRoute>
                }
              >
                <Route index element={<PersonalHub />} />
                <Route path="habits" element={<HabitsPage />} />
                <Route path="goals" element={<GoalsPage />} />
                <Route path="languages" element={<LanguagesPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </AccountProvider>
    </>
  );
}

export default App;
