import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Search, User, Moon, Sun, Menu, LogOut, ChevronDown, Building } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

function Layout() {
  const { theme, toggleTheme, user, company, logout } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <div className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />
      <Sidebar mobileOpen={mobileOpen} />
      
      <main className="main-content">
        <header className="top-header">
          <div className="flex items-center gap-6">
            <button className="icon-button lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="header-search hidden sm:flex">
              <Search className="search-icon" />
              <input type="text" placeholder="Buscar controles o incidentes..." />
            </div>
          </div>
          
          <div className="header-actions">
            {/* Improved Organization Indicator */}
            <div className="hidden md:flex items-center gap-3 mr-6 px-4 py-1.5 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
               <div className="flex flex-col items-end leading-none">
                  <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Entorno Activo</span>
                  <span className="text-xs font-black text-white uppercase tracking-tighter truncate max-w-[120px]">
                    {company?.name || '---'}
                  </span>
               </div>
               <div className={`p-1.5 rounded-lg ${company?.name === 'SISTEMA' ? 'bg-[var(--brand-warning)]' : 'bg-[var(--brand-primary)]'} shadow-glow-sm`}>
                  <Building className="w-3.5 h-3.5 text-white" />
               </div>
            </div>

            <button className="icon-button" onClick={toggleTheme} title="Cambiar Tema Visual">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button className="icon-button relative">
              <Bell className="w-5 h-5 text-[var(--text-secondary)]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--brand-danger)] rounded-full animate-pulse border border-[var(--bg-secondary)]"></span>
            </button>

            <div className="h-6 w-[1px] bg-[var(--border-color)] mx-2 opacity-50"></div>

            <div className="relative">
              <div 
                className="user-profile cursor-pointer hover:bg-[rgba(255,255,255,0.05)] p-1.5 rounded-xl transition-all border border-transparent hover:border-[rgba(255,255,255,0.1)] active:scale-95"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="avatar w-9 h-9 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-info)] text-white font-black shadow-glow-sm">
                   {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="user-info hidden lg:flex">
                  <span className="user-name text-sm font-black text-white">{user?.name || 'Identity Logged'}</span>
                  <span className={`user-role flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${user?.role === 'SUPER_ADMIN' ? 'text-[var(--brand-warning)]' : 'text-[var(--text-muted)]'}`}>
                    {user?.role || 'Guest'}
                    <ChevronDown className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 mt-3 w-56 card p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl z-50 animate-fade-in origin-top-right">
                    <div className="px-3 py-2 border-b border-[var(--border-color)] mb-3 bg-[rgba(255,255,255,0.02)] rounded-lg">
                       <p className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest leading-none mb-1">Sesión para:</p>
                       <p className="text-xs font-bold truncate text-white">{user?.email}</p>
                    </div>
                    <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3 p-3 text-sm font-bold text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-xl transition-all mb-1">
                       <User className="w-4 h-4" /> Mi Perfil
                    </button>
                    <button 
                      className="w-full flex items-center gap-3 p-3 text-sm font-bold text-[var(--brand-danger)] hover:bg-[rgba(239,68,68,0.1)] rounded-xl transition-all"
                      onClick={handleLogout}
                    >
                       <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="page-container p-6 lg:p-10 animate-fade-in overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
