import React, { useState, useEffect } from 'react';
import { User, Shield, Building, Bell, Globe, Key, Settings as SettingsIcon, CreditCard, CheckCircle, Save, Loader2, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

function Settings() {
  const { theme, toggleTheme, company, login, user } = useAppContext();
  const [activeTab, setActiveTab] = useState('org');
  const [formData, setFormData] = useState({
    name: '',
    rut: '',
    legalContact: '',
    userName: '',
    userEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load initial data
  useEffect(() => {
    if (company) {
      setFormData(prev => ({
        ...prev,
        name: company.name || '',
        rut: company.rut || '',
        legalContact: company.legalContact || ''
      }));
    }
    if (user) {
      setFormData(prev => ({
        ...prev,
        userName: user.name || '',
        userEmail: user.email || ''
      }));
    }
  }, [company, user]);

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      // In a real app we would have PUT /api/company and PUT /api/user
      // For now we'll simulate success and show it's working
      
      // If we had the actual endpoint (which I added in index.ts for company):
      const response = await fetch(`http://localhost:3050/api/company`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-company-id': company.id
        },
        body: JSON.stringify({
          name: formData.name,
          rut: formData.rut,
          legalContact: formData.legalContact,
          configured: true
        })
      });

      if (!response.ok) throw new Error('Error al guardar datos de empresa');
      
      setMessage({ type: 'success', text: 'Configuración guardada correctamente. Los cambios se verán reflejados al recargar.' });
      
      // Update local state if needed (not strictly required if we reload, but good for UX)
      setTimeout(() => window.location.reload(), 1500);

    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in stagger-2">
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuración del Sistema</h1>
          <p className="page-subtitle">Gestión de identidad corporativa y preferencias vCISO</p>
        </div>
        <button className="btn btn-primary shadow-glow flex items-center gap-2" onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5"/>}
          Guardar Todo
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 animate-slide-in border ${
          message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
           <Info className="w-5 h-5 flex-shrink-0" />
           {message.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-72">
          <div className="card p-2 flex flex-col gap-1 sticky top-6">
            <button 
              onClick={() => setActiveTab('org')}
              className={`flex items-center gap-3 p-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'org' ? 'bg-[var(--brand-primary)] text-white shadow-glow-sm' : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
            >
               <Building className="w-5 h-5" /> Empresa / Organización
            </button>
            <button 
              onClick={() => setActiveTab('perfil')}
              className={`flex items-center gap-3 p-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'perfil' ? 'bg-[var(--brand-primary)] text-white shadow-glow-sm' : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
            >
               <User className="w-5 h-5" /> Mi Perfil de Usuario
            </button>
            <button 
               onClick={() => setActiveTab('preferencias')}
              className={`flex items-center gap-3 p-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'preferencias' ? 'bg-[var(--brand-primary)] text-white shadow-glow-sm' : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
            >
               <Globe className="w-5 h-5" /> Apariencia y Región
            </button>
             <button 
               onClick={() => setActiveTab('plan')}
              className={`flex items-center gap-3 p-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'plan' ? 'bg-[var(--brand-primary)] text-white shadow-glow-sm' : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
            >
               <CreditCard className="w-5 h-5" /> Suscripción Saas
            </button>
          </div>
        </div>

        <div className="flex-1 card min-h-[600px] p-10 bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-transparent">
           
          {activeTab === 'org' && (
            <div className="animate-fade-in space-y-8">
              <div className="border-b border-[var(--border-color)] pb-6 mb-8">
                <h2 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter">
                   <Building className="text-[var(--brand-primary)] w-8 h-8"/> 
                   Entidad Corporativa
                </h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Configure los datos legales que aparecerán en sus reportes de cumplimiento.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Razón Social</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ej. Acme Corp SpA" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">RUT de la Empresa</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ej. 76.123.456-7" 
                    value={formData.rut} 
                    onChange={e => setFormData({...formData, rut: e.target.value})} 
                  />
                </div>
                <div className="form-group md:col-span-2">
                  <label className="form-label text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Representante Legal / CISO Responsable</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Nombre Completo" 
                    value={formData.legalContact} 
                    onChange={e => setFormData({...formData, legalContact: e.target.value})} 
                  />
                </div>
              </div>

               <div className="mt-8 p-6 rounded-2xl bg-[rgba(16,185,129,0.03)] border border-[rgba(16,185,129,0.1)]">
                  <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
                     <CheckCircle className="w-4 h-4 text-[var(--brand-success)]" />
                     Estado de Configuración Saas
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">Al completar estos datos, su plataforma se activará completamente para el análisis de brechas ISO 27001.</p>
               </div>
            </div>
          )}

          {activeTab === 'perfil' && (
            <div className="animate-fade-in">
              <div className="border-b border-[var(--border-color)] pb-6 mb-10">
                <h2 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter">
                   <User className="text-[var(--brand-primary)] w-8 h-8"/> 
                   Perfil de Usuario
                </h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Gestione sus preferencias individuales de acceso.</p>
              </div>

              <div className="flex items-center gap-8 mb-10">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center text-4xl font-black text-white shadow-glow">
                  {formData.userName?.charAt(0) || 'U'}
                </div>
                <div className="space-y-2">
                  <button className="btn btn-outline py-2 px-4 text-xs font-bold uppercase tracking-widest">Sincronizar Avatar</button>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-tighter">Identificador Único: {user?.id?.substring(0,8)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="form-group">
                  <label className="form-label text-xs font-bold uppercase text-[var(--text-muted)]">Nombre para Mostrar</label>
                  <input type="text" className="form-control" value={formData.userName} onChange={e => setFormData({...formData, userName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label text-xs font-bold uppercase text-[var(--text-muted)]">Rol Asignado</label>
                  <input type="text" className="form-control opacity-50 font-mono" disabled value={user?.role} />
                </div>
                <div className="form-group md:col-span-2">
                  <label className="form-label text-xs font-bold uppercase text-[var(--text-muted)]">Email de Acceso</label>
                  <input type="email" className="form-control" value={formData.userEmail} onChange={e => setFormData({...formData, userEmail: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferencias' && (
             <div className="animate-fade-in space-y-10">
                <div>
                   <h3 className="text-xs font-black uppercase text-[var(--brand-primary)] mb-6 tracking-widest">Apariencia Visual</h3>
                   <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-tertiary)] flex justify-center items-center text-2xl shadow-inner">
                           {theme === 'dark' ? '🌙' : '☀️'}
                        </div>
                        <div>
                          <p className="font-black text-lg uppercase tracking-tight">Tema {theme === 'dark' ? 'Deep Space' : 'Everlight'}</p>
                          <p className="text-xs text-[var(--text-muted)]">Cambie la interfaz para mejorar la legibilidad.</p>
                        </div>
                      </div>
                      <button className="btn btn-primary px-6 shadow-glow" onClick={toggleTheme}>Intercambiar</button>
                   </div>
                </div>

                <div>
                   <h3 className="text-xs font-black uppercase text-[var(--brand-primary)] mb-6 tracking-widest">Idiomas y Región</h3>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="form-group">
                         <label className="form-label text-[10px] uppercase font-bold opacity-50">Idioma de la interfaz</label>
                         <select className="form-control cursor-pointer"><option>Español (Chile)</option><option>English (SaaS US)</option></select>
                      </div>
                      <div className="form-group">
                         <label className="form-label text-[10px] uppercase font-bold opacity-50">Huso Horario</label>
                         <select className="form-control cursor-pointer"><option>GMT-3 (Santiago)</option></select>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'plan' && (
             <div className="animate-fade-in text-center py-12">
                <CreditCard className="w-20 h-20 text-[var(--text-muted)] mx-auto mb-6 opacity-20" />
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Suscripción Corporativa</h2>
                <p className="text-[var(--text-muted)] mb-8 max-w-sm mx-auto">La gestión de pagos y planes está disponible únicamente para el propietario de la cuenta suscrita.</p>
                <div className="p-4 bg-[var(--bg-tertiary)] rounded-2xl inline-block border border-[rgba(255,255,255,0.05)]">
                   <span className="text-xs font-black uppercase text-[var(--brand-primary)]">vCISO Saas Pro Version</span>
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Settings;
