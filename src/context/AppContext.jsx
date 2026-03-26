import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialControls } from '../data/controls';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

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
  } catch {
    return initialValue;
  }
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => getSavedData('sgcs_session_user', null));
  const [company, setCompany] = useState(() => getSavedData('sgcs_session_company', null));
  const [accessToken, setAccessToken] = useState(() => getSavedData('sgcs_access_token', null));
  const [refreshToken, setRefreshToken] = useState(() => getSavedData('sgcs_refresh_token', null));
  const [isLoggedIn, setIsLoggedIn] = useState(!!user && !!accessToken);
  const [theme, setTheme] = useState(() => getSavedData('sgcs_theme', 'dark'));

  const [controls, setControls] = useState(initialControls);
  const [incidents, setIncidents] = useState([]);
  const [risks, setRisks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [compliance, setCompliance] = useState({ iso27001: 0, nist: 0, ley21459: 0, ley19628: 0 });

  const saveSession = (userData, companyData, access, refresh) => {
    setUser(userData);
    setCompany(companyData);
    setAccessToken(access);
    setRefreshToken(refresh);
    setIsLoggedIn(true);
    window.localStorage.setItem('sgcs_session_user', JSON.stringify(userData));
    window.localStorage.setItem('sgcs_session_company', JSON.stringify(companyData));
    window.localStorage.setItem('sgcs_access_token', access);
    window.localStorage.setItem('sgcs_refresh_token', refresh);
  };

  const clearSession = () => {
    window.localStorage.removeItem('sgcs_session_user');
    window.localStorage.removeItem('sgcs_session_company');
    window.localStorage.removeItem('sgcs_access_token');
    window.localStorage.removeItem('sgcs_refresh_token');
    setUser(null);
    setCompany(null);
    setAccessToken(null);
    setRefreshToken(null);
    setIsLoggedIn(false);
    setIncidents([]);
    setRisks([]);
    setDocuments([]);
    setCompanies([]);
    setUsers([]);
  };

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        clearSession();
        return false;
      }

      const data = await response.json();
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      window.localStorage.setItem('sgcs_access_token', data.accessToken);
      window.localStorage.setItem('sgcs_refresh_token', data.refreshToken);
      return true;
    } catch {
      clearSession();
      return false;
    }
  }, [refreshToken]);

  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    if (company?.id) headers['x-company-id'] = company.id;

    let response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

    if (response.status === 401 && refreshToken) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${window.localStorage.getItem('sgcs_access_token')}`;
        response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Server Error');
    }

    return response.json().catch(() => ({}));
  }, [accessToken, refreshToken, company?.id, refreshAccessToken]);

  const login = async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const userData = { id: data.id, name: data.name, email: data.email, role: data.role };
    saveSession(userData, data.company, data.accessToken, data.refreshToken);
  };

  const register = async (email, password, name, companyName) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, companyName }),
    });
    const userData = { id: data.id, name: data.name, email: data.email, role: data.role };
    saveSession(userData, data.company, data.accessToken, data.refreshToken);
  };

  const setupSuperAdmin = async (email, password, name) => {
    const data = await apiFetch('/auth/setup-superadmin', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    const userData = { id: data.id, name: data.name, email: data.email, role: data.role };
    saveSession(userData, data.company, data.accessToken, data.refreshToken);
  };

  const logout = () => {
    clearSession();
  };

  const createCompanyWithAdmin = async (companyName, adminEmail, adminPassword, adminName) => {
    const res = await apiFetch('/superadmin/companies', {
      method: 'POST',
      body: JSON.stringify({ companyName, adminEmail, adminPassword, adminName }),
    });
    setCompanies(prev => [...prev, { ...res.company, users: [res.user] }]);
    return res;
  };

  const registerUser = async (email, password, name, role) => {
    const newUser = await apiFetch('/admin/users', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
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
          apiFetch('/admin/users').catch(() => []),
        ]);

        if (ctrls?.length) {
          const map = {};
          ctrls.forEach(c => map[c.id] = c);
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

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'sgcs_access_token' && !e.newValue) {
        clearSession();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    user, company, setCompany, isLoggedIn, login, register, logout, registerUser, users, loadingUsers,
    companies, createCompanyWithAdmin, setupSuperAdmin, incidents, compliance, controls,
    updateControlState, risks, documents, theme, toggleTheme: () => setTheme(t => t === 'dark' ? 'light' : 'dark'),
    accessToken,
    getAdvisorRecommendations: () => []
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
