import React, { useState } from 'react';
import { ShieldAlert, Info, Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

function Risks() {
  const { risks, addRisk, company } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [newRisk, setNewRisk] = useState({ title: '', impact: 3, probability: 3, plan: '', description: '' });
  const getMatrixColor = (prob, imp) => {
    const val = prob * imp;
    if (val >= 15) return 'var(--brand-danger)';
    if (val >= 8) return 'var(--brand-warning)';
    return 'var(--brand-success)';
  };

  const matrix = Array.from({length: 5}, (_, i) => 5 - i); // 5 to 1
  
  return (
    <div className="animate-fade-in stagger-4">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mapa de Riesgos (5x5)</h1>
          <p className="page-subtitle">Gestión de Riesgos de Ciberseguridad {company.name ? `para ${company.name}` : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2 inline" /> Nuevo Riesgo
        </button>
      </div>

      {showForm && (
        <div className="card mb-8 animate-fade-in border border-[var(--brand-primary)]">
          <h3 className="text-lg font-bold mb-4">Añadir Nuevo Riesgo</h3>
          <div className="grid-2">
             <div className="form-group col-span-2">
               <label className="form-label">Título del Riesgo</label>
               <input type="text" className="form-control" value={newRisk.title} onChange={e => setNewRisk({...newRisk, title: e.target.value})} placeholder="Ej. Falla en respaldo de AWS" />
             </div>
             <div className="form-group">
               <label className="form-label">Impacto (1-5)</label>
               <input type="number" min="1" max="5" className="form-control" value={newRisk.impact} onChange={e => setNewRisk({...newRisk, impact: parseInt(e.target.value)})} />
             </div>
             <div className="form-group">
               <label className="form-label">Probabilidad (1-5)</label>
               <input type="number" min="1" max="5" className="form-control" value={newRisk.probability} onChange={e => setNewRisk({...newRisk, probability: parseInt(e.target.value)})} />
             </div>
             <div className="form-group col-span-2">
               <label className="form-label">Descripción Detallada</label>
               <textarea className="form-control" value={newRisk.description} onChange={e => setNewRisk({...newRisk, description: e.target.value})}></textarea>
             </div>
             <div className="form-group col-span-2">
               <label className="form-label">Plan de Tratamiento / Control ISO relacionado</label>
               <input type="text" className="form-control" value={newRisk.plan} onChange={e => setNewRisk({...newRisk, plan: e.target.value})} />
             </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
             <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancelar</button>
             <button className="btn btn-primary" onClick={() => {
               if(newRisk.title) {
                 addRisk(newRisk);
                 setShowForm(false);
                 setNewRisk({ title: '', impact: 3, probability: 3, plan: '', description: '' });
               }
             }}>Guardar Riesgo</button>
          </div>
        </div>
      )}

      <div className="grid-2">
        <div className="card h-full flex flex-col items-center justify-center p-8">
           <h3 className="text-lg font-bold mb-6 text-[var(--text-secondary)]">Matriz de Probabilidad e Impacto</h3>
           <div className="flex relative">
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-[var(--text-muted)] tracking-widest uppercase text-xs font-bold text-center">Impacto (1-5)</div>
              
              <div className="grid grid-cols-5 gap-1">
                {matrix.map(rowImpact => (
                  matrix.map((colProb, colIdx) => {
                     // Check how many risks land on this exact cell (Impact, Probability)
                     const probValue = colIdx + 1;
                     const cellRisks = risks.filter(r => r.impact === rowImpact && r.probability === probValue);
                     const hasRisks = cellRisks.length > 0;
                     
                     return (
                       <div key={`${rowImpact}-${probValue}`} 
                            style={{ backgroundColor: getMatrixColor(probValue, rowImpact), opacity: hasRisks ? 1 : 0.6 }}
                            className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center border border-[var(--bg-primary)] rounded-md cursor-pointer hover:opacity-100 hover:scale-110 transition-transform relative">
                         {hasRisks && (
                           <div className="absolute inset-0 m-auto w-6 h-6 bg-[var(--bg-primary)] rounded-full border-2 border-[var(--text-primary)] flex items-center justify-center font-bold text-xs shadow-lg">
                             {cellRisks.length}
                           </div>
                         )}
                       </div>
                     );
                  })
                ))}
              </div>
           </div>
           <div className="mt-4 text-[var(--text-muted)] tracking-widest uppercase text-xs font-bold text-center">Probabilidad (1-5)</div>
        </div>

        <div className="card flex flex-col gap-4 max-h-[600px] overflow-y-auto">
          <h3 className="text-xl font-bold border-b pb-4 mb-2" style={{ borderColor: 'var(--border-color)' }}>Top Riesgos Identificados</h3>
          
          {risks.sort((a,b) => (b.impact * b.probability) - (a.impact * a.probability)).map((risk, index) => {
            const val = risk.impact * risk.probability;
            let badgeClass = 'badge-success';
            let label = 'Bajo';
            if(val >= 15) { badgeClass = 'badge-danger'; label = 'Extremo'; }
            else if(val >= 8) { badgeClass = 'badge-warning'; label = 'Medio/Alto'; }

            return (
              <div key={risk.id} className="p-4 rounded-md border-l-4" style={{ borderColor: badgeClass === 'badge-danger' ? 'var(--brand-danger)' : badgeClass === 'badge-warning' ? 'var(--brand-warning)' : 'var(--brand-success)', backgroundColor: 'var(--bg-tertiary)' }}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold">{index + 1}. {risk.title}</h4>
                  <span className={`badge ${badgeClass}`}>{label} ({val})</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-2">{risk.description}</p>
                <div className="text-xs text-[var(--brand-primary)] flex items-center gap-1"><Info className="w-3 h-3"/> Plan: {risk.plan}</div>
              </div>
            );
          })}

          {risks.length === 0 && <p className="text-sm text-[var(--text-muted)] italic">No hay riesgos identificados.</p>}
        </div>
      </div>
    </div>
  );
}

export default Risks;
