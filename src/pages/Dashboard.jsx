import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, CheckSquare, Activity, LayoutDashboard, ShieldAlert, Clock, ArrowRight, BrainCircuit, TrendingDown, DollarSign } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function Dashboard() {
  const { compliance, incidents, company, controls, getAdvisorRecommendations, risks } = useAppContext();
  const navigate = useNavigate();

  const activeIncidents = incidents.filter(i => i.status !== 'Cerrado').length;
  const auditedControls = controls.filter(c => c.state === 'Auditado').length;
  const totalControls = controls.length;
  const percentAudited = totalControls ? Math.round((auditedControls / totalControls) * 100) : 0;
  
  const recommendations = getAdvisorRecommendations();

  // vCISO Financial Impact Logic (Estimation in UF for Chile)
  const criticalRisksCount = risks.filter(r => (r.impact * r.probability) >= 20).length;
  const estimatedFineUF = criticalRisksCount * 5000; // Sample fine value for data protection breaches
  
  const getComplianceColor = (val) => {
    if(val >= 80) return 'var(--brand-success)';
    if(val >= 50) return 'var(--brand-warning)';
    return 'var(--brand-danger)';
  };

  const implementedCount = controls.filter(c => c.state === 'Implementado' || c.state === 'Auditado').length;
  const inProgressCount = controls.filter(c => c.state === 'En progreso').length;
  const notStartedCount = controls.filter(c => c.state === 'No iniciado').length;

  const pieData = [
    { name: 'Implementado', value: implementedCount, color: 'var(--brand-success)' },
    { name: 'En Progreso', value: inProgressCount, color: 'var(--brand-warning)' },
    { name: 'No Iniciado', value: notStartedCount, color: 'var(--bg-tertiary)' },
  ].filter(d => d.value > 0);

  const trendData = [
    { name: 'Ene', iso: 20, nist: 30 },
    { name: 'Feb', iso: 35, nist: 45 },
    { name: 'Mar', iso: 45, nist: 60 },
  ];

  return (
    <div className="animate-fade-in stagger-1">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Ejecutivo</h1>
          <p className="page-subtitle">
            Visión general del Sistema de Gestión de Ciberseguridad
            {company.name && <span> para <strong className="text-[var(--text-primary)]">{company.name}</strong></span>}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => window.location.href = '#/reports'}>Descargar Reporte</button>
      </div>

      {!company.configured && (
        <div className="card mb-8 p-6 bg-[rgba(16,185,129,0.05)] border-2 border-[var(--brand-primary)] flex flex-col sm:flex-row justify-between items-center gap-4 shadow-glow">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">👋 ¡Bienvenido al VCISO!</h2>
            <p className="text-[var(--text-secondary)] text-sm">Para comenzar el Análisis de Brechas y ver sus métricas consolidadas, primero inicie su <strong>onboarding</strong> registrando la empresa y el alcance del SGSI.</p>
          </div>
          <button className="btn btn-primary min-w-[200px]" onClick={() => navigate('/settings')}>
            Comenzar Configuración
          </button>
        </div>
      )}

      <div className="grid-4 mb-32">
        <div className="card kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Cumplimiento ISO 27001</span>
            <div className="kpi-icon"><ShieldCheck /></div>
          </div>
          <div className="kpi-value" style={{color: getComplianceColor(compliance.iso27001)}}>{compliance.iso27001}%</div>
          <div className="progress-bg"><div className="progress-fill" style={{width: `${compliance.iso27001}%`, background: getComplianceColor(compliance.iso27001)}}></div></div>
        </div>
        
        <div className="card kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Cumplimiento NIST CSF</span>
            <div className="kpi-icon"><Activity /></div>
          </div>
          <div className="kpi-value" style={{color: getComplianceColor(compliance.nist)}}>{compliance.nist}%</div>
          <div className="progress-bg"><div className="progress-fill" style={{width: `${compliance.nist}%`, background: getComplianceColor(compliance.nist)}}></div></div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Incidentes Activos</span>
            <div className="kpi-icon" style={{color: 'var(--brand-danger)', backgroundColor: 'rgba(239, 68, 68, 0.1)'}}><AlertTriangle /></div>
          </div>
          <div className="kpi-value">{activeIncidents}</div>
          <div className="kpi-trend trend-down">Atención requerida según Ley 21.459</div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Exposición al Riesgo (Est.)</span>
            <div className="kpi-icon text-[var(--brand-danger)]"><DollarSign /></div>
          </div>
          <div className="kpi-value text-[var(--brand-danger)]">{estimatedFineUF.toLocaleString()} UF</div>
          <div className="kpi-trend trend-down">Multa Potencial Ley 19.628</div>
        </div>
      </div>

      {/* vCISO Intelligent Advisor Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit className="w-6 h-6 text-[var(--brand-primary)]" />
          <h2 className="text-xl font-bold uppercase tracking-tight">vCISO Intelligent Advisor</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.length > 0 ? recommendations.map((rec, idx) => (
            <div key={idx} className={`card border-l-4 ${
              rec.priority === 'Crítica' ? 'border-l-[var(--brand-danger)]' : 
              rec.priority === 'Urgente' ? 'border-l-[var(--brand-warning)]' : 
              'border-l-[var(--brand-primary)]'
            } bg-gradient-to-r from-[rgba(59,130,246,0.05)] to-transparent`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                  rec.priority === 'Crítica' ? 'bg-[var(--brand-danger)] text-white' : 
                  rec.priority === 'Urgente' ? 'bg-[var(--brand-warning)] text-white' : 
                  'bg-[var(--brand-primary)] text-white'
                }`}>
                  {rec.priority}
                </span>
                <TrendingDown className="w-4 h-4 opacity-30" />
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)] leading-tight">{rec.message}</p>
              <button 
                onClick={() => navigate('/roadmap')}
                className="mt-4 text-xs font-bold text-[var(--brand-primary)] flex items-center gap-1 hover:underline"
              >
                Ejecutar Acción <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )) : (
            <div className="col-span-3 card p-8 text-center bg-transparent border-dashed border-2">
              <p className="text-[var(--text-muted)]">No se detectan alertas críticas. La postura de seguridad es estable.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="mb-4 text-lg">Estado de Implementación de Controles</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="mb-4 text-lg">Evolución del SGSI</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} />
                <Line type="monotone" dataKey="iso" stroke="var(--brand-primary)" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name="ISO 27001" />
                <Line type="monotone" dataKey="nist" stroke="var(--brand-secondary)" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name="NIST CSF 2.0" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
