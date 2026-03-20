import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ShieldAlert, Plus, Eye } from 'lucide-react';

function Incidents() {
  const { incidents } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in stagger-2">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Incidentes</h1>
          <p className="page-subtitle">Ley 21.459 / Ley 19.628 / ISO 27001</p>
        </div>
        <button className="btn btn-danger" onClick={() => navigate('/incidents/new')}>
          <ShieldAlert className="w-5 h-5" />
          Registrar Incidente
        </button>
      </div>

      <div className="card table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Fecha de Reporte</th>
              <th>Severidad</th>
              <th>Estado</th>
              <th>Plazo Legal (PDP)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map(inc => (
              <tr key={inc.id}>
                <td className="font-mono font-bold">{inc.id}</td>
                <td className="font-medium text-[var(--text-primary)]">{inc.title}</td>
                <td>{new Date(inc.date).toLocaleString('es-CL', { timeZone: 'America/Santiago' })}</td>
                <td>
                  <span className={`badge ${inc.severity === 'high' ? 'badge-danger' : inc.severity === 'medium' ? 'badge-warning' : 'badge-info'}`}>
                    {inc.severity.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className={`badge ${inc.status === 'En progreso' ? 'badge-warning' : 'badge-success'}`}>
                    {inc.status}
                  </span>
                </td>
                <td>
                  {inc.legalCountdown ? (
                     <span className="timer-critical">{inc.legalCountdown} hrs restantes</span>
                  ) : <span className="text-[var(--text-muted)]">N/A</span>}
                </td>
                <td>
                  <button className="icon-button" onClick={() => navigate(`/incidents/${inc.id}`)}>
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Incidents;
