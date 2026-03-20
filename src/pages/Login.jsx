import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Building, User, ArrowRight, Settings } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

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
      } else if (mode === 'superadmin_login') {
        await login(formData.email, formData.password, ''); // SuperAdmin logs in without company or 'SISTEMA'
      } else {
        await login(formData.email, formData.password, formData.companyName);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error en la autenticación. Verifique sus datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] overflow-hidden relative">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[rgba(16,185,129,0.05)] rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[rgba(14,165,233,0.05)] rounded-full blur-[100px]" />

      <div className="card w-full max-w-md p-8 animate-fade-in relative z-10 border-[rgba(255,255,255,0.05)] backdrop-blur-md bg-[rgba(15,23,42,0.8)]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-[rgba(16,185,129,0.1)] text-[var(--brand-primary)] mb-4">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            {mode.startsWith('superadmin') ? 'Acceso de Sistema' : 'SGCS Chile'}
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            {mode.startsWith('superadmin') ? 'Panel de Control Root' : 'vCISO Sistema de Gestión Multi-Empresa'}
          </p>
        </div>

        {error && (
          <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[var(--brand-danger)] p-4 rounded-lg mb-6 text-sm flex items-start gap-3">
             <Info className="w-5 h-5 flex-shrink-0" />
             {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode !== 'superadmin_setup' && mode !== 'superadmin_login' && (
            <div className="form-group">
              <label className="form-label">Nombre de la Empresa</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  name="companyName"
                  className="form-control pl-12"
                  placeholder="Ej: InnovaCorp SPA"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {(mode === 'register' || mode === 'superadmin_setup') && (
            <div className="form-group animate-fade-in">
              <label className="form-label">Tu Nombre</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  name="name"
                  className="form-control pl-12"
                  placeholder="Juan Pérez"
                  required
                  value={formData.name}
                  onChange={handleChange}
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
                name="email"
                className="form-control pl-12"
                placeholder="usuario@empresa.cl"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="password"
                name="password"
                className="form-control pl-12"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={`btn ${mode.startsWith('superadmin') ? 'btn-warning' : 'btn-primary'} w-full py-4 text-lg shadow-glow mt-6`}
            disabled={loading}
          >
            {loading ? 'Procesando...' : 
             mode === 'register' ? 'Registrar Empresa' : 
             mode === 'superadmin_setup' ? 'Configurar Sistema' : 
             'Ingresar al Sistema'}
            {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.05)] flex flex-col gap-4 text-center">
          <div className="text-sm">
            <span className="text-[var(--text-muted)]">
              {mode === 'login' ? '¿Quieres registrar tu empresa?' : '¿Ya tienes una cuenta?'}
            </span>
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="ml-2 font-bold text-[var(--brand-primary)] hover:underline"
            >
              {mode === 'login' ? 'Crea una cuenta aquí' : 'Inicia Sesión'}
            </button>
          </div>

          <button
            onClick={() => setMode(mode === 'superadmin_login' ? 'login' : 'superadmin_login')}
            className="text-xs text-[var(--text-muted)] flex items-center justify-center gap-2 hover:text-white"
          >
            <Settings className="w-3 h-3" />
            {mode === 'superadmin_login' ? 'Volver al ingreso normal' : 'Acceso Administrador de Aplicativo'}
          </button>
          
          {mode === 'superadmin_login' && (
            <button
              onClick={() => setMode('superadmin_setup')}
              className="text-[10px] text-[var(--brand-warning)] opacity-70 hover:opacity-100"
            >
              Instalar Administrador Inicial (Solo primera vez)
            </button>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-8 text-center w-full">
        <p className="text-xs text-[var(--text-muted)] opacity-50">
          SGCS Chile v2.0 SaaS - Control Multi-Tenant Root enabled
        </p>
      </div>
    </div>
  );
}

const Info = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
);

export default Login;
