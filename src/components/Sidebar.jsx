import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, CheckSquare, ShieldAlert, FileText, Settings, ShieldCheck, Users, Globe, Building, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

function Sidebar({ mobileOpen }) {
  const { user, company, companies, setCompany } = useAppContext();
  
  // Base Menu Items
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
    { name: 'Reports', icon: <FileText className="w-5 h-5" />, path: '/reports' },
    { name: 'Administration', icon: <Users className="w-5 h-5" />, path: '/administration' },
    { name: 'Configuration', icon: <Settings className="w-5 h-5" />, path: '/settings' },
  ];

  // Specific items for standard users but hidden for superadmin if they are in "SISTEMA" context?
  // Actually, the user says: "como super administrador debiese en ese modulo solo tener vistata del dashboard, reportes de la empresas, admnistracion y obviamente configuracion"
  
  if (user?.role === 'SUPER_ADMIN') {
    // Add Global Console at the very TOP
    menuItems.unshift({ name: 'Global Console', icon: <Globe className="w-5 h-5" />, path: '/superadmin' });
  } else {
    // Standard User extra items
    menuItems.splice(1, 0, { name: 'Roadmap', icon: <Map className="w-5 h-5" />, path: '/roadmap' });
    menuItems.splice(2, 0, { name: 'Compliance', icon: <CheckSquare className="w-5 h-5" />, path: '/compliance' });
    menuItems.splice(3, 0, { name: 'Risks', icon: <ShieldAlert className="w-5 h-5" />, path: '/risks' });
    menuItems.splice(4, 0, { name: 'Incidents', icon: <ShieldCheck className="w-5 h-5" />, path: '/incidents' });
    menuItems.splice(5, 0, { name: 'Repository', icon: <FileText className="w-5 h-5" />, path: '/documents' });
  }

  const handleCompanySwitch = (e) => {
    const selectedId = e.target.value;
    const selected = companies.find(c => c.id === selectedId);
    if (selected) {
      setCompany(selected);
      window.localStorage.setItem('sgcs_session_company', JSON.stringify(selected));
      // Reload to ensure all context data is refetched for the NEW company
      window.location.reload();
    }
  };

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-logo">
          <ShieldCheck className="brand-icon" />
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight uppercase tracking-tighter text-white">vCISO Saas</span>
            <span className="text-[9px] text-[var(--brand-primary)] font-black uppercase tracking-widest leading-none">
              Portal de Seguridad
            </span>
          </div>
        </div>
      </div>

      <div className="px-3 mb-6">
        {user?.role === 'SUPER_ADMIN' ? (
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Building className="w-4 h-4 text-[var(--brand-warning)]" />
            </div>
            <select 
              className="w-full bg-[var(--bg-tertiary)] border border-[rgba(245,158,11,0.2)] text-white text-xs font-bold pl-10 pr-8 py-3 rounded-xl appearance-none cursor-pointer focus:ring-1 focus:ring-[var(--brand-warning)] outline-none"
              value={company?.id || ''}
              onChange={handleCompanySwitch}
            >
              <option value="" disabled>Seleccionar Empresa...</option>
              <option value={companies.find(c => c.name === 'SISTEMA')?.id}>[SISTEMA ROOT]</option>
              {companies.filter(c => c.name !== 'SISTEMA').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute inset-y-0 right-3 flex items-center w-4 h-4 text-[var(--text-muted)] pointer-events-none self-center h-full top-0 bottom-0 m-auto" />
            <div className="text-[9px] uppercase font-black tracking-widest text-[var(--brand-warning)] ml-2 mt-1 opacity-60">Filtrar por Empresa</div>
          </div>
        ) : (
          company?.name && (
            <div className="px-4 py-3 rounded-xl bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.1)] flex items-center gap-3 animate-slide-in">
               <div className="p-2 rounded-lg bg-[var(--brand-primary)] shadow-glow-sm">
                 <Building className="w-4 h-4 text-white" />
               </div>
               <div className="flex flex-col overflow-hidden">
                 <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-tight leading-none">Tenant Local</span>
                 <span className="text-xs font-black text-white truncate leading-tight mt-0.5">{company.name}</span>
               </div>
            </div>
          )
        )}
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item group ${isActive ? 'active' : ''}`}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${item.name === 'Global Console' ? 'text-[var(--brand-warning)]' : 'group-hover:bg-[rgba(255,255,255,0.05)]'}`}>
              {item.icon}
            </div>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] px-3 font-mono opacity-50 uppercase tracking-widest mt-auto mb-2">
          <span>SaaS v3.0.0</span>
          <span>© 2026</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
