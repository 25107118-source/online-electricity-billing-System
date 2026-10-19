import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getActiveModePreference,
  setActiveModePreference,
  checkBackendHealth,
} from '../services/billingService';
import { LogOut, Zap, RefreshCw, Server, CheckCircle2, AlertCircle, Terminal, Copy } from 'lucide-react';
import { Modal } from './Modal';
import { Alert } from './Alert';

export const Navbar: React.FC = () => {
  const { user, logout, backendOnline, checkStatus } = useAuth();
  const [checking, setChecking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState('');
  const [modePref, setModePref] = useState<'AUTO' | 'FORCE_SPRING' | 'DEMO'>(getActiveModePreference());

  const handleRefresh = async () => {
    setChecking(true);
    await checkStatus();
    setTimeout(() => setChecking(false), 400);
  };

  const handleModeChange = (mode: 'AUTO' | 'FORCE_SPRING' | 'DEMO') => {
    setModePref(mode);
    setActiveModePreference(mode);
    handleRefresh();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(''), 2000);
  };

  return (
    <>
      <header className="gov-navbar">
        <div className="brand-section">
          <div className="brand-emblem" title="State Electricity Distribution Board">
            <Zap size={20} />
          </div>
          <div>
            <div className="brand-title">State Electricity Distribution Board</div>
            <div className="brand-subtitle">Online Utility Billing & Revenue Management Portal</div>
          </div>
        </div>

        <div className="nav-user-controls">
          {/* Clickable Localhost Status Badge */}
          <div
            onClick={() => setShowModal(true)}
            className="backend-indicator"
            style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
            title="Click to configure Localhost Spring Boot Backend Connection"
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: backendOnline ? '#16a34a' : '#d97706',
                display: 'inline-block',
              }}
            />
            <span style={{ fontWeight: 600 }}>
              {backendOnline ? 'Spring Boot Active (:8080)' : 'In-Browser Demo Mode'}
            </span>
            <Server size={12} color="#64748b" style={{ marginLeft: 2 }} />
          </div>

          {user && (
            <div className="user-badge-info">
              <span className={`role-tag ${user.role.toLowerCase()}`}>
                {user.role}
              </span>
              <span style={{ fontWeight: 600, color: '#334155' }}>
                {user.consumerNumber ? `Consumer: ${user.consumerNumber}` : user.username}
              </span>
              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: 8 }}
                title="Sign Out"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Localhost Connection & Setup Assistant Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Localhost Backend Connection Assistant"
        maxWidth="620px"
      >
        <div>
          {/* Connection status banner */}
          <div
            style={{
              padding: 12,
              borderRadius: 4,
              marginBottom: 16,
              backgroundColor: backendOnline ? '#f0fdf4' : '#fffbeb',
              border: `1px solid ${backendOnline ? '#bbf7d0' : '#fde68a'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {backendOnline ? (
                <CheckCircle2 size={22} color="#15803d" />
              ) : (
                <AlertCircle size={22} color="#b45309" />
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: backendOnline ? '#166534' : '#92400e' }}>
                  {backendOnline
                    ? 'Connected to Spring Boot on http://localhost:8080/api'
                    : 'Spring Boot Backend is Offline on port 8080'}
                </div>
                <div style={{ fontSize: 12, color: backendOnline ? '#15803d' : '#b45309' }}>
                  {backendOnline
                    ? 'All database transactions are executing live in Java Spring Boot!'
                    : 'The application is running in In-Browser Demo mode (full functionality with local storage).'}
                </div>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="btn btn-secondary btn-sm"
              disabled={checking}
              title="Test connection to localhost:8080"
            >
              <RefreshCw size={13} className={checking ? 'animate-spin' : ''} />
              <span>{checking ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          {/* Mode Preference Selector */}
          <div style={{ marginBottom: 16 }}>
            <label className="form-label" style={{ marginBottom: 6 }}>
              Backend Connection Preference:
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className={`btn btn-sm ${modePref === 'AUTO' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleModeChange('AUTO')}
                style={{ flex: 1 }}
              >
                Auto Detect (Recommended)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${modePref === 'FORCE_SPRING' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleModeChange('FORCE_SPRING')}
                style={{ flex: 1 }}
              >
                Force Spring Boot (8080)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${modePref === 'DEMO' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleModeChange('DEMO')}
                style={{ flex: 1 }}
              >
                Force In-Browser Demo
              </button>
            </div>
          </div>

          {/* Quick Terminal Run Commands */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Terminal size={15} />
              <span>How to start the Java Backend on your Localhost:</span>
            </div>

            {/* Option A: With H2 In-Memory (Zero MySQL install needed) */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4, padding: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Option 1: Instant Start with H2 In-Memory DB (No MySQL install needed):
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', color: '#f8fafc', padding: '6px 10px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                <span>cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=h2</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=h2', 'h2')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
                  title="Copy command"
                >
                  {copiedCmd === 'h2' ? <span style={{ color: '#4ade80', fontSize: 11 }}>Copied!</span> : <Copy size={13} />}
                </button>
              </div>
            </div>

            {/* Option B: With MySQL */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4, padding: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Option 2: With MySQL Database (Database: electricity_db):
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', color: '#f8fafc', padding: '6px 10px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                <span>cd backend && mvn clean spring-boot:run</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('cd backend && mvn clean spring-boot:run', 'mysql')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
                  title="Copy command"
                >
                  {copiedCmd === 'mysql' ? <span style={{ color: '#4ade80', fontSize: 11 }}>Copied!</span> : <Copy size={13} />}
                </button>
              </div>
            </div>

            {/* Starting the Frontend */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4, padding: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Frontend (Port 3000):
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', color: '#f8fafc', padding: '6px 10px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                <span>npm install && npm run dev</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('npm install && npm run dev', 'frontend')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
                  title="Copy command"
                >
                  {copiedCmd === 'frontend' ? <span style={{ color: '#4ade80', fontSize: 11 }}>Copied!</span> : <Copy size={13} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
