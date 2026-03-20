import React from 'react';
import { Map, Flag, CheckCircle, Building, PlayCircle, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

function Roadmap() {
  const { company, compliance, risks, controls } = useAppContext();
  const navigate = useNavigate();

  // Dynamic calculations for Roadmap Phases
  const phase1Progress = company.configured ? 100 : 0;
  
  const phase2Progress = Math.min(100, (risks.length / 5) * 100); // Ex: 5 risks to complete phase 2
  
  const phase3Progress = compliance.iso27001 || 0;
  
  const totalControls = controls.length;
  const auditedControls = controls.filter(c => c.state === 'Auditado').length;
  const phase4Progress = totalControls > 0 ? Math.round((auditedControls / totalControls) * 100) : 0;

  const totalGlobalProgress = Math.round((phase1Progress + phase2Progress + phase3Progress + phase4Progress) / 4);

  const getStatus = (progress) => {
    if (progress === 100) return 'completed';
    if (progress > 0) return 'in-progress';
    return 'pending';
  };

  const phases = [
    {
      id: 1, title: 'Fase 1: Preparación y Alcance', status: getStatus(phase1Progress), progress: phase1Progress, 
      desc: 'Definición del alcance del SGSI, partes interesadas y primer gap analysis.',
      tasks: ['Configurar Nombre y RUT', 'Designar Responsable Legal', 'Fijar Alcance ISO 27001'],
      action: { label: 'Revisar Alcance', link: '/settings' }
    },
    {
      id: 2, title: 'Fase 2: Diagnóstico y Riesgos', status: getStatus(phase2Progress), progress: Math.round(phase2Progress),
      desc: 'Evaluación de riesgos (5x5). Integración con ISO 27005 y NIST CSF.',
      tasks: ['Crear Matriz de Riesgos', 'Identificar Top 5 Amenazas', 'Generar PTR (Plan Tratamiento)'],
      action: { label: 'Ir a Mapa de Riesgos', link: '/risks' }
    },
    {
      id: 3, title: 'Fase 3: Controles Normativos', status: getStatus(phase3Progress), progress: phase3Progress,
      desc: 'Implementación de controles Anexo A, Ley 21.459 y Protección de Datos.',
      tasks: ['Auditar Controles Organizacionales', 'Auditar Ciberseguridad Física', 'Cumplir Privacidad (PDP)'],
      action: { label: 'Ir a Compliance', link: '/compliance' }
    },
    {
      id: 4, title: 'Fase 4: Operación y Auditoría', status: getStatus(phase4Progress), progress: phase4Progress,
      desc: 'Revisión por la dirección y auditoría de estado. Incidentes y bitácora.',
      tasks: ['Marcar controles como "Auditado"', 'Revisión de Bitácora de Incidentes', 'Preparar Declaración SoA'],
      action: { label: 'Revisar SoA', link: '/compliance' }
    }
  ];

  return (
    <div className="animate-fade-in stagger-2">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mapa de Ruta SGSI</h1>
          <p className="page-subtitle">Roadmap para implementación ISO 27001 + Ley Chilena</p>
        </div>
        <button className="btn btn-outline bg-[var(--bg-secondary)]"><Flag className="w-5 h-5"/> Guía Inicial</button>
      </div>

      {!company.configured ? (
        <div className="card p-12 flex flex-col items-center justify-center text-center opacity-80 border-dashed border-2">
          <Building className="w-16 h-16 text-[var(--text-muted)] mb-4" />
          <h2 className="text-xl font-bold mb-2">Configure su Organización</h2>
          <p className="max-w-md text-[var(--text-secondary)] mb-6">Para generar el Roadmap de implementación personalizado, necesitamos conocer los datos base de su organización para el alcance del proyecto.</p>
          <button className="btn btn-primary" onClick={() => navigate('/settings')}>Ir a Configuración</button>
        </div>
      ) : (
      <>
        <div className="grid-2 mb-8">
          {phases.map(phase => (
          <div key={phase.id} className="card relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full" 
              style={{ backgroundColor: phase.status === 'completed' ? 'var(--brand-success)' : phase.status === 'in-progress' ? 'var(--brand-warning)' : 'var(--bg-tertiary)' }} 
            />
            <div className="pl-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{phase.title}</h3>
                <span className={`badge ${phase.status === 'completed' ? 'badge-success' : phase.status === 'in-progress' ? 'badge-warning' : 'badge-neutral'}`}>
                  {phase.progress}%
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-4">{phase.desc}</p>
              
              <div className="space-y-2 mt-4">
                {phase.tasks.map((t, idx) => (
                  <div key={idx} className="flex gap-2 items-center text-sm text-[var(--text-muted)]">
                    <CheckCircle className="w-4 h-4" style={{ color: phase.status === 'completed' ? 'var(--brand-success)' : 'inherit' }} />
                    {t}
                  </div>
                ))}
              </div>
            </div>
            {phase.status !== 'completed' && (
              <div className="mt-6">
                <button className={`btn w-full shadow-lg ${phase.status === 'in-progress' ? 'btn-primary' : 'btn-outline border-[var(--brand-primary)] text-[var(--brand-primary)]'}`} onClick={() => navigate(phase.action.link)}>
                  {phase.status === 'in-progress' ? <PlayCircle className="w-4 h-4 mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                  {phase.action.label}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="card kpi-card">
         <h3 className="mb-2 uppercase text-xs font-bold text-[var(--text-muted)] tracking-wider">Avance Global del Proyecto</h3>
         <div className="progress-bg h-4"><div className="progress-fill" style={{width: `${totalGlobalProgress}%`}}></div></div>
          <p className="text-right text-xs mt-2 text-[var(--text-secondary)] font-mono">{totalGlobalProgress}% Completado realmente.</p>
        </div>
      </>
      )}
    </div>
  );
}

export default Roadmap;
