import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Shield, User, Trash2, Calendar, Activity } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

function Administration() {
  const { company, users, registerUser, loadingUsers } = useAppContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await registerUser(newUser.email, newUser.password, newUser.name, newUser.role);
      setShowAddModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'USER' });
    } catch (err) {
      setError(err.message || 'Error al agregar usuario.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in stagger-3">
      <div className="page-header">
        <div>
          <h1 className="page-title">Administración de Usuarios</h1>
          <p className="page-subtitle">Gestión de accesos • {company?.name}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <UserPlus className="w-5 h-5" /> 
          Agregar Usuario
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
         <div className="card text-center flex flex-col items-center">
            <Users className="w-8 h-8 text-[var(--brand-primary)] mb-2" />
            <div className="text-3xl font-bold">{users.length}</div>
            <div className="text-xs text-[var(--text-muted)] uppercase">Usuarios Activos</div>
         </div>
         <div className="card text-center flex flex-col items-center">
            <Shield className="w-8 h-8 text-[var(--brand-info)] mb-2" />
            <div className="text-3xl font-bold">{users.filter(u => u.role === 'ADMIN').length}</div>
            <div className="text-xs text-[var(--text-muted)] uppercase">Administradores</div>
         </div>
         <div className="card text-center flex flex-col items-center border-l-4 border-[var(--brand-success)]">
            <Building className="w-8 h-8 text-[var(--brand-success)] mb-2" />
            <div className="text-lg font-bold truncate max-w-full" title={company?.name}>{company?.name}</div>
            <div className="text-xs text-[var(--text-muted)] uppercase">Empresa Actual</div>
         </div>
         <div className="card text-center flex flex-col items-center">
            <Activity className="w-8 h-8 text-[var(--brand-warning)] mb-2" />
            <div className="text-3xl font-bold">Sin Bloqueos</div>
            <div className="text-xs text-[var(--text-muted)] uppercase">Estado Sistema</div>
         </div>
      </div>

      <div className="card table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Fecha Registro</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loadingUsers ? (
              <tr><td colSpan={5} className="text-center py-8">Cargando usuarios...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8">No hay usuarios registrados.</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td className="flex items-center gap-3">
                    <div className="avatar w-8 h-8 text-xs">{user.name.charAt(0)}</div>
                    <span className="font-medium">{user.name}</span>
                  </td>
                  <td className="text-[var(--text-secondary)]">
                     <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                        {user.email}
                     </div>
                  </td>
                  <td>
                    <span className={`badge ${user.role === 'ADMIN' ? 'badge-info' : 'badge-neutral'}`}>
                       {user.role}
                    </span>
                  </td>
                  <td className="text-[var(--text-muted)] text-sm">
                     <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(user.createdAt).toLocaleDateString()}
                     </div>
                  </td>
                  <td className="text-right">
                    <button className="icon-button text-[var(--brand-danger)] hover:bg-[rgba(239,68,68,0.1)]">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="icon-button ml-2">
                      <Shield className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Modal Implementation since we don't have a UI library */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-md p-6 shadow-xl border-[var(--border-color)]">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Agregar Nuevo Usuario</h2>
                <button onClick={() => setShowAddModal(false)} className="text-[var(--text-muted)] hover:text-white">✕</button>
             </div>
             
             {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-sm mb-4">{error}</div>}

             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                   <label className="form-label">Nombre Completo</label>
                   <input 
                     type="text" 
                     className="form-control" 
                     placeholder="Ej: Juan Pérez" 
                     required
                     value={newUser.name}
                     onChange={e => setNewUser({...newUser, name: e.target.value})}
                   />
                </div>
                <div className="form-group">
                   <label className="form-label">Correo Electrónico</label>
                   <input 
                     type="email" 
                     className="form-control" 
                     placeholder="juan@empresa.cl" 
                     required
                     value={newUser.email}
                     onChange={e => setNewUser({...newUser, email: e.target.value})}
                   />
                </div>
                <div className="form-group">
                   <label className="form-label">Contraseña</label>
                   <input 
                     type="password" 
                     className="form-control" 
                     placeholder="••••••••" 
                     required
                     value={newUser.password}
                     onChange={e => setNewUser({...newUser, password: e.target.value})}
                   />
                </div>
                <div className="form-group">
                   <label className="form-label">Rol en el Sistema</label>
                   <select 
                     className="form-control cursor-pointer"
                     value={newUser.role}
                     onChange={e => setNewUser({...newUser, role: e.target.value})}
                   >
                      <option value="USER">Analista (Viewer)</option>
                      <option value="ADMIN">Administrador GRC</option>
                   </select>
                </div>
                
                <div className="flex gap-4 mt-8">
                   <button type="button" className="btn btn-outline flex-1" onClick={() => setShowAddModal(false)}>Cancelar</button>
                   <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
                      {submitting ? 'Guardando...' : 'Crear Usuario'}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple Building Icon for stats
const Building = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M16 18h.01"/></svg>
);

export default Administration;
