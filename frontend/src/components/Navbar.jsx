import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, ShieldAlert, Kanban, UserCheck } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout, theme, toggleTheme } = useAuth();

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="brand" onClick={() => setActiveTab('dashboard')}>
        <Kanban size={28} style={{ color: 'hsl(var(--color-primary))' }} />
        <span>ZenTask</span>
      </div>

      {user.role === 'ADMIN' && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`btn-tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            Admin Console
          </button>
        </div>
      )}

      <div className="nav-actions">
        <button className="icon-btn-toggle" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="user-badge">
          {user.role === 'ADMIN' ? (
            <ShieldAlert size={16} style={{ color: 'hsl(var(--color-warning))' }} />
          ) : (
            <UserCheck size={16} style={{ color: 'hsl(var(--color-primary))' }} />
          )}
          <span>{user.name}</span>
          <span className={`badge-role ${user.role.toLowerCase()}`}>{user.role}</span>
        </div>

        <button className="icon-btn-toggle" onClick={logout} title="Log Out">
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
