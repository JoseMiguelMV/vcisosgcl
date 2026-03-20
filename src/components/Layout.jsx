import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Search, User, Moon, Sun, Menu, LogOut, ChevronDown } from 'lucide-react';
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
          <div className="flex items-center gap-4">
            <button className="icon-button lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="header-search">
              <Search className="search-icon" />
              <input type="text" placeholder="Buscar controles o incidentes..." />
            </div>
          </div>
          
          <div className="header-actions">
            <div className="hidden lg:flex flex-col items-end mr-4">
               <span className="text-[10px] text-[var(--brand-primary)] font-bold uppercase tracking-tighter">Empresa Actual</span>
               <span className="text-sm font-semibold truncate max-w-[150px]">{company?.name || 'InnovaCorp'}</span>
            </div>

            <button className="icon-button" onClick={toggleTheme} title="Cambiar Tema">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button className="icon-button relative">
              <Bell className="w-5 h-5 text-[var(--text-secondary)]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--brand-danger)] rounded-full"></span>
            </button>

            <div className="relative">
              <div 
                className="user-profile cursor-pointer hover:bg-[rgba(255,255,255,0.05)] p-1 rounded-lg transition-colors border border-transparent hover:border-[rgba(255,255,255,0.1)]"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="avatar bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-info)] text-white font-bold">
                   {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="user-info hidden md:flex">
                  <span className="user-name">{user?.name || 'Usuario GRC'}</span>
                  <span className="user-role flex items-center gap-1">
                    {user?.role || 'Analista'}
                    <ChevronDown className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 card p-2 bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.1)] shadow-2xl z-50 animate-fade-in translate-y-1">
                    <div className="p-3 border-bottom border-[rgba(255,255,255,0.05)] mb-2">
                       <p className="text-xs text-[var(--text-muted)]">Conectado como:</p>
                       <p className="text-sm font-bold truncate">{user?.email}</p>
                    </div>
                    <button className="w-full flex items-center gap-3 p-3 text-sm text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors">
                       <User className="w-4 h-4" /> Mi Perfil
                    </button>
                    <button 
                      className="w-full flex items-center gap-3 p-3 text-sm text-[var(--brand-danger)] hover:bg-[rgba(239,68,68,0.1)] rounded-lg transition-colors"
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

        <div className="page-container p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
