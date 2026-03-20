import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ShieldAlert, FileText, Send, CheckCircle, Clock, Lock, ArrowRight } from 'lucide-react';

function IncidentDetail() {
  const { id } = useParams();
  const { incidents, addIncidentLog, updateIncidentStatus } = useAppContext();
  const navigate = useNavigate();
  const [newLog, setNewLog] = useState('');
  
  const WORKFLOW_STATES = ['Reportado', 'En Contención', 'Análisis Causa Raíz', 'Aprobado por Legal', 'Cerrado'];

  const incident = incidents.find(i => i.id === id);

  if (!incident) return <div className="p-8">Incidente no encontrado</div>;

  const handleAddLog = (e) => {
    e.preventDefault();
    if (newLog.trim()) {
      addIncidentLog(id, newLog, 'CISO');
      setNewLog('');
    }
  };

  return (
    <div className="animate-fade-in stagger-4">
      <div className="page-header">
        <div>
          <h1 className="page-title">{incident.title}</h1>
          <p className="page-subtitle">ID: {incident.id} | Gravedad: {incident.severity.toUpperCase()}</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/incidents')}>Volver</button>
      </div>

      <div className="grid-2">
        <div className="flex flex-col gap-6">
          <div className="card incident-header" style={{ borderColor: 'var(--brand-danger)' }}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold">Detalle Inicial</h3>
              <span className={`badge ${incident.status === 'Cerrado' ? 'badge-success' : 'badge-warning'}`}>{incident.status}</span>
            </div>
            
            <p className="text-[var(--text-secondary)]">{incident.description}</p>
            
            <div className="mt-4 flex gap-4 text-sm text-[var(--text-muted)]">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {new Date(incident.date).toLocaleString()}</span>
            </div>

            <div className="mt-6 border-t pt-4" style={{ borderColor: 'var(--border-color)'}}>
              <h4 className="text-sm font-bold mb-3 uppercase tracking-wider text-[var(--text-muted)]">Workflow de Aprobación</h4>
              <div className="flex flex-wrap gap-2">
                {WORKFLOW_STATES.map((state, idx) => {
                  const currentIndex = WORKFLOW_STATES.indexOf(incident.status) !== -1 ? WORKFLOW_STATES.indexOf(incident.status) : 0;
                  const isCompleted = idx <= currentIndex;
                  const isActive = idx === currentIndex;
                  
                  return (
                    <div key={state} className="flex items-center gap-2">
                       <button 
                         onClick={() => updateIncidentStatus(id, state, 'CISO')}
                         disabled={idx < currentIndex}
                         className={`btn btn-sm ${isActive ? 'btn-primary' : isCompleted ? 'btn-outline bg-[var(--brand-success)] text-white border-[var(--brand-success)]' : 'btn-outline text-[var(--text-muted)]'}`}
                       >
                         {isCompleted && !isActive && <CheckCircle className="w-3 h-3 mr-1 inline" />}
                         {state}
                       </button>
                       {idx < WORKFLOW_STATES.length - 1 && <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {incident.legalCountdown && (
              <div className="mt-6 p-4 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]">
                <h4 className="font-bold text-[var(--brand-danger)] flex items-center gap-2 uppercase text-sm">
                  <ShieldAlert className="w-4 h-4" /> Alerta de Plazo Legal Activo
                </h4>
                <p className="text-sm mt-2 text-[var(--text-primary)]">Quedan <strong className="timer-critical text-xl">{incident.legalCountdown} horas</strong> para notificar a la autoridad (Ley 19.628 / 21.459).</p>
                <div className="mt-4 flex gap-2">
                  <button className="btn btn-danger text-xs py-1 px-3">Notificar al Responsable Legal</button>
                  <button className="btn btn-outline text-xs py-1 px-3 border-[var(--brand-danger)] text-[var(--brand-danger)]">Exportar Reporte CMF/CSIRT</button>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-4 border-b pb-2" style={{ borderColor: 'var(--border-color)'}}>Actualizar Bitácora Inalterable</h3>
            <form onSubmit={handleAddLog} className="flex flex-col gap-4">
              <textarea 
                className="form-control" 
                placeholder="Describa la acción de contención, mitigación o recuperación. Las entradas en bitácora no pueden ser alteradas."
                value={newLog} onChange={e => setNewLog(e.target.value)} required
              />
              <div className="flex justify-between items-center">
                <label className="text-xs text-[var(--text-muted)] flex items-center gap-2 cursor-pointer">
                  <input type="file" className="hidden" />
                  <div className="btn btn-outline py-1 px-2 text-xs">Adjuntar Evidencia (PDF, PNG)</div>
                </label>
                <button type="submit" className="btn btn-primary">
                  <Send className="w-4 h-4" /> Agregar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card max-h-[80vh] overflow-y-auto">
          <div className="border-b pb-4 mb-6 sticky top-0 bg-[var(--bg-secondary)] z-10" style={{ borderColor: 'var(--border-color)'}}>
            <h3 className="text-lg font-bold flex items-center justify-between">
              Bitácora Inalterable (Timeline)
              <span className="badge badge-neutral text-[var(--brand-success)] bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] flex items-center gap-1">
                <Lock className="w-3 h-3" /> Hash Activo
              </span>
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">Cumplimiento ISO 27001 (A.8.16) y Ley 21.459</p>
          </div>
          
          <div className="timeline">
            {incident.logs.slice().reverse().map((log, idx) => {
              // Generate a mock SHA-256 visual hash for the blockchain feel
              const mockHash = btoa(log.id + log.action).substring(0, 16).toLowerCase();
              return (
              <div key={log.id} className="timeline-item animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className={`timeline-dot ${idx === 0 ? 'completed' : ''}`}></div>
                <div className="timeline-content">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-[var(--text-primary)]">{log.action}</span>
                    <span className="text-xs bg-[var(--bg-primary)] px-2 py-1 rounded-md border" style={{ borderColor: 'var(--border-color)'}}>{log.user}</span>
                  </div>
                  <div className="text-xs mt-2 p-2 bg-[var(--bg-primary)] rounded border border-[var(--border-color)] font-mono flex justify-between items-center text-[var(--text-muted)]">
                    <span>{new Date(log.date).toLocaleString()}</span>
                    <span className="flex items-center gap-1" title="Firma Inalterable (Simulada)"><Lock className="w-3 h-3 opacity-50"/> 0x{mockHash}</span>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncidentDetail;
