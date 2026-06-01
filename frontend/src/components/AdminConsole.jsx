import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, ShieldAlert, Trash2, Calendar, Mail, FileSpreadsheet, Layers } from 'lucide-react';

const AdminConsole = () => {
  const { token, showToast, apiUrl, user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiUrl}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user profiles.');
      }
      setUsers(data.users);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`${apiUrl}/auth/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user role.');
      }
      showToast(data.message, 'success');
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? All their associated tasks will be permanently removed.')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user.');
      }
      showToast(data.message, 'success');
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  // Metrics calculators
  const totalUsers = users.length;
  const totalTasks = users.reduce((acc, u) => acc + (u._count?.tasks || 0), 0);
  const avgTasks = totalUsers > 0 ? (totalTasks / totalUsers).toFixed(1) : 0;
  const totalAdmins = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div style={{ animation: 'slideUp var(--transition-normal)' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Administrative Control Center</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem' }}>
          Manage global user access privileges, update account permissions, and audit platform resource metrics.
        </p>
      </div>

      {/* Admin KPI Panel */}
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-info">
            <h4>Platform Users</h4>
            <div className="metric-val">{totalUsers}</div>
          </div>
          <div className="metric-icon-wrapper cyan">
            <Users size={22} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h4>Global Task Capacity</h4>
            <div className="metric-val">{totalTasks}</div>
          </div>
          <div className="metric-icon-wrapper green">
            <Layers size={22} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h4>Average Tasks/User</h4>
            <div className="metric-val">{avgTasks}</div>
          </div>
          <div className="metric-icon-wrapper amber">
            <FileSpreadsheet size={22} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h4>Admin Controllers</h4>
            <div className="metric-val">{totalAdmins}</div>
          </div>
          <div className="metric-icon-wrapper coral">
            <ShieldAlert size={22} />
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--glass-shadow)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Registered User Profiles</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--text-secondary))' }}>
            <span>Retrieving secure ledger entries...</span>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--text-secondary))' }}>
            No registered users found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Email Address</th>
                  <th>Access Tier</th>
                  <th>System Created</th>
                  <th>Task Load</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700 }}>{user.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))' }}>{user.id}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem' }}>
                        <Mail size={12} style={{ opacity: 0.6 }} />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td>
                      <select
                        className="role-select-box"
                        value={user.role}
                        disabled={user.id === currentAdmin.id}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        style={{
                          fontWeight: 700,
                          color: user.role === 'ADMIN' ? 'hsl(var(--color-warning))' : 'hsl(var(--color-primary))'
                        }}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                        <Calendar size={12} />
                        <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user._count?.tasks || 0} tasks</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="action-btn delete"
                        disabled={user.id === currentAdmin.id}
                        style={{ opacity: user.id === currentAdmin.id ? 0.3 : 1 }}
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete User & Tasks"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminConsole;
