import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight, Settings, Info, CheckCircle, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    companyName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { login, register, setupSuperAdmin } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await register(formData.email, formData.password, formData.name, formData.companyName);
        setRegistrationSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else if (mode === 'superadmin_setup') {
        await setupSuperAdmin(formData.email, formData.password, formData.name);
        navigate('/superadmin');
      } else if (mode === 'superadmin_login') {
        await login(formData.email, formData.password, 'SISTEMA');
        navigate('/superadmin');
      } else {
        await login(formData.email, formData.password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Error de autenticación. Verifique sus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setError('');
    setFormData({ email: '', password: '', name: '', companyName: '' });
  };

  const modeInfo = {
    login: { 
      title: 'Acceso al Portal', 
      subtitle: 'Ingrese sus credenciales de GRC Corporativo', 
      icon: <Shield />,
      submitText: 'Ingresar'
    },
    register: { 
      title: 'Crear Cuenta', 
      subtitle: 'Registre su empresa y comience a operar inmediatamente', 
      icon: <Sparkles className="text-[var(--brand-primary)]" />,
      submitText: 'Crear Cuenta'
    },
    superadmin_setup: { 
      title: 'Instalación Root', 
      subtitle: 'Configurar Administrador de Sistema', 
      icon: <Settings className="text-[var(--brand-warning)]" />,
      submitText: 'Instalar Sistema'
    },
    superadmin_login: { 
      title: 'Consola Root', 
      subtitle: 'Acceso Administrador SaaS', 
      icon: <Settings className="text-[var(--brand-warning)]" />,
      submitText: 'Acceder'
    },
  };

  if (registrationSuccess) {
    return (
      <div className="login-page">
        <div className="login-card animate-fade-in">
          <div className="login-header">
            <div className="logo-container">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center shadow-glow">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-black mt-6 tracking-tight">
              ¡Cuenta Creada!
            </h1>
            <p className="text-[var(--text-muted)] mt-2 font-medium">
              Redirigiendo al dashboard...
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 p-4 bg-[var(--brand-success)]/10 rounded-xl border border-[var(--brand-success)]/20">
              <CheckCircle className="w-5 h-5 text-[var(--brand-success)]" />
              <span className="text-sm">Empresa registrada</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-[var(--brand-primary)]/10 rounded-xl border border-[var(--brand-primary)]/20">
              <Shield className="w-5 h-5 text-[var(--brand-primary)]" />
              <span className="text-sm">Controles ISO 27001 cargados</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-[var(--brand-secondary)]/10 rounded-xl border border-[var(--brand-secondary)]/20">
              <Sparkles className="w-5 h-5 text-[var(--brand-secondary)]" />
              <span className="text-sm">Listo para operar</span>
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

        <form onSubmit={handleSubmit} className="space-y-5">
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

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Nombre de la Empresa</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input 
                  type="text" 
                  className="form-control pl-12" 
                  required
                  placeholder="Mi Empresa SpA"
                  value={formData.companyName}
                  onChange={e => setFormData({...formData, companyName: e.target.value})}
                />
              </div>
            </div>
          )}

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
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            {mode === 'register' && (
              <p className="text-xs text-[var(--text-muted)] mt-2">
                Mínimo 8 caracteres, 1 mayúscula, 1 número
              </p>
            )}
          </div>

          <button 
            type="submit" 
            className={`btn btn-primary w-full py-4 text-base font-bold shadow-glow flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                {modeInfo[mode].submitText}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="login-footer pt-6 mt-6 border-t border-[var(--border-color)]">
          {mode === 'login' ? (
            <div className="text-center space-y-3">
              <p className="text-[var(--text-muted)]">
                ¿No tiene cuenta?{' '}
                <button onClick={() => handleModeSwitch('register')} className="text-[var(--brand-primary)] font-bold hover:underline">
                  Crear cuenta gratis
                </button>
              </p>
              <button 
                onClick={() => handleModeSwitch('superadmin_login')} 
                className="text-xs text-[var(--text-muted)] opacity-50 hover:opacity-100"
              >
                Acceso Administrador
              </button>
            </div>
          ) : mode === 'register' ? (
            <div className="text-center space-y-3">
              <p className="text-[var(--text-muted)]">
                ¿Ya tiene cuenta?{' '}
                <button onClick={() => handleModeSwitch('login')} className="text-[var(--brand-primary)] font-bold hover:underline">
                  Iniciar sesión
                </button>
              </p>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <button 
                onClick={() => handleModeSwitch(mode === 'superadmin_login' ? 'login' : 'superadmin_login')} 
                className="text-xs text-[var(--text-muted)] hover:text-white"
              >
                ← Volver
              </button>
              {mode === 'superadmin_login' && (
                <button 
                  onClick={() => handleModeSwitch('superadmin_setup')}
                  className="block w-full text-[10px] text-[var(--brand-warning)] font-bold uppercase tracking-widest mt-2"
                >
                  Instalación Inicial Root
                </button>
              )}
            </div>
          )}
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
