import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/billingService';
import { Zap, ShieldCheck, UserCheck } from 'lucide-react';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Safe first Admin account creation modal
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');
  const [adminModalError, setAdminModalError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter both username/consumer number and password');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(username.trim(), password);
      if (user.role === 'ADMIN') {
        navigate('/dashboard');
      } else {
        navigate('/consumer-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminModalError('');
    setAdminSuccess('');

    if (!newAdminUser.trim() || newAdminPass.length < 6) {
      setAdminModalError('Username is required and password must be at least 6 characters');
      return;
    }

    try {
      await authService.registerAdmin({
        username: newAdminUser.trim(),
        password: newAdminPass,
      });
      setAdminSuccess(`Admin account '${newAdminUser}' created successfully! You can now log in.`);
      setUsername(newAdminUser);
      setPassword(newAdminPass);
      setTimeout(() => setShowAdminModal(false), 1500);
    } catch (err: any) {
      setAdminModalError(err.message || 'Failed to create admin account');
    }
  };

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="login-emblem">
            <Zap size={28} />
          </div>
          <h1 className="login-title">Electricity Billing System</h1>
          <p className="login-subtitle">State Electricity Distribution Corporation Ltd.</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {adminSuccess && <Alert type="success" message={adminSuccess} />}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username or Consumer Number
            </label>
            <input
              id="username"
              type="text"
              className="form-control"
              placeholder="e.g. admin or CUST1001"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Enter your account password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8 }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div className="demo-credentials-box">
          <div className="demo-credentials-title">Quick Demo Login Shortcuts:</div>
          <p style={{ color: '#64748b', fontSize: 11.5, marginBottom: 8 }}>
            Click either button below to pre-fill test credentials for college presentation:
          </p>
          <div className="demo-btn-group">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
              onClick={() => fillCredentials('admin', 'admin123')}
            >
              <ShieldCheck size={14} />
              <span>Admin (admin)</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
              onClick={() => fillCredentials('CUST1001', 'pass123')}
            >
              <UserCheck size={14} />
              <span>Consumer (CUST1001)</span>
            </button>
          </div>
        </div>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12 }}>
          <button
            type="button"
            onClick={() => setShowAdminModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-blue)',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '12px',
            }}
          >
            Create / Register First Admin Account
          </button>
        </div>
      </div>

      {/* Safe Admin Registration Modal */}
      <Modal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        title="Provision Admin Account"
      >
        <form onSubmit={handleCreateAdmin}>
          {adminModalError && <Alert type="error" message={adminModalError} />}
          {adminSuccess && <Alert type="success" message={adminSuccess} />}

          <p style={{ fontSize: 13, color: '#475569', marginBottom: 14 }}>
            Use this safe setup form to initialize or register an administrator account with Spring Security BCrypt hashing.
          </p>

          <div className="form-group">
            <label className="form-label">
              Admin Username <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. sysadmin"
              value={newAdminUser}
              onChange={(e) => setNewAdminUser(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Admin Password <span className="required">*</span>
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="Minimum 6 characters"
              value={newAdminPass}
              onChange={(e) => setNewAdminPass(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowAdminModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Admin
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
