import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, CheckSquare, Activity, ShieldAlert, Clock, ArrowRight, BrainCircuit, TrendingDown, DollarSign, Target, Zap } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function Dashboard() {
  const { compliance, incidents, company, controls, risks } = useAppContext();
  const navigate = useNavigate();

  const activeIncidents = incidents.filter(i => i.status !== 'Cerrado').length;
  const auditedControls = controls.filter(c => c.state === 'Auditado').length;
  const totalControls = controls.length;
  const percentAudited = totalControls ? Math.round((auditedControls / totalControls) * 100) : 0;
  
  const criticalRisksCount = (risks || []).filter(r => (r.impact * r.probability) >= 20).length;
  const estimatedFineUF = criticalRisksCount * 5000;
  
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
    { name: 'Mar', iso: compliance.iso27001, nist: compliance.nist },
  ];

  return (
    <div className="animate-fade-in stagger-1">
      <div className="page-header">
        <div>
          <h1 className="page-title text-4xl font-black mb-1">Centro de Mando GRC</h1>
          <p className="page-subtitle flex items-center gap-2">
            <Target className="w-4 h-4 text-[var(--brand-primary)]" />
            Estado actual de la Postura de Seguridad: {company?.name || 'Cargando...'}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline" onClick={() => navigate('/reports')}>
            Auditar SoA
          </button>
          <button className="btn btn-primary" onClick={() => window.print()}>
            Reporte Ejecutivo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Madurez ISO 27001</span>
              <div className="kpi-icon"><ShieldCheck className="text-[var(--brand-success)]" /></div>
            </div>
            <div className="kpi-value" style={{color: getComplianceColor(compliance.iso27001)}}>{compliance.iso27001}%</div>
            <div className="progress-bg h-1"><div className="progress-fill shadow-glow-sm" style={{width: `${compliance.iso27001}%`, background: getComplianceColor(compliance.iso27001)}}></div></div>
          </div>
          
          <div className="card kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Marcos NIST CSF</span>
              <div className="kpi-icon"><Activity className="text-[var(--brand-info)]" /></div>
            </div>
            <div className="kpi-value" style={{color: getComplianceColor(compliance.nist)}}>{compliance.nist}%</div>
            <div className="progress-bg h-1"><div className="progress-fill shadow-glow-sm" style={{width: `${compliance.nist}%`, background: getComplianceColor(compliance.nist)}}></div></div>
          </div>

          <div className="card kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Brechas Legales Activas</span>
              <div className="kpi-icon text-[var(--brand-danger)]"><AlertTriangle /></div>
            </div>
            <div className="kpi-value text-[var(--brand-danger)]">{activeIncidents}</div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">Ley 21.459 / 19.628</div>
          </div>

          <div className="card kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Mitigación Proyectada</span>
              <div className="kpi-icon text-[var(--brand-primary)]"><Zap /></div>
            </div>
            <div className="kpi-value text-[var(--brand-primary)]">{percentAudited}%</div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">Controles con Evidencia</div>
          </div>
        </div>

        <div className="card border-[rgba(59,130,246,0.3)] bg-gradient-to-br from-[rgba(59,130,246,0.1)] to-transparent flex flex-col justify-between">
           <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)] mb-4">Estado de Auditoría</h3>
              <div className="flex items-center gap-4 mb-6">
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
                    <div className="text-[10px] text-[var(--text-muted)] uppercase font-medium">Controles Auditados</div>
                 </div>
              </div>
           </div>
           <button onClick={() => navigate('/compliance')} className="btn btn-primary w-full text-xs py-2">
              Ver Mapa de Controles
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
             <TrendingDown className="text-[var(--brand-primary)]" />
             Evolución Histórica del Cumplimiento
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="iso" stroke="var(--brand-primary)" strokeWidth={4} dot={{r: 5, fill: 'var(--brand-primary)'}} activeDot={{r: 8}} name="ISO 27001" />
                <Line type="monotone" dataKey="nist" stroke="var(--brand-secondary)" strokeWidth={4} dot={{r: 5, fill: 'var(--brand-secondary)'}} activeDot={{r: 8}} name="NIST CSF" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
             <CheckSquare className="text-[var(--brand-primary)]" />
             Vigilancia Tecnológica y GRC
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
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
          <div className="flex justify-center gap-6 mt-4">
             {pieData.map(d => (
               <div key={d.name} className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                 <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">{d.name}: {d.value}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
