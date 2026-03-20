import React, { useState } from 'react';
import { Building, Plus, Mail, Shield, User, Trash2, Calendar, Layout, Search, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

function SuperAdmin() {
  const { companies, createCompanyWithAdmin } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    rut: '',
    adminEmail: '',
    adminPassword: '',
    adminName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createCompanyWithAdmin(
        formData.companyName, 
        formData.adminEmail, 
        formData.adminPassword, 
        formData.adminName
      );
      setShowModal(false);
      setFormData({ companyName: '', rut: '', adminEmail: '', adminPassword: '', adminName: '' });
    } catch (err) {
      setError(err.message || 'Error al crear empresa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in stagger-3">
      <div className="page-header">
        <div>
          <h1 className="page-title text-[var(--brand-warning)] flex items-center gap-3">
             <Shield className="w-8 h-8" />
             Consola de Administración Root
          </h1>
          <p className="page-subtitle">Gestión Global de Empresas y Administradores vCISO</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="w-5 h-5" /> 
          Nueva Empresa + Admin
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
         <div className="card text-center flex flex-col items-center">
            <Building className="w-8 h-8 text-[var(--brand-primary)] mb-2" />
            <div className="text-3xl font-bold">{companies.length}</div>
            <div className="text-xs text-[var(--text-muted)] uppercase">Empresas Registradas</div>
         </div>
         <div className="card text-center flex flex-col items-center border-l-4 border-[var(--brand-warning)]">
            <User className="w-8 h-8 text-[var(--brand-warning)] mb-2" />
            <div className="text-3xl font-bold">{companies.reduce((acc, c) => acc + (c.users?.length || 0), 0)}</div>
            <div className="text-xs text-[var(--text-muted)] uppercase">Total Administradores</div>
         </div>
         <div className="card text-center flex flex-col items-center">
            <Layout className="w-8 h-8 text-[var(--brand-info)] mb-2" />
            <div className="text-3xl font-bold">Activo</div>
            <div className="text-xs text-[var(--text-muted)] uppercase">Estado SaaS</div>
         </div>
         <div className="card text-center flex flex-col items-center">
            <Calendar className="w-8 h-8 text-[var(--brand-success)] mb-2" />
            <div className="text-3xl font-bold">Sin Bloqueos</div>
            <div className="text-xs text-[var(--text-muted)] uppercase">Integridad DB</div>
         </div>
      </div>

      <div className="card table-container">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
           <h3 className="font-bold">Listado Maestro de Empresas</h3>
           <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input type="text" className="form-control pl-10 text-sm" placeholder="Buscar empresa..." />
           </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Nombre Empresa</th>
              <th>RUT</th>
              <th>Administrador Principal</th>
              <th>Email Admin</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8">No hay empresas registradas fuera del sistema.</td></tr>
            ) : (
              companies.map(comp => (
                <tr key={comp.id}>
                  <td className="font-bold text-[var(--brand-primary)]">
                    <div className="flex items-center gap-3">
                       <Building className="w-5 h-5 opacity-50" />
                       {comp.name}
                    </div>
                  </td>
                  <td className="text-[var(--text-secondary)]">{comp.rut}</td>
                  <td>
                    <div className="flex items-center gap-2">
                       <User className="w-4 h-4 text-[var(--text-muted)]" />
                       {comp.users?.[0]?.name || 'No asignado'}
                    </div>
                  </td>
                  <td className="text-[var(--text-muted)]">{comp.users?.[0]?.email || '-'}</td>
                  <td className="text-right">
                    <button className="icon-button text-[var(--brand-danger)]" title="Eliminar Empresa">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="btn btn-outline py-2 px-3 text-xs ml-2">
                       Ver Panel
                       <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="card w-full max-w-lg p-8 shadow-2xl border-[var(--brand-warning)] border-opacity-30">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                   <Plus className="text-[var(--brand-warning)]" />
                   Dar de Alta Empresa
                </h2>
                <button onClick={() => setShowModal(false)} className="text-[var(--text-muted)] hover:text-white">✕</button>
             </div>
             
             {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-sm mb-6">{error}</div>}

             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="form-group">
                      <label className="form-label">Nombre de la Empresa</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        required
                        value={formData.companyName}
                        onChange={e => setFormData({...formData, companyName: e.target.value})}
                      />
                   </div>
                   <div className="form-group">
                      <label className="form-label">RUT Empresa</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="76.123.456-7"
                        value={formData.rut}
                        onChange={e => setFormData({...formData, rut: e.target.value})}
                      />
                   </div>
                </div>

                <div className="p-4 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.05)]">
                   <h4 className="text-xs font-bold text-[var(--brand-primary)] uppercase mb-4">Datos del Administrador Inicial</h4>
                   <div className="space-y-4">
                      <div className="form-group">
                         <label className="form-label">Nombre Completo</label>
                         <input 
                           type="text" 
                           className="form-control" 
                           required
                           value={formData.adminName}
                           onChange={e => setFormData({...formData, adminName: e.target.value})}
                         />
                      </div>
                      <div className="form-group">
                         <label className="form-label">Email de Acceso</label>
                         <input 
                           type="email" 
                           className="form-control" 
                           required
                           value={formData.adminEmail}
                           onChange={e => setFormData({...formData, adminEmail: e.target.value})}
                         />
                      </div>
                      <div className="form-group">
                         <label className="form-label">Contraseña Temporal</label>
                         <input 
                           type="password" 
                           className="form-control" 
                           required
                           value={formData.adminPassword}
                           onChange={e => setFormData({...formData, adminPassword: e.target.value})}
                         />
                      </div>
                   </div>
                </div>
                
                <div className="flex gap-4 mt-8 pt-4 border-t border-[rgba(255,255,255,0.05)]">
                   <button type="button" className="btn btn-outline flex-1 py-3" onClick={() => setShowModal(false)}>Cancelar</button>
                   <button type="submit" className="btn btn-primary flex-1 py-3 shadow-glow" disabled={loading}>
                      {loading ? 'Creando Empresa...' : 'Crear y Notificar'}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdmin;
