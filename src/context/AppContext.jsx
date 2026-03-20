import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [incidents, setIncidents] = useState(() => getSavedData('sgcs_incidents', [
    {
      id: 'INC-001',
      title: 'Phishing Comprometido',
      description: 'Usuario de finanzas ingresó credenciales en sitio falso.',
      severity: 'high',
      status: 'En progreso',
      date: new Date().toISOString(),
      legalCountdown: 72, // horas
      logs: [
        { id: uuidv4(), action: 'Incidente Reportado', user: 'Admin', date: new Date().toISOString() }
      ]
    }
  ]));
  
  const [company, setCompany] = useState(() => getSavedData('sgcs_company', {
    name: '',
    rut: '',
    legalContact: '',
    configured: false
  }));
  
  const [controls, setControls] = useState(() => {
    const saved = getSavedData('sgcs_controls_full', null);
    if (saved && saved.length > 0) {
      // Merge saved state with latest control definitions (to pick up new fields like description)
      const savedMap = {};
      saved.forEach(c => { savedMap[c.id] = c; });
      return initialControls.map(ctrl => ({
        ...ctrl,
        state: savedMap[ctrl.id]?.state || ctrl.state
      }));
    }
    return initialControls;
  });

  const [risks, setRisks] = useState(() => getSavedData('sgcs_risks', [
    { id: 'RSK-001', title: 'Ransomware en Base de Datos Principal', impact: 5, probability: 5, plan: 'Implementar A.8.12 y Backups cifrados', description: 'Impacto en Ley de Protección de Datos Personales (Multas) y pérdida operativa.' },
    { id: 'RSK-002', title: 'Fuga de Datos de Salud', impact: 5, probability: 4, plan: 'Implementar MFA y Control de Acceso', description: 'Acceso no autorizado a historias clínicas. Alto impacto normativo sanitario.' },
    { id: 'RSK-003', title: 'Caída de SSO Temporal', impact: 4, probability: 3, plan: 'Monitoreo continuo NIST Detect', description: 'Interrupción temporal del servicio por actualización de proveedor.' }
  ]));

  const [documents, setDocuments] = useState(() => getSavedData('sgcs_documents', [
    { id: 1, name: 'Política de Seguridad de la Información v2.1.pdf', type: 'Policy', folder: 'Políticas SGSI', date: '2026-03-01', size: '2.4 MB', author: 'CISO' },
    { id: 2, name: 'Procedimiento de Gestión de Incidentes v1.4.docx', type: 'Procedure', folder: 'Procedimientos', date: '2026-02-15', size: '1.1 MB', author: 'SecOps' },
    { id: 3, name: 'Plan de Continuidad de Negocio (BCP).pdf', type: 'Plan', folder: 'Procedimientos', date: '2026-01-20', size: '5.6 MB', author: 'Gerencia' },
    { id: 4, name: 'Registro de Aceptación de Políticas - Q1.xlsx', type: 'Evidence', folder: 'Registros Normativos', date: '2026-03-10', size: '840 KB', author: 'RRHH' },
    { id: 5, name: 'Matriz de Accesos.pdf', type: 'Record', folder: 'Evidencias 2026', date: '2026-03-12', size: '1.2 MB', author: 'TI' }
  ]));

  const [compliance, setCompliance] = useState({
    iso27001: 0,
    nist: 0,
    ley21459: 30, // Default placeholders for now
    ley19628: 50
  });

  // Calculate compliance whenever controls change
  useEffect(() => {
    let isoTotal = 0, isoScore = 0;
    let nistTotal = 0, nistScore = 0;

    const getScore = (state) => {
      if (state === 'Implementado' || state === 'Auditado') return 100;
      if (state === 'En progreso') return 50;
      return 0; // No iniciado
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

  // --- SYNC WITH BACKEND ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, ctrlRes, riskRes, incRes, docRes] = await Promise.all([
          fetch(`${API_BASE}/company`),
          fetch(`${API_BASE}/controls`),
          fetch(`${API_BASE}/risks`),
          fetch(`${API_BASE}/incidents`),
          fetch(`${API_BASE}/documents`)
        ]);

        if (compRes.ok) {
          const data = await compRes.json();
          if (data.id) setCompany(data);
        }

        if (ctrlRes.ok) {
          const data = await ctrlRes.json();
          if (data.length > 0) {
             // Merge backend state with latest control definitions (to pick up description field)
             const backendMap = {};
             data.forEach(c => { backendMap[c.id] = c; });
             setControls(initialControls.map(ctrl => ({
               ...ctrl,
               state: backendMap[ctrl.id]?.state || ctrl.state
             })));
          } else {
             // If DB controls are empty, seed them
             await fetch(`${API_BASE}/controls/seed`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ initialControls })
             });
          }
        }

        if (riskRes.ok) {
          const data = await riskRes.json();
          if (data.length > 0) setRisks(data);
        }

        if (incRes.ok) {
          const data = await incRes.json();
          if (data.length > 0) setIncidents(data);
        }

        if (docRes.ok) {
          const data = await docRes.json();
          if (data.length > 0) setDocuments(data);
        }
      } catch (err) {
        console.warn('Backend unavailable, using LocalStorage fallback.', err);
      }
    };
    fetchData();
  }, []);

  // Persist State to Backend and LocalStorage
  useEffect(() => {
    window.localStorage.setItem('sgcs_company', JSON.stringify(company));
    if (company.configured) {
       fetch(`${API_BASE}/company`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(company)
       }).catch(() => {});
    }
  }, [company]);

  useEffect(() => {
    window.localStorage.setItem('sgcs_controls_full', JSON.stringify(controls));
  }, [controls]);

  useEffect(() => {
    window.localStorage.setItem('sgcs_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    window.localStorage.setItem('sgcs_risks', JSON.stringify(risks));
  }, [risks]);

  useEffect(() => {
    window.localStorage.setItem('sgcs_documents', JSON.stringify(documents));
  }, [documents]);

  const [theme, setTheme] = useState(() => getSavedData('sgcs_theme', 'dark'));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('sgcs_theme', JSON.stringify(theme));
  }, [theme]);

  const addIncident = async (incident) => {
    const newIncident = {
      ...incident,
      id: `INC-${String(incidents.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString(),
      logs: [{ id: uuidv4(), action: 'Incidente Reportado', user: 'CISO', date: new Date().toISOString() }]
    };
    
    setIncidents([newIncident, ...incidents]);
    
    try {
      await fetch(`${API_BASE}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIncident)
      });
    } catch {}
  };

  const addIncidentLog = async (id, action, user) => {
    setIncidents(incidents.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          logs: [...inc.logs, { id: uuidv4(), action, user, date: new Date().toISOString() }]
        };
      }
      return inc;
    }));

    try {
      await fetch(`${API_BASE}/incidents/${id}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, user })
      });
    } catch {}
  };

  const updateIncidentStatus = async (id, newStatus, user = 'Sistema') => {
    const action = `Estado cambiado a: ${newStatus}`;
    setIncidents(incidents.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          status: newStatus,
          logs: [...inc.logs, { id: uuidv4(), action, user, date: new Date().toISOString() }]
        };
      }
      return inc;
    }));

    try {
      await fetch(`${API_BASE}/incidents/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, action, user })
      });
    } catch {}
  };

  const updateControlState = async (id, newState) => {
    setControls(controls.map(ctrl => 
      ctrl.id === id ? { ...ctrl, state: newState } : ctrl
    ));

    try {
      await fetch(`${API_BASE}/controls/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: newState })
      });
    } catch {}
  };

  const linkDocumentToControl = async (docId, controlId) => {
    setDocuments(documents.map(doc => 
      doc.id === docId ? { ...doc, linkedControl: controlId } : doc
    ));
    // When a document is linked, we automatically move the control to 'En progreso' or 'Auditado'
    updateControlState(controlId, 'Auditado');
  };

  // vCISO Intelligent Advisor Logic
  const getAdvisorRecommendations = () => {
    const recs = [];
    const highRisks = risks.filter(r => (r.impact * r.probability) >= 15);
    const activeIncs = incidents.filter(i => i.status !== 'Cerrado');
    
    if (highRisks.length > 0) {
      recs.push({
        type: 'risk',
        priority: 'Crítica',
        message: `Se detectaron ${highRisks.length} riesgos críticos (Rojo). Priorice la implementación de controles de segregación (A.5.3) y cifrado.`
      });
    }

    if (activeIncs.some(i => i.severity === 'high' || i.severity === 'critical')) {
      recs.push({
        type: 'incident',
        priority: 'Urgente',
        message: 'Existen incidentes de alta severidad activos. Se recomienda revisar el Plan de Respuesta a Incidentes (Fase 4 del Roadmap).'
      });
    }

    const techGap = controls.filter(c => c.norm === 'ISO 27001' && c.id.startsWith('A.8') && c.state === 'No iniciado');
    if (techGap.length > 5) {
      recs.push({
        type: 'gap',
        priority: 'Media',
        message: `Brecha Tecnológica: Tienes ${techGap.length} controles técnicos sin iniciar. El riesgo de fuga de datos es elevado.`
      });
    }

    return recs;
  };

  const addRisk = async (risk) => {
    const newRisk = {
      ...risk,
      id: `RSK-${String(risks.length + 1).padStart(3, '0')}`,
    };
    setRisks([newRisk, ...risks]);

    try {
      await fetch(`${API_BASE}/risks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRisk)
      });
    } catch {}
  };

  const addDocument = async (doc) => {
    const newDoc = {
      ...doc,
      id: documents.length + 1,
      date: new Date().toISOString().split('T')[0],
    };
    setDocuments([newDoc, ...documents]);

    try {
      await fetch(`${API_BASE}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc)
      });
    } catch {}
  };

  const value = {
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
    toggleTheme: () => setTheme(t => t === 'dark' ? 'light' : 'dark'),
    company,
    setCompany
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
