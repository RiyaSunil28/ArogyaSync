import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Consultations from './pages/Consultations';
import Prescriptions from './pages/Prescriptions';
import Vaccinations from './pages/Vaccinations';
import SyncCenter from './pages/SyncCenter';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('jwt_token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('jwt_token'));

  const handleLogin  = () => setIsAuthenticated(true);
  const handleLogout = () => { localStorage.removeItem('jwt_token'); setIsAuthenticated(false); };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />}
        />

        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index                  element={<Dashboard />} />
          <Route path="patients"        element={<Patients />} />
          <Route path="consultations"   element={<Consultations />} />
          <Route path="prescriptions"   element={<Prescriptions />} />
          <Route path="vaccinations"    element={<Vaccinations />} />
          <Route path="sync-center"     element={<SyncCenter />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;