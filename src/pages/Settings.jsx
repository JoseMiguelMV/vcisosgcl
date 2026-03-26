import React, { useState, useEffect } from 'react';
import { User, Building, Globe, CreditCard, CheckCircle, Save, Loader2, Info, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? '/api' : '');

function Settings() {
  const { theme, toggleTheme, company, user, accessToken } = useAppContext();
  const [activeTab, setActiveTab] = useState('org');
  const [formData, setFormData] = useState({
    name: '',
    rut: '',
    legalContact: '',
    primaryColor: '#3b82f6',
    logo: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (company) {
      setFormData(prev => ({
        ...prev,
        name: company.name || '',
        rut: company.rut || '',
        legalContact: company.legalContact || '',
        primaryColor: company.primaryColor || '#3b82f6',
        logo: company.logo || ''
      }));
    }
  }, [company]);

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await fetch(`${API_BASE}/company`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'x-company-id': company?.id
        },
        body: JSON.stringify({
          name: formData.name,
          rut: formData.rut,
          legalContact: formData.legalContact,
          configured: true
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Error al guardar');
      }
      
      setMessage({ type: 'success', text: 'Configuración guardada correctamente.' });
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
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">Personaliza tu plataforma y preferencias</p>
        </div>
        <button className="btn btn-primary shadow-glow flex items-center gap-2" onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5"/>}
          Guardar Cambios
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 animate-slide-in border ${
          message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
          <Info className="w-5 h-5 flex-shrink-0" />
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64">
          <div className="card p-2 flex flex-col gap-1 sticky top-6">
            <button 
              onClick={() => setActiveTab('org')}
              className={`flex items-center gap-3 p-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'org' ? 'bg-[var(--brand-primary)] text-white shadow-glow-sm' : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
            >
              <Building className="w-5 h-5" /> Empresa
            </button>
            <button 
              onClick={() => setActiveTab('perfil')}
              className={`flex items-center gap-3 p-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'perfil' ? 'bg-[var(--brand-primary)] text-white shadow-glow-sm' : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
            >
              <User className="w-5 h-5" /> Mi Perfil
            </button>
            <button 
              onClick={() => setActiveTab('preferencias')}
              className={`flex items-center gap-3 p-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'preferencias' ? 'bg-[var(--brand-primary)] text-white shadow-glow-sm' : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
            >
              <Globe className="w-5 h-5" /> Apariencia
            </button>
          </div>
        </div>

        <div className="flex-1 card min-h-[500px] p-8">
          {activeTab === 'org' && (
            <div className="animate-fade-in space-y-6">
              <div className="border-b border-[var(--border-color)] pb-4">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Building className="text-[var(--brand-primary)]" /> 
                  Datos de la Empresa
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Razón Social</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Mi Empresa SpA" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">RUT</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="76.123.456-7" 
                    value={formData.rut} 
                    onChange={e => setFormData({...formData, rut: e.target.value})} 
                  />
                </div>
                <div className="form-group md:col-span-2">
                  <label className="form-label">Email Legal (para notificaciones)</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="legal@empresa.cl" 
                    value={formData.legalContact} 
                    onChange={e => setFormData({...formData, legalContact: e.target.value})} 
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">Recibirás alertas de incidentes con plazos legales aquí.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Personalización
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs">Color primario</label>
                    <div className="flex gap-3 items-center">
                      <input 
                        type="color" 
                        className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer rounded" 
                        value={formData.primaryColor} 
                        onChange={e => setFormData({...formData, primaryColor: e.target.value})} 
                      />
                      <span className="font-mono text-sm">{formData.primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="form-label text-xs">Logo URL</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="https://..." 
                      value={formData.logo} 
                      onChange={e => setFormData({...formData, logo: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'perfil' && (
            <div className="animate-fade-in space-y-6">
              <div className="border-b border-[var(--border-color)] pb-4">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <User className="text-[var(--brand-primary)]" /> 
                  Mi Perfil
                </h2>
              </div>

              <div className="flex items-center gap-6 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center text-2xl font-black text-white shadow-glow">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-bold text-lg">{user?.name}</p>
                  <p className="text-sm text-[var(--text-muted)]">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-bold bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] rounded">
                    {user?.role}
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                <p className="text-sm text-[var(--text-muted)]">
                  Tu perfil se gestiona automáticamente desde el sistema. Para cambios de email o nombre, contacta al administrador.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'preferencias' && (
            <div className="animate-fade-in space-y-6">
              <div className="border-b border-[var(--border-color)] pb-4">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Globe className="text-[var(--brand-primary)]" /> 
                  Apariencia
                </h2>
              </div>

              <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">Tema de la interfaz</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      Actualmente: {theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
                    </p>
                  </div>
                  <button className="btn btn-primary" onClick={toggleTheme}>
                    Cambiar Tema
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
