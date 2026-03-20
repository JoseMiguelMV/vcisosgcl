import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, CheckSquare, ShieldAlert, FileText, Settings, ShieldCheck, Users } from 'lucide-react';

function Sidebar({ mobileOpen }) {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
    { name: 'Mapa de Ruta', icon: <Map className="w-5 h-5" />, path: '/roadmap' },
    { name: 'Cumplimiento', icon: <CheckSquare className="w-5 h-5" />, path: '/compliance' },
    { name: 'Gestión de Riesgos', icon: <ShieldAlert className="w-5 h-5" />, path: '/risks' },
    { name: 'Incidentes', icon: <ShieldCheck className="w-5 h-5" />, path: '/incidents' },
    { name: 'Repositorio', icon: <FileText className="w-5 h-5" />, path: '/documents' },
    { name: 'Reportes', icon: <FileText className="w-5 h-5" />, path: '/reports' },
    { name: 'Administración', icon: <Users className="w-5 h-5" />, path: '/administration' },
    { name: 'Configuración', icon: <Settings className="w-5 h-5" />, path: '/settings' },
  ];

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-logo">
          <ShieldCheck className="brand-icon" />
          <div className="flex flex-col">
            <span className="font-bold">SGCS Chile</span>
            <span className="text-[10px] text-[var(--brand-primary)] uppercase tracking-wider">SaaS Multi-Empresa</span>
          </div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="flex items-center justify-between text-[12px] text-[var(--text-muted)] px-2">
          <span>v2.0 Beta</span>
          <span className="hover:text-white cursor-pointer">Soporte</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
