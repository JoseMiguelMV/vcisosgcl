import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const [companies, setCompanies] = useState([]); // For SuperAdmin
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [theme, setTheme] = useState(() => getSavedData('sgcs_theme', 'dark'));

  const [compliance, setCompliance] = useState({
    iso27001: 0,
    nist: 0,
    ley21459: 30,
    ley19628: 50
  });

  // --- HELPER: API FETCH ---
  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (company?.id) headers['x-company-id'] = company.id;

    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
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
    setIncidents([]);
    setRisks([]);
    setDocuments([]);
    setCompanies([]);
  };

  // --- SUPERADMIN ACTIONS ---
  const createCompanyWithAdmin = async (companyName, adminEmail, adminPassword, adminName) => {
    const result = await apiFetch('/superadmin/companies', {
      method: 'POST',
      body: JSON.stringify({ companyName, adminEmail, adminPassword, adminName })
    });
    setCompanies(prev => [...prev, { ...result.company, users: [result.user] }]);
    return result;
  };

  const setupSuperAdmin = async (email, password, name) => {
    const data = await apiFetch('/auth/setup-superadmin', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    });
    setUser(data);
    setCompany(data.company);
    setIsLoggedIn(true);
  };

  // --- ADMIN ACTIONS ---
  const registerUser = async (email, password, name, role) => {
    const newUser = await apiFetch('/admin/users', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role })
    });
    setUsers(prev => [...prev, newUser]);
  };

  // --- COMPLIANCE CALCULATION ---
  useEffect(() => {
    let isoTotal = 0, isoScore = 0; nistTotal = 0, nistScore = 0;
    const getScore = (state) => {
      if (state === 'Implementado' || state === 'Auditado') return 100;
      if (state === 'En progreso') return 50;
      return 0;
    };
    controls.forEach(ctrl => {
      const score = getScore(ctrl.state);
      if (ctrl.norm === 'ISO 27001') { isoTotal += 100; isoScore += score; }
      else if (ctrl.norm === 'NIST CSF') { nistTotal += 100; nistScore += score; }
    });
    setCompliance(prev => ({
      ...prev,
      iso27001: isoTotal ? Math.round((isoScore / isoTotal) * 100) : 0,
      nist: nistTotal ? Math.round((nistScore / nistTotal) * 100) : 0,
    }));
  }, [controls]);

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!isLoggedIn || !company?.id) return;

    const fetchData = async () => {
      try {
        if (user.role === 'SUPER_ADMIN') {
          const companyData = await apiFetch('/superadmin/companies');
          setCompanies(companyData);
        }

        const [ctrlData, riskData, incData, docData, userData] = await Promise.all([
          apiFetch('/controls'),
          apiFetch('/risks'),
          apiFetch('/incidents'),
          apiFetch('/documents'),
          apiFetch('/admin/users')
        ]);

        if (ctrlData.length > 0) {
          const backendMap = {};
          ctrlData.forEach(c => { backendMap[c.id] = c; });
          setControls(initialControls.map(ctrl => ({
            ...ctrl,
            state: backendMap[ctrl.id]?.state || ctrl.state
          })));
        } else {
          await apiFetch('/controls/seed', { method: 'POST', body: JSON.stringify({ initialControls }) });
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
  }, [isLoggedIn, company?.id, user?.role, apiFetch]);

  // --- RESOURCE ACTIONS ---
  const updateControlState = async (id, newState) => {
    setControls(controls.map(ctrl => ctrl.id === id ? { ...ctrl, state: newState } : ctrl));
    await apiFetch(`/controls/${id}`, { method: 'PUT', body: JSON.stringify({ state: newState }) });
  };
  
  const addIncident = async (incident) => {
    const data = await apiFetch('/incidents', {
      method: 'POST',
      body: JSON.stringify({ ...incident, logs: [{ action: 'Incidente Reportado', user: user?.name, date: new Date().toISOString() }] })
    });
    setIncidents([data, ...incidents]);
  };

  const addRisk = async (risk) => {
    const data = await apiFetch('/risks', { method: 'POST', body: JSON.stringify(risk) });
    setRisks([data, ...risks]);
  };

  // --- THEME ---
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('sgcs_theme', JSON.stringify(theme));
  }, [theme]);

  const value = {
    user, company, isLoggedIn, login, register, logout, 
    registerUser, users, loadingUsers,
    companies, createCompanyWithAdmin, setupSuperAdmin,
    incidents, addIncident, compliance, controls, updateControlState, risks, addRisk,
    documents, theme, toggleTheme: () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
