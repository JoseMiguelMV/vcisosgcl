import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, CheckSquare, ShieldAlert, FileText, Settings, ShieldCheck, Users, Globe, Building } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

function Sidebar({ mobileOpen }) {
  const { user, company } = useAppContext();
  
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
    { name: 'Mapa de Ruta', icon: <Map className="w-5 h-5" />, path: '/roadmap' },
    { name: 'Cumplimiento', icon: <CheckSquare className="w-5 h-5" />, path: '/compliance' },
    { name: 'Gestión de Riesgos', icon: <ShieldAlert className="w-5 h-5" />, path: '/risks' },
    { name: 'Incidentes', icon: <ShieldCheck className="w-5 h-5 cursor-pointer" />, path: '/incidents' },
    { name: 'Repositorio', icon: <FileText className="w-5 h-5 cursor-pointer" />, path: '/documents' },
    { name: 'Reportes', icon: <FileText className="w-5 h-5" />, path: '/reports' },
  ];

  if (user?.role === 'SUPER_ADMIN') {
    menuItems.push({ name: 'Consola Global', icon: <Globe className="w-5 h-5" />, path: '/superadmin' });
  } else if (user?.role === 'ADMIN') {
    menuItems.push({ name: 'Administración', icon: <Users className="w-5 h-5" />, path: '/administration' });
  }

  menuItems.push({ name: 'Configuración', icon: <Settings className="w-5 h-5" />, path: '/settings' });

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-logo">
          <ShieldCheck className="brand-icon" />
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight uppercase tracking-tighter">vCISO Saas</span>
            <span className="text-[9px] text-[var(--brand-primary)] font-black uppercase tracking-widest leading-none">
              Portal de Cumplimiento
            </span>
          </div>
        </div>
      </div>

      {company?.name && (
        <div className="px-5 py-3 mb-4 mx-3 rounded-xl bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.1)] flex items-center gap-3 animate-slide-in">
           <div className="p-2 rounded-lg bg-[var(--brand-primary)] shadow-glow-sm">
             <Building className="w-4 h-4 text-white" />
           </div>
           <div className="flex flex-col overflow-hidden">
             <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-tight">Organización</span>
             <span className="text-xs font-bold text-[var(--text-primary)] truncate">{company.name}</span>
           </div>
        </div>
      )}
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item group ${isActive ? 'active' : ''}`}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${item.name === 'Consola Global' ? 'text-[var(--brand-warning)]' : 'group-hover:bg-[rgba(255,255,255,0.05)]'}`}>
              {item.icon}
            </div>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] px-3 font-mono opacity-50 uppercase tracking-widest">
          <span>SaaS v2.1.0</span>
          <span>Soporte</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
