import React, { useState } from 'react';
import { Shield, Lock, Building, User, ArrowRight, Settings, Info, Briefcase, Globe } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [mode, setMode] = useState('login'); // login, register, superadmin_setup, superadmin_login
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    companyName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, setupSuperAdmin } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await register(formData.email, formData.password, formData.name, formData.companyName);
      } else if (mode === 'superadmin_setup') {
        await setupSuperAdmin(formData.email, formData.password, formData.name);
        navigate('/superadmin');
      } else if (mode === 'superadmin_login') {
        await login(formData.email, formData.password, 'SISTEMA');
        navigate('/superadmin');
      } else {
        await login(formData.email, formData.password, formData.companyName);
      }
    } catch (err) {
      setError(err.message || 'Error de autenticación. Verifique sus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const modeInfo = {
    login: { title: 'Acceso de Empresa', subtitle: 'Ingrese sus credenciales de GRC Corporativo', icon: <Building /> },
    register: { title: 'Alta de Organización', subtitle: 'Registrar nueva empresa en la plataforma vCISO', icon: <Briefcase className="text-[var(--brand-primary)]" /> },
    superadmin_setup: { title: 'Instalación de Sistema', subtitle: 'Configurar Administrador de Sistema Inicial (Root)', icon: <Settings className="text-[var(--brand-warning)]" /> },
    superadmin_login: { title: 'Consola Central Root', subtitle: 'Acceso Administrador de Infraestructura SaaS', icon: <Globe className="text-[var(--brand-warning)]" /> },
  };

  return (
    <div className="login-page">
      <div className="login-card animate-fade-in stagger-2">
        <div className="login-header">
          <div className="logo-container">
            <Shield className="w-12 h-12 text-[var(--brand-primary)]" />
          </div>
          <h1 className="text-3xl font-black mt-6 tracking-tight flex items-center gap-3">
             {modeInfo[mode].icon}
             {modeInfo[mode].title}
          </h1>
          <p className="text-[var(--text-muted)] mt-2 font-medium">{modeInfo[mode].subtitle}</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm mb-6 flex items-center gap-3 animate-slide-in">
             <Info className="w-5 h-5 flex-shrink-0" />
             {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {(mode === 'register' || mode === 'superadmin_setup') && (
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input 
                  type="text" 
                  className="form-control pl-12" 
                  required
                  placeholder="Ej: Juan Pérez"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
          )}

          {mode === 'register' || mode === 'login' ? (
            <div className="form-group">
              <label className="form-label">Nombre de la Empresa</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input 
                  type="text" 
                  className="form-control pl-12" 
                  required
                  placeholder="Empresa Cliente"
                  value={formData.companyName}
                  onChange={e => setFormData({...formData, companyName: e.target.value})}
                />
              </div>
            </div>
          ) : null}

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input 
                type="email" 
                className="form-control pl-12" 
                required
                placeholder="usuario@empresa.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input 
                type="password" 
                className="form-control pl-12" 
                required
                placeholder="********"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={`btn btn-primary w-full py-4 text-base font-bold shadow-glow flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}
            disabled={loading}
          >
            {loading ? 'Procesando...' : (mode === 'login' || mode === 'superadmin_login' ? 'Ingresar al Portal' : 'Confirmar Registro')}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="login-footer pt-8 mt-8 border-t border-[var(--border-color)] text-center text-sm">
          {mode === 'login' ? (
            <p className="text-[var(--text-muted)]">
              ¿No tiene una cuenta? <button onClick={() => setMode('register')} className="text-[var(--brand-primary)] font-bold hover:underline">Solicitar Alta de Empresa</button>
            </p>
          ) : (
            <button onClick={() => setMode('login')} className="text-[var(--text-muted)] hover:text-white uppercase text-[10px] font-bold tracking-widest">Volver al Ingreso Estándar</button>
          )}

          <div className="mt-8 flex flex-col gap-3">
             <button 
                onClick={() => setMode(mode === 'superadmin_login' ? 'login' : 'superadmin_login')} 
                className="text-xs text-[var(--text-muted)] opacity-50 hover:opacity-100 flex items-center justify-center gap-2"
             >
                <Settings className="w-3 h-3" />
                Administración de la Infraestructura SaaS
             </button>
             {mode === 'superadmin_login' && (
               <button 
                 onClick={() => setMode('superadmin_setup')}
                 className="text-[10px] text-[var(--brand-warning)] font-bold uppercase tracking-widest border border-[var(--brand-warning)] border-opacity-30 rounded px-2 py-1 mx-auto"
               >
                 Instalación Inicial Root
               </button>
             )}
          </div>
        </div>
      </div>
      
      <div className="login-background">
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
      </div>
    </div>
  );
}

export default Login;
