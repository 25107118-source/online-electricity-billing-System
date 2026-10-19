import React, { useEffect, useState } from 'react';
import { connectionService, consumerService } from '../services/billingService';
import { Connection, Consumer, ConnectionType } from '../types';
import { Cable, PlusCircle, CheckCircle, PowerOff, Filter } from 'lucide-react';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';

export const ConnectionManagement: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Connection Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConsumerId, setSelectedConsumerId] = useState<number>(0);
  const [connType, setConnType] = useState<ConnectionType>('DOMESTIC');
  const [sanctionedLoad, setSanctionedLoad] = useState<number>(2.0);
  const [customMeterNo, setCustomMeterNo] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [conns, cons] = await Promise.all([
        connectionService.getAll(),
        consumerService.getAll(),
      ]);
      setConnections(conns);
      setConsumers(cons);
      if (cons.length > 0) setSelectedConsumerId(cons[0].id);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsumerId) {
      setError('Please select a consumer');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const created = await connectionService.create({
        consumerId: selectedConsumerId,
        connectionType: connType,
        meterNumber: customMeterNo.trim() || undefined,
        sanctionedLoadKw: sanctionedLoad,
      });

      setSuccess(`Connection ${created.connectionNumber} created with Meter #${created.meterNumber}`);
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to create connection');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (conn: Connection) => {
    const nextStatus = conn.status === 'ACTIVE' ? 'DISCONNECTED' : 'ACTIVE';
    const actionLabel = nextStatus === 'ACTIVE' ? 're-energize' : 'disconnect';
    if (!window.confirm(`Are you sure you want to ${actionLabel} connection ${conn.connectionNumber}?`)) {
      return;
    }

    try {
      await connectionService.updateStatus(conn.id, nextStatus);
      setSuccess(`Connection ${conn.connectionNumber} status updated to ${nextStatus}`);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to update connection status');
    }
  };

  const filteredConnections = connections.filter((c) => {
    if (filterType !== 'ALL' && c.connectionType !== filterType) return false;
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Electricity Connection Registry</h1>
          <p className="page-desc">
            Manage power supplies, sanctioned loads, physical meter numbers, and service energization.
          </p>
        </div>
        <div className="page-actions">
          <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-sm">
            <PlusCircle size={14} />
            <span>New Electricity Connection</span>
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Filter Controls */}
      <div className="panel-card" style={{ padding: 14, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={15} color="#64748b" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Filter by Tariff:</span>
            <select
              className="form-control"
              style={{ width: 160, height: 34 }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="DOMESTIC">Domestic</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Connection Status:</span>
            <select
              className="form-control"
              style={{ width: 160, height: 34 }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active (Energized)</option>
              <option value="DISCONNECTED">Disconnected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Connections Table */}
      <div className="panel-card">
        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Connection #</th>
                <th>Consumer Name</th>
                <th>Consumer #</th>
                <th>Tariff Type</th>
                <th>Meter Number</th>
                <th className="num-cell">Sanctioned Load</th>
                <th>Connection Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '24px' }}>
                    Loading connections...
                  </td>
                </tr>
              ) : filteredConnections.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No connections found matching filters.
                  </td>
                </tr>
              ) : (
                filteredConnections.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.connectionNumber}</td>
                    <td>{c.consumerName}</td>
                    <td>{c.consumerNumber}</td>
                    <td>
                      <span className={`status-badge ${c.connectionType.toLowerCase()}`}>
                        {c.connectionType}
                      </span>
                    </td>
                    <td className="num">{c.meterNumber}</td>
                    <td className="num-cell font-mono">{c.sanctionedLoadKw} kW</td>
                    <td>{c.connectionDate}</td>
                    <td>
                      <span className={`status-badge ${c.status.toLowerCase()}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleStatusToggle(c)}
                        className={`btn btn-sm ${c.status === 'ACTIVE' ? 'btn-secondary' : 'btn-success'}`}
                        title={c.status === 'ACTIVE' ? 'Disconnect Power' : 'Re-Energize Supply'}
                      >
                        {c.status === 'ACTIVE' ? (
                          <>
                            <PowerOff size={12} color="#b91c1c" />
                            <span>Disconnect</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={12} />
                            <span>Activate</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Connection Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Sanction New Electricity Connection"
      >
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">
              Select Registered Consumer <span className="required">*</span>
            </label>
            <select
              className="form-control"
              value={selectedConsumerId}
              onChange={(e) => setSelectedConsumerId(Number(e.target.value))}
              required
            >
              {consumers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.consumerNumber} — {c.fullName} ({c.phoneNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Tariff Connection Type</label>
              <select
                className="form-control"
                value={connType}
                onChange={(e) => setConnType(e.target.value as ConnectionType)}
              >
                <option value="DOMESTIC">Domestic (Residential)</option>
                <option value="COMMERCIAL">Commercial (Enterprise)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Sanctioned Load (kW)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="100"
                className="form-control"
                value={sanctionedLoad}
                onChange={(e) => setSanctionedLoad(parseFloat(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Meter Number (Physical Hardware ID)</label>
            <input
              type="text"
              className="form-control"
              placeholder="Leave blank to auto-generate (e.g. MTR-88405)"
              value={customMeterNo}
              onChange={(e) => setCustomMeterNo(e.target.value)}
            />
            <span className="form-hint">Unique hardware serial imprinted on consumer meter box</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Sanction Connection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
