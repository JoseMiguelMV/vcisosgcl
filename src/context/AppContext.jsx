import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { initialControls } from '../data/controls';

const API_BASE = 'http://localhost:3050/api';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

const getSavedData = (key, initialValue) => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    return initialValue;
  }
};

export const AppProvider = ({ children }) => {
  // --- AUTH STATE ---
  const [user, setUser] = useState(() => getSavedData('sgcs_session_user', null));
  const [company, setCompany] = useState(() => getSavedData('sgcs_session_company', null));
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);

  // --- DATA STATES ---
  const [incidents, setIncidents] = useState([]);
  const [controls, setControls] = useState(initialControls);
  const [risks, setRisks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [theme, setTheme] = useState(() => getSavedData('sgcs_theme', 'dark'));

  const [compliance, setCompliance] = useState({
    iso27001: 0,
    nist: 0,
    ley21459: 30,
    ley19628: 50
  });

  // --- HELPER: API FETCH ---
  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (company?.id) {
      headers['x-company-id'] = company.id;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'API Error');
    }

    return response.json();
  }, [company]);

  // --- AUTH ACTIONS ---
  const login = async (email, password, companyName) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, companyName })
    });
    
    setUser({ id: data.id, name: data.name, email: data.email, role: data.role });
    setCompany(data.company);
    setIsLoggedIn(true);
    
    window.localStorage.setItem('sgcs_session_user', JSON.stringify(data));
    window.localStorage.setItem('sgcs_session_company', JSON.stringify(data.company));
  };

  const register = async (email, password, name, companyName) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, companyName })
    });
    
    setUser({ id: data.id, name: data.name, email: data.email, role: data.role });
    setCompany(data.company);
    setIsLoggedIn(true);

    window.localStorage.setItem('sgcs_session_user', JSON.stringify(data));
    window.localStorage.setItem('sgcs_session_company', JSON.stringify(data.company));
  };

  const logout = () => {
    setUser(null);
    setCompany(null);
    setIsLoggedIn(false);
    window.localStorage.removeItem('sgcs_session_user');
    window.localStorage.removeItem('sgcs_session_company');
    // Clear other data to prevent leakage on same browser
    setIncidents([]);
    setRisks([]);
    setDocuments([]);
  };

  const registerUser = async (email, password, name, role) => {
    const newUser = await apiFetch('/admin/users', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role })
    });
    setUsers(prev => [...prev, newUser]);
  };

  // --- COMPLIANCE CALCULATION ---
  useEffect(() => {
    let isoTotal = 0, isoScore = 0;
    let nistTotal = 0, nistScore = 0;

    const getScore = (state) => {
      if (state === 'Implementado' || state === 'Auditado') return 100;
      if (state === 'En progreso') return 50;
      return 0;
    };

    controls.forEach(ctrl => {
      const score = getScore(ctrl.state);
      if (ctrl.norm === 'ISO 27001') {
        isoTotal += 100;
        isoScore += score;
      } else if (ctrl.norm === 'NIST CSF') {
        nistTotal += 100;
        nistScore += score;
      }
    });

    setCompliance(prev => ({
      ...prev,
      iso27001: isoTotal ? Math.round((isoScore / isoTotal) * 100) : 0,
      nist: nistTotal ? Math.round((nistScore / nistTotal) * 100) : 0,
    }));
  }, [controls]);

  // --- DATA FETCHING (Triggered by login/company change) ---
  useEffect(() => {
    if (!isLoggedIn || !company?.id) return;

    const fetchData = async () => {
      try {
        const [ctrlData, riskData, incData, docData, userData] = await Promise.all([
          apiFetch('/controls'),
          apiFetch('/risks'),
          apiFetch('/incidents'),
          apiFetch('/documents'),
          apiFetch('/admin/users')
        ]);

        // Controls Merge Logic
        if (ctrlData.length > 0) {
          const backendMap = {};
          ctrlData.forEach(c => { backendMap[c.id] = c; });
          setControls(initialControls.map(ctrl => ({
            ...ctrl,
            state: backendMap[ctrl.id]?.state || ctrl.state
          })));
        } else {
          // Seed if empty
          await apiFetch('/controls/seed', {
            method: 'POST',
            body: JSON.stringify({ initialControls })
          });
          setControls(initialControls);
        }

        setRisks(riskData);
        setIncidents(incData);
        setDocuments(docData);
        setUsers(userData);
      } catch (err) {
        console.error('Data fetch error:', err);
      }
    };

    fetchData();
  }, [isLoggedIn, company?.id, apiFetch]);

  // --- ACTIONS ---
  const addIncident = async (incident) => {
    const data = await apiFetch('/incidents', {
      method: 'POST',
      body: JSON.stringify({
        ...incident,
        logs: [{ action: 'Incidente Reportado', user: user?.name || 'Sistema', date: new Date().toISOString() }]
      })
    });
    setIncidents([data, ...incidents]);
  };

  const addIncidentLog = async (id, action, userName) => {
    const data = await apiFetch(`/incidents/${id}/logs`, {
      method: 'POST',
      body: JSON.stringify({ action, user: userName || user?.name })
    });
    setIncidents(incidents.map(inc => inc.id === id ? { ...inc, logs: [...inc.logs, data] } : inc));
  };

  const updateIncidentStatus = async (id, newStatus, userName) => {
    const data = await apiFetch(`/incidents/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus, action: `Estado cambiado a: ${newStatus}`, user: userName || user?.name })
    });
    setIncidents(incidents.map(inc => inc.id === id ? data : inc));
  };

  const updateControlState = async (id, newState) => {
    setControls(controls.map(ctrl => ctrl.id === id ? { ...ctrl, state: newState } : ctrl));
    await apiFetch(`/controls/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ state: newState })
    });
  };

  const addRisk = async (risk) => {
    const data = await apiFetch('/risks', {
      method: 'POST',
      body: JSON.stringify(risk)
    });
    setRisks([data, ...risks]);
  };

  const addDocument = async (doc) => {
    const data = await apiFetch('/documents', {
      method: 'POST',
      body: JSON.stringify(doc)
    });
    setDocuments([data, ...documents]);
  };

  const linkDocumentToControl = async (docId, controlId) => {
    setDocuments(documents.map(doc => doc.id === docId ? { ...doc, linkedControl: controlId } : doc));
    updateControlState(controlId, 'Auditado');
  };

  const getAdvisorRecommendations = () => {
    const recs = [];
    const highRisks = risks.filter(r => (r.impact * r.probability) >= 15);
    const activeIncs = incidents.filter(i => i.status !== 'Cerrado');
    if (highRisks.length > 0) recs.push({ type: 'risk', priority: 'Crítica', message: `Se detectaron ${highRisks.length} riesgos críticos.` });
    if (activeIncs.some(i => i.severity === 'high')) recs.push({ type: 'incident', priority: 'Urgente', message: 'Existen incidentes de alta severidad activos.' });
    return recs;
  };

  // --- THEME ---
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('sgcs_theme', JSON.stringify(theme));
  }, [theme]);

  const value = {
    user,
    company,
    isLoggedIn,
    login,
    register,
    logout,
    registerUser,
    users,
    loadingUsers,
    incidents,
    addIncident,
    addIncidentLog,
    updateIncidentStatus,
    compliance,
    controls,
    updateControlState,
    risks,
    addRisk,
    documents,
    addDocument,
    linkDocumentToControl,
    getAdvisorRecommendations,
    theme,
    toggleTheme: () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
