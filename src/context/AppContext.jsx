import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialControls } from '../data/controls';

const API_BASE = 'http://localhost:3050/api';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext error');
  return context;
};

const getSavedData = (key, initialValue) => {
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return initialValue;
    return JSON.parse(item);
  } catch (error) {
    return initialValue;
  }
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => getSavedData('sgcs_session_user', null));
  const [company, setCompany] = useState(() => getSavedData('sgcs_session_company', null));
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);
  const [theme, setTheme] = useState(() => getSavedData('sgcs_theme', 'dark'));

  const [controls, setControls] = useState(initialControls);
  const [incidents, setIncidents] = useState([]);
  const [risks, setRisks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [compliance, setCompliance] = useState({ iso27001: 0, nist: 0, ley21459: 0, ley19628: 0 });

  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (company?.id) headers['x-company-id'] = company.id;
    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Server Error');
    }
    return response.json().catch(() => ({}));
  }, [company?.id]);

  const login = async (email, password, companyName) => {
    const data = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, companyName }) });
    const userData = { id: data.id, name: data.name, email: data.email, role: data.role };
    setUser(userData);
    setCompany(data.company);
    setIsLoggedIn(true);
    window.localStorage.setItem('sgcs_session_user', JSON.stringify(userData));
    window.localStorage.setItem('sgcs_session_company', JSON.stringify(data.company));
  };

  const register = async (email, password, name, companyName) => {
    const data = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name, companyName }) });
    const userData = { id: data.id, name: data.name, email: data.email, role: data.role };
    setUser(userData);
    setCompany(data.company);
    setIsLoggedIn(true);
    window.localStorage.setItem('sgcs_session_user', JSON.stringify(userData));
    window.localStorage.setItem('sgcs_session_company', JSON.stringify(data.company));
  };

  const setupSuperAdmin = async (email, password, name) => {
    const data = await apiFetch('/auth/setup-superadmin', { method: 'POST', body: JSON.stringify({ email, password, name }) });
    const userData = { id: data.id, name: data.name, email: data.email, role: data.role };
    setUser(userData);
    setCompany(data.company);
    setIsLoggedIn(true);
    window.localStorage.setItem('sgcs_session_user', JSON.stringify(userData));
    window.localStorage.setItem('sgcs_session_company', JSON.stringify(data.company));
  };

  const logout = () => {
    window.localStorage.clear();
    setUser(null);
    setCompany(null);
    setIsLoggedIn(false);
    setIncidents([]);
    setRisks([]);
    setDocuments([]);
    setCompanies([]);
    setUsers([]);
  };

  const createCompanyWithAdmin = async (companyName, adminEmail, adminPassword, adminName) => {
    const res = await apiFetch('/superadmin/companies', {
      method: 'POST',
      body: JSON.stringify({ companyName, adminEmail, adminPassword, adminName })
    });
    setCompanies(prev => [...prev, { ...res.company, users: [res.user] }]);
    return res;
  };

  const registerUser = async (email, password, name, role) => {
    const newUser = await apiFetch('/admin/users', { method: 'POST', body: JSON.stringify({ email, password, name, role }) });
    setUsers(prev => [...prev, newUser]);
  };

  const updateControlState = async (id, newState) => {
    setControls(prev => prev.map(c => c.id === id ? { ...c, state: newState } : c));
    await apiFetch(`/controls/${id}`, { method: 'PUT', body: JSON.stringify({ state: newState }) }).catch(() => {});
  };

  useEffect(() => {
    if (!isLoggedIn || !company?.id) return;
    const load = async () => {
      try {
        const [ctrls, rsks, incs, docs, usrs] = await Promise.all([
          apiFetch('/controls').catch(() => []),
          apiFetch('/risks').catch(() => []),
          apiFetch('/incidents').catch(() => []),
          apiFetch('/documents').catch(() => []),
          apiFetch('/admin/users').catch(() => [])
        ]);
        
        if (ctrls?.length) {
          const map = {}; ctrls.forEach(c => map[c.id] = c);
          setControls(initialControls.map(c => ({ ...c, state: map[c.id]?.state || c.state })));
        } else if (user?.role !== 'SUPER_ADMIN') {
          await apiFetch('/controls/seed', { method: 'POST', body: JSON.stringify({ initialControls }) }).catch(() => {});
        }

        if (rsks) setRisks(rsks);
        if (incs) setIncidents(incs);
        if (docs) setDocuments(docs);
        if (usrs) setUsers(usrs);

        if (user?.role === 'SUPER_ADMIN') {
          const comps = await apiFetch('/superadmin/companies').catch(() => []);
          setCompanies(comps);
        }
      } catch (e) {
        console.error('Initial load failed', e);
      }
    };
    load();
  }, [isLoggedIn, company?.id, user?.role, apiFetch]);

  useEffect(() => {
    if (!controls?.length) return;
    let isoT = 0, isoS = 0, nistT = 0, nistS = 0;
    const score = (s) => (s === 'Implementado' || s === 'Auditado') ? 100 : (s === 'En progreso' ? 50 : 0);
    controls.forEach(c => {
      const s = score(c.state);
      if (c.norm === 'ISO 27001') { isoT += 100; isoS += s; }
      else if (c.norm === 'NIST CSF') { nistT += 100; nistS += s; }
    });
    setCompliance({ iso27001: isoT ? Math.round(isoS/isoT*100) : 0, nist: nistT ? Math.round(nistS/nistT*100) : 0, ley21459: 0, ley19628: 0 });
  }, [controls]);

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  const value = {
    user, company, isLoggedIn, login, register, logout, registerUser, users, loadingUsers,
    companies, createCompanyWithAdmin, setupSuperAdmin, incidents, compliance, controls, 
    updateControlState, risks, documents, theme, toggleTheme: () => setTheme(t => t === 'dark' ? 'light' : 'dark'),
    getAdvisorRecommendations: () => [] // Placeholder to prevent crash
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
