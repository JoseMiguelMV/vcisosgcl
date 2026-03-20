import React, { useState } from 'react';
import { CheckSquare, Search, FileText, Download, Building, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

function Compliance() {
  const { company, controls, updateControlState } = useAppContext();
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('Todos los Estados');

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allExpanded = controls.reduce((acc, ctrl) => ({ ...acc, [ctrl.id]: true }), {});
    setExpandedRows(allExpanded);
  };

  const collapseAll = () => {
    setExpandedRows({});
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'Implementado': return 'text-[var(--brand-success)] bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)]';
      case 'En progreso': return 'text-[var(--brand-warning)] bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)]';
      case 'Auditado': return 'text-[var(--brand-info)] bg-[rgba(59,130,246,0.1)] border-[rgba(59,130,246,0.2)]';
      default: return 'text-[var(--text-muted)] bg-[var(--bg-tertiary)] border-[var(--border-color)]';
    }
  };

  const getStateDotColor = (state) => {
    switch (state) {
      case 'Implementado': return 'var(--brand-success)';
      case 'En progreso': return 'var(--brand-warning)';
      case 'Auditado': return 'var(--brand-info)';
      default: return 'var(--text-muted)';
    }
  };

  const filteredControls = controls.filter(ctrl => {
    const matchesSearch = searchTerm === '' || 
      ctrl.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ctrl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ctrl.ley.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ctrl.description && ctrl.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterState === 'Todos los Estados' || ctrl.state === filterState;
    
    return matchesSearch && matchesFilter;
  });

  const anyExpanded = Object.values(expandedRows).some(v => v);

  return (
    <div className="animate-fade-in stagger-3">
      <div className="page-header">
        <div>
          <h1 className="page-title">Checklist de Controles Normativos</h1>
          <p className="page-subtitle">ISO 27001:2022 • NIST CSF 2.0 • Leyes Chilenas</p>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-outline" style={{ color: 'var(--brand-info)', borderColor: 'var(--brand-info)' }}>
             <Download className="w-5 h-5"/> SoA
          </button>
          <button className="btn btn-primary shadow-glow">
            <FileText className="w-5 h-5" /> 
            Generar SoA / Exportar Excel
          </button>
        </div>
      </div>

      {!company.configured ? (
        <div className="card p-12 flex flex-col items-center justify-center text-center opacity-80 border-dashed border-2">
          <Building className="w-16 h-16 text-[var(--text-muted)] mb-4" />
          <h2 className="text-xl font-bold mb-2">Completar Datos de la Organización</h2>
          <p className="max-w-md text-[var(--text-secondary)] mb-6">Para habilitar el checklist de cumplimiento ISO 27001 y las validaciones de las Leyes Chilenas, debe configurar primero su organización base y el responsable legal.</p>
          <button className="btn btn-primary" onClick={() => navigate('/settings')}>Ir a Configuración</button>
        </div>
      ) : (
        <>
          <div className="card mb-6 flex gap-4 bg-[var(--bg-secondary)] py-4 items-center flex-wrap">
            <div className="header-search flex-1 w-full max-w-lg">
              <Search className="search-icon" />
              <input 
                type="text" 
                placeholder="Buscar por código de control, nombre, ley o descripción..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="form-control max-w-[200px]"
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
            >
              <option>Todos los Estados</option>
              <option>No iniciado</option>
              <option>En progreso</option>
              <option>Implementado</option>
              <option>Auditado</option>
            </select>
            <button 
              className="btn btn-outline text-sm" 
              onClick={anyExpanded ? collapseAll : expandAll}
              style={{ color: 'var(--brand-primary)', borderColor: 'var(--brand-primary)', whiteSpace: 'nowrap' }}
            >
              <Info className="w-4 h-4" />
              {anyExpanded ? 'Ocultar Guías' : 'Ver Guías de Revisión'}
            </button>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {['No iniciado', 'En progreso', 'Implementado', 'Auditado'].map(state => {
              const count = filteredControls.filter(c => c.state === state).length;
              return (
                <div key={state} className="card py-3 px-4 flex items-center gap-3" style={{ borderLeft: `3px solid ${getStateDotColor(state)}` }}>
                  <div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{count}</div>
                    <div className="text-xs text-[var(--text-muted)]">{state}</div>
                  </div>
                </div>
              );
            })}
          </div>

      <div className="card table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="w-10"></th>
              <th className="w-24">Código</th>
              <th className="w-32">Norma</th>
              <th>Nombre del Control</th>
              <th>Vínculo Legal (Chile)</th>
              <th className="w-40">Estado</th>
              <th className="text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredControls.map(ctrl => (
              <React.Fragment key={ctrl.id}>
                <tr 
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleRow(ctrl.id)}
                >
                  <td className="text-center" style={{ width: '40px', padding: '0.5rem' }}>
                    {expandedRows[ctrl.id] ? (
                      <ChevronDown className="w-4 h-4 text-[var(--brand-primary)]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                    )}
                  </td>
                  <td className="font-mono font-bold text-[var(--brand-primary)]">{ctrl.id}</td>
                  <td><span className="badge badge-neutral">{ctrl.norm}</span></td>
                  <td className="font-medium text-[var(--text-primary)]">{ctrl.name}</td>
                  <td className="text-sm text-[var(--text-muted)]">{ctrl.ley}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select 
                      className={`badge border ${getStateColor(ctrl.state)} cursor-pointer outline-none bg-transparent appearance-none text-center`}
                      value={ctrl.state}
                      onChange={(e) => updateControlState(ctrl.id, e.target.value)}
                    >
                      <option value="No iniciado" className="text-black bg-white">No iniciado</option>
                      <option value="En progreso" className="text-black bg-white">En progreso</option>
                      <option value="Implementado" className="text-black bg-white">Implementado</option>
                      <option value="Auditado" className="text-black bg-white">Auditado</option>
                    </select>
                  </td>
                  <td className="text-right" onClick={(e) => e.stopPropagation()}>
                    <button className="icon-button inline-flex" title="Modificar Evidencia">
                      <CheckSquare className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
                {expandedRows[ctrl.id] && ctrl.description && (
                  <tr className="compliance-description-row">
                    <td colSpan={7} style={{ padding: 0, border: 'none' }}>
                      <div style={{
                        padding: '0.75rem 1.25rem 0.75rem 3.5rem',
                        background: 'var(--bg-tertiary)',
                        borderBottom: '1px solid var(--border-color)',
                        borderLeft: '3px solid var(--brand-primary)',
                        animation: 'slideDown 0.2s ease-out'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--brand-primary)' }} />
                          <div>
                            <span style={{ 
                              fontSize: '0.7rem', 
                              fontWeight: 700, 
                              textTransform: 'uppercase', 
                              letterSpacing: '0.05em',
                              color: 'var(--brand-primary)',
                              marginBottom: '0.25rem',
                              display: 'block'
                            }}>
                              Guía de Revisión
                            </span>
                            <p style={{ 
                              fontSize: '0.85rem', 
                              lineHeight: '1.5', 
                              color: 'var(--text-secondary)',
                              margin: 0
                            }}>
                              {ctrl.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Results count */}
      <div className="mt-4 text-sm text-[var(--text-muted)] text-center">
        Mostrando {filteredControls.length} de {controls.length} controles
      </div>
     </>
    )}
    </div>
  );
}

export default Compliance;
