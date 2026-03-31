import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight, Info, CheckCircle, Sparkles } from 'lucide-react';
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
  const { login, register } = useAppContext();
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
        }, 2000);
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

  if (registrationSuccess) {
    return (
      <div className="login-page-spline">
        <div className="login-background-3d bg-gradient-to-br from-emerald-900/20 via-[#0A0F1C] to-[#0f172a]"></div>
        <div className="login-success-card animate-fade-in">
          <div className="login-header">
            <div className="logo-container">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-glow animate-pulse">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-black mt-6 tracking-tight bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent">
              ¡Cuenta Creada!
            </h1>
            <p className="text-[var(--text-muted)] mt-2 font-medium animate-pulse">
              Preparando tu espacio de trabajo...
            </p>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="text-sm">Empresa registrada</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="text-sm">Controles ISO 27001 cargados</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="text-sm">Listo para operar</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page-spline">
      <div className="login-background-3d bg-gradient-to-br from-emerald-900/20 via-[#0A0F1C] to-[#0f172a]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] via-transparent to-transparent pointer-events-none"></div>
      </div>
      
      <div className="login-card-spline animate-fade-in stagger-2">
        <div className="login-header">
          <div className="logo-container">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-glow">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-black mt-6 tracking-tight">
            {mode === 'login' ? 'vCISO' : 'Crear Cuenta'}
          </h1>
          <p className="text-[var(--text-muted)] mt-1 text-sm">
            {mode === 'login' ? 'Gestión de cumplimiento ISO 27001' : 'Comienza tu camino hacia la certificación'}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm mb-6 flex items-center gap-3 animate-slide-in">
            <Info className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {(mode === 'register') && (
            <>
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                  <input 
                    type="text" 
                    className="form-control pl-12" 
                    required
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Empresa</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                  <input 
                    type="text" 
                    className="form-control pl-12" 
                    required
                    placeholder="Nombre de tu empresa"
                    value={formData.companyName}
                    onChange={e => setFormData({...formData, companyName: e.target.value})}
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Correo</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input 
                type="email" 
                className="form-control pl-12" 
                required
                placeholder="correo@ejemplo.com"
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
          </div>

          <button 
            type="submit" 
            className={`btn btn-primary w-full py-3 text-base font-bold shadow-glow flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="login-footer pt-6 mt-6 border-t border-[var(--border-color)]">
          {mode === 'login' ? (
            <p className="text-center text-[var(--text-muted)] text-sm">
              ¿No tienes cuenta?{' '}
              <button onClick={() => handleModeSwitch('register')} className="text-emerald-400 font-bold hover:underline">
                Crear cuenta
              </button>
            </p>
          ) : (
            <p className="text-center text-[var(--text-muted)] text-sm">
              ¿Ya tienes cuenta?{' '}
              <button onClick={() => handleModeSwitch('login')} className="text-emerald-400 font-bold hover:underline">
                Iniciar sesión
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
