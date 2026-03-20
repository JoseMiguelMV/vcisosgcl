import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import IncidentForm from './pages/IncidentForm';
import IncidentDetail from './pages/IncidentDetail';
import Roadmap from './pages/Roadmap';
import Compliance from './pages/Compliance';
import Risks from './pages/Risks';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Administration from './pages/Administration';
import SuperAdmin from './pages/SuperAdmin';

function AuthGuard({ children, roleRequired }) {
  const { isLoggedIn, user } = useAppContext();
  
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (roleRequired && user?.role !== roleRequired) return <Navigate to="/dashboard" replace />;
  
  return children;
}

function AppContent() {
  const { isLoggedIn } = useAppContext();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />} />
        
        <Route path="/" element={<AuthGuard><Layout /></AuthGuard>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="compliance" element={<Compliance />} />
          <Route path="risks" element={<Risks />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="incidents/new" element={<IncidentForm />} />
          <Route path="incidents/:id" element={<IncidentDetail />} />
          <Route path="documents" element={<Documents />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reports" element={<Reports />} />
          <Route path="administration" element={<Administration />} />
          <Route path="superadmin" element={<AuthGuard roleRequired="SUPER_ADMIN"><SuperAdmin /></AuthGuard>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
