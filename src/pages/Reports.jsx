import React, { useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { FileText, Printer, Download, ShieldCheck, Building2, Calendar, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

function Reports() {
  const { controls, company } = useAppContext();
  const printRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  const isoControls = controls.filter(c => c.norm === 'ISO 27001');
  
  const stats = {
    total: isoControls.length,
    implemented: isoControls.filter(c => c.state === 'Implementado' || c.state === 'Auditado').length,
    inProgress: isoControls.filter(c => c.state === 'En progreso').length,
    notStarted: isoControls.filter(c => c.state === 'No iniciado').length,
    percent: isoControls.length ? Math.round((isoControls.filter(c => c.state === 'Implementado' || c.state === 'Auditado').length / isoControls.length) * 100) : 0
  };

  return (
    <div className="animate-fade-in stagger-2 p-2">
      <div className="page-header no-print">
        <div>
          <h1 className="page-title text-3xl font-black mb-1">Centro de Reportes</h1>
          <p className="page-subtitle flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--brand-primary)]" />
            Generación de Declaración de Aplicabilidad (SoA) - ISO/IEC 27001
          </p>
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

      <div className="report-container bg-[var(--bg-secondary)] p-12 rounded-2xl shadow-2xl border border-[var(--border-color)] max-w-6xl mx-auto" ref={printRef}>
        {/* Profile Card / Header for Print */}
        <div className="print-header">
          <div className="flex justify-between items-start border-b border-[rgba(255,255,255,0.1)] pb-8 mb-10">
            <div className="flex items-center gap-6">
              <div className="p-5 bg-[var(--brand-primary)] rounded-2xl text-white shadow-glow">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">Declaración de Aplicabilidad (SoA)</h2>
                <div className="flex items-center gap-2 text-[var(--text-muted)] font-mono text-xs uppercase tracking-widest">
                   <CheckCircle2 className="w-3 h-3" />
                   Estatus de Cumplimiento ISO/IEC 27001:2022
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-[var(--text-primary)] mb-1 uppercase tracking-tighter">
                 {company.name || 'EMPRESA CLIENTE'}
              </div>
              <div className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-widest mb-4">
                ID SISTEMA: {company.id?.substring(0,8) || '---'}
              </div>
              <div className="flex items-center gap-2 justify-end text-[10px] text-[var(--text-secondary)] font-black uppercase bg-[var(--bg-tertiary)] px-3 py-1.5 rounded-full inline-flex">
                <Calendar className="w-4 h-4" /> Generado: {new Date().toLocaleDateString('es-CL')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-[var(--bg-tertiary)] border border-[rgba(255,255,255,0.05)] shadow-inner">
                <div className="flex items-center gap-2 mb-2 text-[var(--brand-primary)]">
                   <Target className="w-4 h-4" />
                   <span className="text-[10px] uppercase font-black tracking-widest">Total Madurez</span>
                </div>
                <div className="text-4xl font-black">{stats.percent}%</div>
            </div>
            <div className="p-6 rounded-2xl bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                <div className="flex items-center gap-2 mb-2 text-[var(--brand-success)]">
                   <CheckCircle2 className="w-4 h-4" />
                   <span className="text-[10px] uppercase font-black tracking-widest text-[var(--brand-success)]">Controles Listos</span>
                </div>
                <div className="text-3xl font-black text-[var(--brand-success)]">{stats.implemented}</div>
            </div>
            <div className="p-6 rounded-2xl bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.1)]">
                <div className="flex items-center gap-2 mb-2 text-[var(--brand-warning)]">
                   <Clock className="w-4 h-4" />
                   <span className="text-[10px] uppercase font-black tracking-widest text-[var(--brand-warning)]">En Proceso</span>
                </div>
                <div className="text-3xl font-black text-[var(--brand-warning)]">{stats.inProgress}</div>
            </div>
            <div className="p-6 rounded-2xl bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.1)]">
                <div className="flex items-center gap-2 mb-2 text-[var(--brand-danger)]">
                   <AlertTriangle className="w-4 h-4" />
                   <span className="text-[10px] uppercase font-black tracking-widest text-[var(--brand-danger)]">Sin Mitigar</span>
                </div>
                <div className="text-3xl font-black text-[var(--brand-danger)]">{stats.notStarted}</div>
            </div>
          </div>

          <div className="soa-table-wrapper rounded-2xl overflow-hidden border border-[var(--border-color)]">
            <table className="table w-full text-left">
              <thead className="bg-[rgba(255,255,255,0.02)]">
                <tr>
                  <th className="p-4 w-28 uppercase text-[10px] font-black tracking-widest opacity-50">Cód ISO</th>
                  <th className="p-4 uppercase text-[10px] font-black tracking-widest opacity-50">Control de Seguridad de la Información</th>
                  <th className="p-4 w-40 text-center uppercase text-[10px] font-black tracking-widest opacity-50">Estado</th>
                  <th className="p-4 w-32 text-center uppercase text-[10px] font-black tracking-widest opacity-50">Nivel Riesgo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {isoControls.map(ctrl => (
                  <tr key={ctrl.id} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                    <td className="p-4 font-mono font-black text-[var(--brand-primary)]">{ctrl.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-[var(--text-primary)] mb-1">{ctrl.name}</div>
                      <div className="text-[10px] text-[var(--text-muted)] italic leading-tight">Alinado a: {ctrl.ley}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border ${
                        ctrl.state === 'Implementado' || ctrl.state === 'Auditado' 
                        ? 'border-[var(--brand-success)] text-[var(--brand-success)] bg-[rgba(16,185,129,0.05)] shadow-glow-sm' 
                        : ctrl.state === 'En progreso' 
                        ? 'border-[var(--brand-warning)] text-[var(--brand-warning)] bg-[rgba(245,158,11,0.05)]'
                        : 'border-[var(--border-color)] text-[var(--text-muted)]'
                      }`}>
                        {ctrl.state}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="w-full h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                         <div className={`h-full ${
                           ctrl.state === 'Implementado' || ctrl.state === 'Auditado' ? 'w-full bg-[var(--brand-success)]' :
                           ctrl.state === 'En progreso' ? 'w-1/2 bg-[var(--brand-warning)]' : 'w-0'
                         }`}></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-20 pt-10 border-t border-[rgba(255,255,255,0.1)] flex justify-around items-end print-only">
              <div className="text-center">
                <div className="border-b-2 border-dashed border-[var(--text-primary)] mb-4 w-64 h-24"></div>
                <span className="text-xs font-black uppercase block tracking-wider">{company.legalContact || 'Representante Legal'}</span>
                <span className="text-[10px] text-[var(--text-muted)] mt-1 block uppercase tracking-tighter">Propietario del Riesgo</span>
              </div>
              <div className="text-center">
                <div className="border-b-2 border-dashed border-[var(--text-primary)] mb-4 w-64 h-24"></div>
                <span className="text-xs font-black uppercase block tracking-wider">vCISO Advisor System</span>
                <span className="text-[10px] text-[var(--text-muted)] mt-1 block uppercase tracking-tighter">Firma Digital Auditada</span>
              </div>
          </div>

          <div className="mt-12 text-center text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-[0.2em] opacity-40">
             Documento generado íntegramente por la plataforma vCISO Saas Chile
          </div>
        </div>
      </div>
      
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: flex !important; }
          body { background: white !important; color: black !important; padding: 0 !important; }
          .report-container { margin: 0 !important; box-shadow: none !important; border: 1px solid #eee !important; color: black !important; background: white !important; scale: 0.95; }
          .table th { background-color: #f9fafb !important; color: black !important; border-bottom: 2px solid #000 !important; }
          .table td { color: black !important; border-bottom: 1px solid #eee !important; }
          .font-black, .font-bold { color: black !important; }
          .text-[var(--text-muted)], .text-[var(--text-secondary)] { color: #666 !important; }
          .bg-[var(--bg-tertiary)] { background-color: #f0f0f0 !important; }
        }
        .print-only { display: none; }
        .soa-table td { vertical-align: middle; }
      `}</style>
    </div>
  );
}

const Target = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);

export default Reports;
