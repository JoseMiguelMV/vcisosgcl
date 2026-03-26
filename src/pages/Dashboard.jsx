import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, CheckSquare, Activity, ShieldAlert, ArrowRight, TrendingDown, Target, Zap, Sparkles, Settings, BookOpen, AlertCircle, X, ChevronRight, LayoutGrid, Layers, Gauge, AlertOctagon } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

function Dashboard() {
  const { compliance, incidents, company, controls, risks, user } = useAppContext();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dismissedOnboarding, setDismissedOnboarding] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('onboarding_dismissed');
    if (!dismissed && controls.length > 0 && controls.filter(c => c.state === 'Implementado' || c.state === 'Auditado').length === 0) {
      setShowOnboarding(true);
    }
  }, [controls]);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    setDismissedOnboarding(true);
    localStorage.setItem('onboarding_dismissed', 'true');
  };

  const activeIncidents = incidents.filter(i => i.status !== 'Cerrado').length;
  const auditedControls = controls.filter(c => c.state === 'Auditado').length;
  const totalControls = controls.length;
  const percentAudited = totalControls ? Math.round((auditedControls / totalControls) * 100) : 0;
  
  const criticalRisksCount = (risks || []).filter(r => (r.impact * r.probability) >= 20).length;
  
  const getComplianceColor = (val) => {
    if(val >= 80) return 'var(--brand-success)';
    if(val >= 50) return 'var(--brand-warning)';
    return 'var(--brand-danger)';
  };

  const implementedCount = controls.filter(c => c.state === 'Implementado' || c.state === 'Auditado').length;
  const inProgressCount = controls.filter(c => c.state === 'En progreso').length;
  const notStartedCount = controls.filter(c => !c.state || c.state === 'No iniciado' || c.state === 'No implementado').length;

  const pieData = totalControls > 0 ? [
    { name: 'Implementado', value: implementedCount, color: 'var(--brand-success)' },
    { name: 'En Progreso', value: inProgressCount, color: 'var(--brand-warning)' },
    { name: 'Sin Iniciar', value: notStartedCount, color: 'var(--bg-tertiary)' },
  ] : [];

  const trendData = [
    { name: 'Inicio', iso: 0, nist: 0 },
    { name: 'Ahora', iso: compliance.iso27001, nist: compliance.nist },
  ];

  const isNewUser = totalControls > 0 && implementedCount === 0;

  const isoControls = controls.filter(c => c.norm === 'ISO 27001');
  const nistControls = controls.filter(c => c.norm === 'NIST CSF');
  
  const isoImplemented = isoControls.filter(c => c.state === 'Implementado' || c.state === 'Auditado').length;
  const nistImplemented = nistControls.filter(c => c.state === 'Implementado' || c.state === 'Auditado').length;
  
  const isoInProgress = isoControls.filter(c => c.state === 'En progreso').length;
  const nistInProgress = nistControls.filter(c => c.state === 'En progreso').length;
  
  const isoNotStarted = isoControls.filter(c => !c.state || c.state === 'No iniciado' || c.state === 'No implementado').length;
  const nistNotStarted = nistControls.filter(c => !c.state || c.state === 'No iniciado' || c.state === 'No implementado').length;

  const categoryStats = useMemo(() => {
    const categories = {};
    controls.forEach(c => {
      const cat = c.id.split('.')[0];
      if (!categories[cat]) {
        categories[cat] = { total: 0, implemented: 0, inProgress: 0, notStarted: 0 };
      }
      categories[cat].total++;
      if (c.state === 'Implementado' || c.state === 'Auditado') categories[cat].implemented++;
      else if (c.state === 'En progreso') categories[cat].inProgress++;
      else categories[cat].notStarted++;
    });
    return Object.entries(categories).map(([name, data]) => ({
      name,
      pct: data.total > 0 ? Math.round((data.implemented / data.total) * 100) : 0,
      implemented: data.implemented,
      total: data.total
    })).sort((a, b) => b.pct - a.pct);
  }, [controls]);

  const nonCompliantItems = controls.filter(c => 
    c.state === 'No iniciado' || c.state === 'No implementado'
  ).slice(0, 5);

  const radarData = useMemo(() => {
    const categories = ['A.5', 'A.6', 'A.7', 'A.8', 'GV', 'ID', 'PR', 'DE', 'RS', 'RC'];
    return categories.map(cat => {
      const catControls = controls.filter(c => c.id.startsWith(cat));
      const total = catControls.length;
      const done = catControls.filter(c => c.state === 'Implementado' || c.state === 'Auditado').length;
      return {
        category: cat,
        value: total > 0 ? Math.round((done / total) * 100) : 0
      };
    });
  }, [controls]);

  return (
    <div className="animate-fade-in stagger-1">
      {showOnboarding && !dismissedOnboarding && (
        <div className="card p-6 mb-8 bg-gradient-to-r from-[var(--brand-primary)]/10 to-transparent border-[var(--brand-primary)]/30 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[var(--brand-primary)]/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-[var(--brand-primary)]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">¡Bienvenido, {user?.name?.split(' ')[0]}!</h3>
                <button onClick={dismissOnboarding} className="text-[var(--text-muted)] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[var(--text-secondary)] mb-4">
                Tu empresa está lista con {isoControls.length} controles ISO 27001 y {nistControls.length} NIST CSF 2.0. Comienza a evaluar tu cumplimiento.
              </p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => { dismissOnboarding(); navigate('/compliance'); }} className="btn btn-primary text-sm">
                  Evaluar Controles <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <button onClick={() => { dismissOnboarding(); navigate('/settings'); }} className="btn btn-outline text-sm">
                  <Settings className="w-4 h-4 mr-1" /> Completar Datos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title text-4xl font-black mb-1">Centro de Mando</h1>
          <p className="page-subtitle flex items-center gap-2">
            <Target className="w-4 h-4 text-[var(--brand-primary)]" />
            {company?.name || 'Cargando...'} — Postura de Seguridad
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline" onClick={() => navigate('/reports')}>
            Statement of Applicability
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/compliance')}>
            Evaluar Controles
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Madurez ISO 27001</span>
              <div className="kpi-icon"><ShieldCheck className="text-[var(--brand-success)]" /></div>
            </div>
            <div className="kpi-value" style={{color: getComplianceColor(compliance.iso27001)}}>{compliance.iso27001}%</div>
            <div className="progress-bg h-1"><div className="progress-fill shadow-glow-sm" style={{width: `${compliance.iso27001}%`, background: getComplianceColor(compliance.iso27001)}}></div></div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1">{isoImplemented}/{isoControls.length} implementados</div>
          </div>
          
          <div className="card kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">NIST CSF 2.0</span>
              <div className="kpi-icon"><Activity className="text-[var(--brand-info)]" /></div>
            </div>
            <div className="kpi-value" style={{color: getComplianceColor(compliance.nist)}}>{compliance.nist}%</div>
            <div className="progress-bg h-1"><div className="progress-fill shadow-glow-sm" style={{width: `${compliance.nist}%`, background: getComplianceColor(compliance.nist)}}></div></div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1">{nistImplemented}/{nistControls.length} implementados</div>
          </div>

          <div className="card kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Incidentes Activos</span>
              <div className="kpi-icon text-[var(--brand-danger)]"><AlertTriangle /></div>
            </div>
            <div className="kpi-value text-[var(--brand-danger)]">{activeIncidents}</div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">
              {activeIncidents === 0 ? 'Sin incidentes' : 'Requieren atención'}
            </div>
          </div>

          <div className="card kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Mitigación</span>
              <div className="kpi-icon text-[var(--brand-primary)]"><Zap /></div>
            </div>
            <div className="kpi-value text-[var(--brand-primary)]">{percentAudited}%</div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">
              {auditedControls}/{totalControls} auditados
            </div>
          </div>
        </div>

        <div className="card border-[rgba(59,130,246,0.3)] bg-gradient-to-br from-[rgba(59,130,246,0.1)] to-transparent flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)] mb-4">Progreso de Auditoría</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="var(--bg-tertiary)" strokeWidth="4" fill="transparent" />
                  <circle cx="32" cy="32" r="28" stroke="var(--brand-primary)" strokeWidth="4" fill="transparent" 
                    strokeDasharray={`${2 * Math.PI * 28}`} 
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - percentAudited/100)}`} 
                    strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{percentAudited}%</span>
              </div>
              <div>
                <div className="text-lg font-bold leading-none">{auditedControls} / {totalControls}</div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase font-medium">Controles</div>
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/compliance')} className="btn btn-primary w-full text-xs py-2">
            Evaluar Controles <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Layers className="text-[var(--brand-primary)]" />
            ISO 27001 vs NIST CSF 2.0
          </h3>
          {totalControls === 0 ? (
            <div className="flex flex-col items-center justify-center h-[280px] text-center">
              <div className="p-4 bg-[var(--brand-primary)]/10 rounded-full mb-4">
                <ShieldCheck className="w-12 h-12 text-[var(--brand-primary)] opacity-50" />
              </div>
              <p className="text-[var(--text-muted)]">Cargando controles...</p>
            </div>
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={[
                  { name: 'ISO 27001', Implementado: isoImplemented, 'En Progreso': isoInProgress, 'Sin Iniciar': isoNotStarted },
                  { name: 'NIST CSF 2.0', Implementado: nistImplemented, 'En Progreso': nistInProgress, 'Sin Iniciar': nistNotStarted }
                ]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Bar dataKey="Implementado" stackId="a" fill="var(--brand-success)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="En Progreso" stackId="a" fill="var(--brand-warning)" />
                  <Bar dataKey="Sin Iniciar" stackId="a" fill="var(--bg-tertiary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Gauge className="text-[var(--brand-primary)]" />
            Madurez por Categoría
          </h3>
          {totalControls === 0 ? (
            <div className="flex flex-col items-center justify-center h-[280px] text-center">
              <div className="p-4 bg-[var(--brand-warning)]/10 rounded-full mb-4">
                <AlertCircle className="w-12 h-12 text-[var(--brand-warning)] opacity-50" />
              </div>
              <p className="text-[var(--text-muted)]">Sincronizando controles...</p>
            </div>
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={categoryStats.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="var(--text-muted)" fontSize={12} unit="%" />
                  <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} width={60} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                    formatter={(value, name) => [`${value}%`, 'Cumplimiento']}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Bar dataKey="pct" fill="var(--brand-primary)" radius={[0, 4, 4, 0]} name="Cumplimiento" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CheckSquare className="text-[var(--brand-success)]" />
            Estado de Controles
          </h3>
          {totalControls === 0 ? (
            <div className="flex flex-col items-center justify-center h-[220px] text-center">
              <p className="text-[var(--text-muted)]">Cargando...</p>
            </div>
          ) : (
            <>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '12px' }} 
                      itemStyle={{ color: 'white' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                    <span className="text-xs uppercase font-bold text-[var(--text-muted)]">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertOctagon className="text-[var(--brand-danger)]" />
            Gaps y No Conformidades
          </h3>
          {nonCompliantItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[220px] text-center">
              <div className="p-4 bg-[var(--brand-success)]/10 rounded-full mb-4">
                <ShieldCheck className="w-10 h-10 text-[var(--brand-success)] opacity-70" />
              </div>
              <p className="text-[var(--text-muted)]">Sin no conformidades pendientes</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[220px] overflow-y-auto">
              {nonCompliantItems.map(c => (
                <div key={c.id} className="flex items-start gap-3 p-3 bg-[var(--bg-tertiary)]/50 rounded-lg border border-[var(--border-color)]">
                  <div className="p-1.5 bg-[var(--brand-danger)]/20 rounded">
                    <AlertTriangle className="w-4 h-4 text-[var(--brand-danger)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[var(--brand-primary)]">{c.id}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-[var(--bg-secondary)] rounded">{c.norm}</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] truncate">{c.name}</p>
                  </div>
                </div>
              ))}
              {controls.filter(c => c.state === 'No iniciado' || c.state === 'No implementado').length > 5 && (
                <button onClick={() => navigate('/compliance')} className="w-full text-center text-xs text-[var(--brand-primary)] hover:underline py-2">
                  Ver todos los {controls.filter(c => c.state === 'No iniciado' || c.state === 'No implementado').length} controles pendientes →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isNewUser && (
        <div className="mt-8 card p-8 text-center">
          <BookOpen className="w-12 h-12 text-[var(--brand-primary)] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">¿Por dónde empezar?</h3>
          <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">
            Comienza evaluando los controles más críticos para tu negocio. Te recomendamos revisar primero los controles de la categoría A.5 (Políticas de Seguridad).
          </p>
          <button onClick={() => navigate('/compliance')} className="btn btn-primary">
            Ir a Controles ISO 27001 <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
