import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthView from './components/AuthView';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import AdminConsole from './components/AdminConsole';
import ToastList from './components/ToastList';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'admin'

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#0a0d16',
        color: '#f8fafc',
        fontFamily: "'Outfit', sans-serif"
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid rgba(0, 212, 255, 0.1)',
          borderTopColor: '#00d4ff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1.5rem'
        }} />
        <h3 style={{ fontWeight: 600, letterSpacing: '0.05em' }}>VERIFYING SECURE PROTOCOLS...</h3>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-container">
        <div className="ambient-glow glow-primary" />
        <div className="ambient-glow glow-secondary" />
        <AuthView />
        <ToastList />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Background Orbs */}
      <div className="ambient-glow glow-primary" />
      <div className="ambient-glow glow-secondary" />

      {/* Navigation Layer */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace Workspace */}
      <main className="dashboard-main">
        {activeTab === 'admin' && user.role === 'ADMIN' ? (
          <AdminConsole />
        ) : (
          <DashboardView />
        )}
      </main>

      {/* Global Message Core */}
      <ToastList />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
