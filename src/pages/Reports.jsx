import React, { useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { FileText, Printer, Download, ShieldCheck, Building2, Calendar } from 'lucide-react';

function Reports() {
  const { controls, company } = useAppContext();
  const printRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  const isoControls = controls.filter(c => c.norm === 'ISO 27001');
  const nistControls = controls.filter(c => c.norm === 'NIST CSF');

  const stats = {
    total: isoControls.length,
    implemented: isoControls.filter(c => c.state === 'Implementado' || c.state === 'Auditado').length,
    inProgress: isoControls.filter(c => c.state === 'En progreso').length,
    notStarted: isoControls.filter(c => c.state === 'No iniciado').length,
  };

  return (
    <div className="animate-fade-in stagger-2">
      <div className="page-header no-print">
        <div>
          <h1 className="page-title">Centro de Reportes</h1>
          <p className="page-subtitle">Generación de Declaración de Aplicabilidad (SoA) y Evidencia</p>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer className="w-5 h-5" /> Imprimir / PDF
          </button>
          <button className="btn btn-primary shadow-glow">
            <Download className="w-5 h-5" /> Exportar Excel
          </button>
        </div>
      </div>

      <div className="report-container" ref={printRef}>
        {/* Profile Card / Header for Print */}
        <div className="card mb-8 print-header">
          <div className="flex justify-between items-start border-b pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[var(--brand-primary)] rounded-xl text-white">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Declaración de Aplicabilidad (SoA)</h2>
                <p className="text-[var(--text-muted)] font-mono text-sm">Normativa ISO/IEC 27001:2022</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end text-[var(--text-primary)] font-bold">
                <Building2 className="w-4 h-4" /> {company.name || 'Empresa No Configurada'}
              </div>
              <div className="text-sm text-[var(--text-muted)] mt-1 font-mono uppercase">
                RUT: {company.rut || '---'}
              </div>
              <div className="flex items-center gap-2 justify-end text-xs text-[var(--text-secondary)] mt-2 italic font-mono uppercase mb-4">
                <Calendar className="w-4 h-4" /> {new Date().toLocaleDateString('es-CL')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 no-print">
            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                <span className="text-xs uppercase font-bold text-[var(--text-muted)] block mb-1">Total Controles</span>
                <span className="text-2xl font-black">{stats.total}</span>
            </div>
            <div className="p-4 rounded-xl bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)]">
                <span className="text-xs uppercase font-bold text-[var(--brand-success)] block mb-1">Implementados</span>
                <span className="text-2xl font-black text-[var(--brand-success)]">{stats.implemented}</span>
            </div>
            <div className="p-4 rounded-xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)]">
                <span className="text-xs uppercase font-bold text-[var(--brand-warning)] block mb-1">En Progreso</span>
                <span className="text-2xl font-black text-[var(--brand-warning)]">{stats.inProgress}</span>
            </div>
          </div>

          <div className="soa-table-wrapper overflow-x-auto">
            <table className="table soa-table">
              <thead>
                <tr>
                  <th className="w-24">Código</th>
                  <th>Control / Nombre</th>
                  <th>Marco Legal (Chile)</th>
                  <th className="w-32">Aplicabilidad</th>
                  <th className="w-40 text-center">Estado</th>
                  <th className="w-64">Justificación / Evidencia</th>
                </tr>
              </thead>
              <tbody>
                {isoControls.map(ctrl => (
                  <tr key={ctrl.id}>
                    <td className="font-mono font-bold text-[var(--brand-primary)]">{ctrl.id}</td>
                    <td>
                      <div className="font-medium text-[var(--text-primary)]">{ctrl.name}</div>
                      <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-0.5">ISO 27001:2022</div>
                    </td>
                    <td className="text-xs italic text-[var(--text-secondary)]">{ctrl.ley}</td>
                    <td><span className="badge badge-success text-[10px] py-0.5">Aplica</span></td>
                    <td className="text-center">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase border ${
                        ctrl.state === 'Implementado' || ctrl.state === 'Auditado' 
                        ? 'border-[var(--brand-success)] text-[var(--brand-success)]' 
                        : ctrl.state === 'En progreso' 
                        ? 'border-[var(--brand-warning)] text-[var(--brand-warning)]'
                        : 'border-[var(--border-color)] text-[var(--text-muted)]'
                      }`}>
                        {ctrl.state}
                      </span>
                    </td>
                    <td>
                      <div className="h-4 w-full border-b border-dashed border-[var(--border-color)] mb-1"></div>
                      <div className="h-4 w-full border-b border-dashed border-[var(--border-color)]"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-12 pt-8 border-t flex justify-between items-end print-only" style={{ borderColor: 'var(--border-color)' }}>
              <div className="text-center w-64">
                <div className="border-b border-[var(--text-primary)] mb-2 h-12"></div>
                <span className="text-xs font-bold uppercase block">{company.legalContact || 'Responsable Legal'}</span>
                <span className="text-[10px] text-[var(--text-muted)]">Representante Organización</span>
              </div>
              <div className="text-center w-64">
                <div className="border-b border-[var(--text-primary)] mb-2 h-12"></div>
                <span className="text-xs font-bold uppercase block">Oficial de Seguridad (CISO)</span>
                <span className="text-[10px] text-[var(--text-muted)]">Gestor SGSI</span>
              </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: flex !important; }
          body { background: white !important; color: black !important; padding: 0 !important; }
          .report-container { margin: 0 !important; box-shadow: none !important; }
          .card { border: none !important; box-shadow: none !important; }
          .soa-table th { background-color: #f3f4f6 !important; color: black !important; }
          .soa-table tr { border-bottom: 1px solid #e5e7eb !important; }
          .badge-success { background: none !important; color: black !important; border: 1px solid #000 !important; }
        }
        .print-only { display: none; }
        .soa-table td { vertical-align: middle; }
      `}</style>
    </div>
  );
}

export default Reports;
