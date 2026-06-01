import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Shield, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

const AuthView = () => {
  const { login, register } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('USER');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (isLoginView) {
      await login(email, password);
    } else {
      await register(email, password, name, role);
    }
    setSubmitting(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isLoginView ? 'Welcome Back' : 'Join ZenTask'}</h2>
          <p>{isLoginView ? 'Sign in to access your dashboard' : 'Create a secure account to organize your tasks'}</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLoginView && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-container">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLoginView}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-container">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                className="input-field"
                placeholder="alex@zentask.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-container">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="action-btn"
                style={{ position: 'absolute', right: '1rem', opacity: 0.7 }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {!isLoginView && (
            <div className="form-group">
              <label className="form-label">Account Role (For Evaluation Testing)</label>
              <div className="input-container">
                <Shield className="input-icon" size={18} />
                <select className="input-field" style={{ appearance: 'none', cursor: 'pointer' }} value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="USER">Regular User</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: '1rem' }}>
            {submitting ? (
              <span>Processing...</span>
            ) : isLoginView ? (
              <>
                <LogIn size={18} /> Sign In
              </>
            ) : (
              <>
                <UserPlus size={18} /> Register Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          {isLoginView ? (
            <span>
              Don't have an account?{' '}
              <span className="auth-link" onClick={() => setIsLoginView(false)}>
                Register here
              </span>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <span className="auth-link" onClick={() => setIsLoginView(true)}>
                Sign in instead
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthView;
