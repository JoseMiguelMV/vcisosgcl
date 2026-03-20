import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { AlertCircle, FileText, Send } from 'lucide-react';

function IncidentForm() {
  const { addIncident } = useAppContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
    involvesPDP: false,
    involvesHealth: false,
    status: 'Nuevo'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    let legalCountdown = null;
    if (formData.involvesPDP) legalCountdown = 72;
    if (formData.involvesHealth) legalCountdown = 24;

    addIncident({
      ...formData,
      legalCountdown
    });
    navigate('/incidents');
  };

  return (
    <div className="animate-fade-in stagger-3">
      <div className="page-header">
        <div>
          <h1 className="page-title">Registrar Nuevo Incidente</h1>
          <p className="page-subtitle">Clasificado según ISO 27001 y Ley 21.459</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/incidents')}>Volver</button>
      </div>

      <div className="card max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Título del Incidente</label>
            <input required type="text" className="form-control" placeholder="Ej. Acceso no autorizado a base de datos" 
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción Detallada (Bitácora Inicial)</label>
            <textarea required className="form-control" placeholder="Describa el vector de ataque inicial, sistemas afectados..." 
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Gravedad (NIST CSF)</label>
              <select className="form-control" value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}>
                <option value="low">Baja (Sin impacto operativo)</option>
                <option value="medium">Media (Impacto manejable)</option>
                <option value="high">Alta (Interrupción de servicio / Crítico)</option>
                <option value="critical">Crítica (Riesgo legal/vital)</option>
              </select>
            </div>
            
            <div className="form-group p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)'}}>
              <label className="form-label mb-2 text-[var(--brand-danger)] flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Obligaciones Legales
              </label>
              <label className="flex items-center gap-3 mb-2 cursor-pointer text-sm">
                <input type="checkbox" checked={formData.involvesPDP} onChange={e => setFormData({...formData, involvesPDP: e.target.checked})} />
                Involucra Datos Personales (Ley 19.628 - Notificar a autoridad en 72hrs)
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-sm">
                <input type="checkbox" checked={formData.involvesHealth} onChange={e => setFormData({...formData, involvesHealth: e.target.checked})} />
                Involucra Datos Paciente (Salud - Plazo Estricto)
              </label>
            </div>
          </div>

          <div className="form-group mt-6 flex justify-end gap-4 border-t pt-6" style={{ borderColor: 'var(--border-color)' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/incidents')}>Cancelar</button>
            <button type="submit" className="btn btn-danger">
              <Send className="w-5 h-5" />
              Escar y Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IncidentForm;
