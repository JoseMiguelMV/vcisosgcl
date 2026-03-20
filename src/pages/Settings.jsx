import React, { useState } from 'react';
import { User, Shield, Building, Bell, Globe, Key, Settings as SettingsIcon, CreditCard, CheckCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

function Settings() {
  const { theme, toggleTheme, company, setCompany } = useAppContext();
  const [activeTab, setActiveTab] = useState('org'); // Default to org for onboarding

  const handleCompanyChange = (field, value) => {
    setCompany(prev => ({
      ...prev,
      [field]: value,
      configured: true
    }));
  };

  return (
    <div className="animate-fade-in stagger-2">
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuración del SGSI</h1>
          <p className="page-subtitle">Ajustes de Perfil, Organización y Seguridad</p>
        </div>
        <button className="btn btn-primary">
          <SettingsIcon className="w-5 h-5"/> Guardar Cambios
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 flex flex-col gap-2">
          <div className="card p-2 flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab('perfil')}
              className={`flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'perfil' ? 'bg-[rgba(16,185,129,0.1)] text-[var(--brand-primary)]' : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
            >
               <User className="w-5 h-5" /> Mi Perfil
            </button>
            <button 
               onClick={() => setActiveTab('org')}
              className={`flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'org' ? 'bg-[rgba(16,185,129,0.1)] text-[var(--brand-primary)]' : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
            >
               <Building className="w-5 h-5" /> Organización y Sedes
            </button>
            <button 
               onClick={() => setActiveTab('roles')}
              className={`flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'roles' ? 'bg-[rgba(16,185,129,0.1)] text-[var(--brand-primary)]' : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
            >
               <Shield className="w-5 h-5" /> Roles y Permisos
            </button>
            <button 
               onClick={() => setActiveTab('plan')}
              className={`flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'plan' ? 'bg-[rgba(16,185,129,0.1)] text-[var(--brand-primary)]' : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
            >
               <CreditCard className="w-5 h-5" /> Plan y Facturación
            </button>
             <button 
               onClick={() => setActiveTab('preferencias')}
              className={`flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'preferencias' ? 'bg-[rgba(16,185,129,0.1)] text-[var(--brand-primary)]' : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
            >
               <Globe className="w-5 h-5" /> Preferencias y Notificaciones
            </button>
          </div>
        </div>

        <div className="flex-1 card min-h-[500px] p-8 relative">
           
          {activeTab === 'perfil' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold mb-6 border-b pb-4 border-[var(--border-color)] flex items-center gap-2"><User className="text-[var(--brand-primary)]"/> Información Personal</h2>
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                  CM
                </div>
                <div>
                  <button className="btn btn-outline text-sm py-1 mb-2">Cambiar Foto</button>
                  <p className="text-xs text-[var(--text-muted)]">JPG o PNG, máx 2MB</p>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <input type="text" className="form-control" defaultValue="Carlos Martínez" />
                </div>
                <div className="form-group">
                  <label className="form-label">Cargo / Rol principal</label>
                  <input type="text" className="form-control text-[var(--text-muted)] bg-[var(--bg-primary)] border-[transparent]" disabled defaultValue="CISO (Chief Information Security Officer)" />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input type="email" className="form-control" defaultValue="cmartinez@empresa.cl" />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono (Emergencias)</label>
                  <input type="tel" className="form-control" defaultValue="+56 9 1234 5678" />
                </div>
              </div>

              <div className="mt-8 p-4 border rounded-md border-[var(--border-color)] bg-[var(--bg-primary)]">
                <h3 className="font-bold flex items-center gap-2 mb-4"><Key className="w-4 h-4 text-[var(--text-muted)]"/> Seguridad de la Cuenta</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-sm">Autenticación Multifactor (MFA)</h4>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Obligatorio por A.9.4.2 (ISO 27001). Proteja su cuenta con un código temporal.</p>
                  </div>
                  <button className="badge badge-success cursor-pointer">Activo</button>
                </div>
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-[var(--border-color)]">
                   <div>
                    <h4 className="font-medium text-sm">Contraseña</h4>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Última actualización hace 15 días.</p>
                  </div>
                  <button className="btn btn-outline py-1 px-3 text-sm">Actualizar</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'org' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold mb-6 border-b pb-4 border-[var(--border-color)] flex items-center gap-2"><Building className="text-[var(--brand-primary)]"/> Datos de la Organización</h2>
              
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Razón Social</label>
                  <input type="text" className="form-control" placeholder="Ej. Tu Empresa Nombre" value={company.name} onChange={e => handleCompanyChange('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">RUT</label>
                  <input type="text" className="form-control" placeholder="Ej. 76.123.456-7" value={company.rut} onChange={e => handleCompanyChange('rut', e.target.value)} />
                </div>
                <div className="form-group col-span-2">
                  <label className="form-label">Sedes/Sucursales (Alcance del SGSI)</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                     <span className="badge badge-info flex gap-2 items-center">Casa Matriz (Santiago) <button className="hover:text-white">&times;</button></span>
                     <span className="badge badge-neutral flex gap-2 items-center">Data Center (AWS) <button className="hover:text-white">&times;</button></span>
                     <span className="badge badge-neutral flex gap-2 items-center">Sucursal Viña del Mar <button className="hover:text-white">&times;</button></span>
                  </div>
                  <div className="flex gap-2">
                     <input type="text" className="form-control w-1/2" placeholder="Nueva sede..." />
                     <button className="btn btn-outline">Agregar Sede</button>
                  </div>
                </div>
                 <div className="form-group col-span-2 mt-4">
                  <label className="form-label">Responsable Legal (Para Notificaciones ley 19.628 / 21.459)</label>
                  <input type="email" className="form-control" defaultValue={company.legalContact} onChange={e => handleCompanyChange('legalContact', e.target.value)} placeholder="legal@empresa.cl" />
                  <p className="text-xs mt-2 text-[var(--text-muted)]">Este correo recibirá el exportable cuando se levante un incidente grave con plazo legal.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferencias' && (
             <div className="animate-fade-in">
              <h2 className="text-xl font-bold mb-6 border-b pb-4 border-[var(--border-color)] flex items-center gap-2"><Globe className="text-[var(--brand-primary)]"/> Preferencias y Notificaciones</h2>
              
              <div className="form-group max-w-md">
                 <label className="form-label mb-4">Apariencia del Sistema</label>
                 <div className="flex items-center justify-between p-4 rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex justify-center items-center">
                         {theme === 'dark' ? <span className="text-white">🌙</span> : <span className="text-black">☀️</span>}
                      </div>
                      <div>
                        <p className="font-medium text-sm">Tema {theme === 'dark' ? 'Oscuro' : 'Claro'}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">Protege tu vista en ambientes con poca luz.</p>
                      </div>
                    </div>
                    <button className="btn btn-outline text-sm py-1" onClick={toggleTheme}>Cambiar</button>
                 </div>
              </div>

               <div className="form-group max-w-md mt-8">
                 <label className="form-label mb-4"><Bell className="inline w-4 h-4 mr-1"/> Alertas del Sistema</label>
                 
                 <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--bg-tertiary)] focus:ring-[var(--brand-primary)] accent-[var(--brand-primary)]" />
                    <div>
                      <span className="text-sm font-medium">Alertas de Vencimiento Normativo</span>
                      <p className="text-xs text-[var(--text-muted)]">Avisos 30 días antes de auditorías o caducidad documental.</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--bg-tertiary)] focus:ring-[var(--brand-primary)] accent-[var(--brand-primary)]" />
                     <div>
                      <span className="text-sm font-medium">Incidentes Críticos Inmediatos</span>
                      <p className="text-xs text-[var(--text-muted)]">Notificación Push / Email inmediata al levantar un ticket rojo.</p>
                    </div>
                  </label>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'plan' && (
             <div className="animate-fade-in">
              <h2 className="text-xl font-bold mb-6 border-b pb-4 border-[var(--border-color)] flex items-center gap-2"><CreditCard className="text-[var(--brand-primary)]"/> Plan y Facturación</h2>
              
              <div className="flex justify-between items-center p-6 bg-gradient-to-r from-[rgba(16,185,129,0.1)] to-[rgba(59,130,246,0.1)] rounded-lg border border-[var(--brand-primary)] mb-8">
                 <div>
                   <h3 className="font-bold text-lg flex items-center gap-2">Plan Actual: <span className="badge badge-success px-4 py-1 text-sm bg-[var(--brand-primary)] text-white">PRO</span></h3>
                   <p className="text-sm text-[var(--text-secondary)] mt-2">15 Usuarios • Almacenamiento S3 (50GB) • Soporte Email</p>
                   <p className="text-xs text-[var(--text-muted)] mt-1">Próxima facturación: 01 Abril 2026 - $149 USD/mes</p>
                 </div>
                 <button className="btn btn-outline border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition-colors">Administrar Suscripción</button>
              </div>

              <h3 className="font-bold mb-4 text-sm uppercase text-[var(--text-muted)]">Opciones de Mejora (Upgrade)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="card p-6 border-2 border-[transparent] relative opacity-50 hover:opacity-100 transition-opacity cursor-not-allowed">
                  <div className="mb-4">
                    <h4 className="font-bold text-xl mb-1">Plan PRO</h4>
                    <p className="font-mono text-2xl font-bold">$149<span className="text-sm text-[var(--text-muted)] font-sans">/mes</span></p>
                  </div>
                  <ul className="text-sm space-y-3 text-[var(--text-secondary)] mb-6">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[var(--brand-success)]"/> Hasta 15 Usuarios / Administradores</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[var(--brand-success)]"/> Cumplimiento Ley 19.628 y 21.459</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[var(--brand-success)]"/> Bitácora de incidentes estándar</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[var(--brand-success)]"/> Repositorio Documental hasta 50GB</li>
                  </ul>
                  <button className="btn btn-outline w-full" disabled>Plan Actual</button>
                </div>

                <div className="card p-6 border-2 border-[var(--brand-info)] relative shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <div className="absolute top-0 right-0 bg-[var(--brand-info)] text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-sm">RECOMENDADO</div>
                  <div className="mb-4">
                    <h4 className="font-bold text-xl mb-1 text-[var(--brand-info)]">Plan ENTERPRISE</h4>
                    <p className="font-mono text-2xl font-bold">Plan a Medida</p>
                    <p className="text-xs text-[var(--brand-info)] mt-1">Contactar con Ventas</p>
                  </div>
                  <ul className="text-sm space-y-3 text-[var(--text-secondary)] mb-6">
                    <li className="flex items-center gap-2 font-medium text-[var(--text-primary)]"><CheckCircle className="w-4 h-4 text-[var(--brand-info)]"/> Todo lo del Plan PRO, y además:</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[var(--brand-info)]"/> Bitácora inalterable blockchain QLDB + Integración ISO 27001</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[var(--brand-info)]"/> Automatización vía API (SIEM / SOC Integración)</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[var(--brand-info)]"/> Espacio Ilimitado + Cifrado KMS dedicado</li>
                  </ul>
                  <button className="btn btn-primary w-full bg-gradient-to-r from-[var(--brand-info)] to-[var(--brand-secondary)] hover:shadow-lg">Solicitar Upgrade a Enterprise</button>
                </div>

              </div>

             </div>
          )}
          
          {activeTab === 'roles' && (
             <div className="animate-fade-in flex flex-col items-center justify-center p-12 text-center h-full opacity-60">
                 <Shield className="w-16 h-16 text-[var(--text-muted)] mb-4" />
                 <h3 className="font-bold text-lg mb-2">Módulo Restringido</h3>
                 <p className="text-sm text-[var(--text-secondary)] max-w-md">La modificación de roles y permisos base solo puede ser realizada por el "Super Admin" del cluster.</p>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Settings;
