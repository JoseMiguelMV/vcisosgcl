import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Search, User, Moon, Sun, Menu } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

function Layout() {
  const { theme, toggleTheme } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-container">
      <div className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />
      <Sidebar mobileOpen={mobileOpen} closeMobile={() => setMobileOpen(false)} />
      
      <main className="main-content">
        <header className="top-header">
          <div className="flex items-center gap-4">
            <button className="icon-button lg:hidden" onClick={() => setMobileOpen(true)} style={{ display: 'none' /* handled via CSS media queries normally */ }}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="header-search">
              <Search className="search-icon" />
              <input type="text" placeholder="Buscar controles, activos, incidentes..." />
            </div>
          </div>
          
          <div className="header-actions">
            <button className="icon-button" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="icon-button relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--brand-danger)] rounded-full"></span>
            </button>
            <div className="user-profile">
              <div className="avatar">C</div>
              <div className="user-info hidden md:flex">
                <span className="user-name">CISO Organizacional</span>
                <span className="user-role">Administrador</span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
