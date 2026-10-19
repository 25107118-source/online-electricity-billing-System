import React, { useEffect, useState } from 'react';
import { consumerService, connectionService } from '../services/billingService';
import { Consumer, ConnectionType } from '../types';
import { Search, PlusCircle, Edit3, Cable, Check, X } from 'lucide-react';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';

export const ConsumerManagement: React.FC = () => {
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [consumerNumber, setConsumerNumber] = useState('');
  
  // Initial connection options (for new consumers)
  const [createInitialConn, setCreateInitialConn] = useState(true);
  const [connType, setConnType] = useState<ConnectionType>('DOMESTIC');
  const [loadKw, setLoadKw] = useState<number>(2.0);

  const [saving, setSaving] = useState(false);

  const fetchConsumers = async () => {
    setLoading(true);
    try {
      const data = await consumerService.getAll(search);
      setConsumers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch consumers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsumers();
  }, [search]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFullName('');
    setPhoneNumber('');
    setEmail('');
    setAddress('');
    setConsumerNumber('');
    setCreateInitialConn(true);
    setConnType('DOMESTIC');
    setLoadKw(2.0);
    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const handleOpenEdit = (c: Consumer) => {
    setIsEditing(true);
    setEditingId(c.id);
    setFullName(c.fullName);
    setPhoneNumber(c.phoneNumber);
    setEmail(c.email);
    setAddress(c.address);
    setConsumerNumber(c.consumerNumber);
    setCreateInitialConn(false);
    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim() || !email.trim() || !address.trim()) {
      setError('Please fill in all mandatory fields');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (isEditing && editingId) {
        await consumerService.update(editingId, {
          fullName,
          phoneNumber,
          email,
          address,
        });
        setSuccess('Consumer profile updated successfully');
      } else {
        const created = await consumerService.create({
          consumerNumber: consumerNumber.trim() || undefined,
          fullName,
          phoneNumber,
          email,
          address,
        });

        if (createInitialConn) {
          await connectionService.create({
            consumerId: created.id,
            connectionType: connType,
            sanctionedLoadKw: loadKw,
          });
        }
        setSuccess(`Consumer ${created.consumerNumber} registered successfully`);
      }
      setModalOpen(false);
      fetchConsumers();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Consumer Registry</h1>
          <p className="page-desc">
            Register and manage customer premises, electricity accounts, and metering associations.
          </p>
        </div>
        <div className="page-actions">
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <PlusCircle size={14} />
            <span>Register New Consumer</span>
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Filter and Search Bar */}
      <div className="panel-card" style={{ padding: 14, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by consumer name, consumer number (e.g. CUST1001), phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 34 }}
            />
            <Search
              size={16}
              style={{ position: 'absolute', left: 10, top: 11, color: '#94a3b8' }}
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="btn btn-secondary btn-sm"
              title="Clear search"
            >
              <X size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Consumers Table */}
      <div className="panel-card">
        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Consumer #</th>
                <th>Full Name</th>
                <th>Phone Number</th>
                <th>Email Address</th>
                <th>Supply Address</th>
                <th className="num-cell">Connections</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>
                    Loading consumers...
                  </td>
                </tr>
              ) : consumers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No consumers found matching your search. Click "Register New Consumer" to add one.
                  </td>
                </tr>
              ) : (
                consumers.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.consumerNumber}</td>
                    <td>{c.fullName}</td>
                    <td className="num">{c.phoneNumber}</td>
                    <td>{c.email}</td>
                    <td style={{ maxWidth: 260, whiteSpace: 'normal' }}>{c.address}</td>
                    <td className="num-cell">
                      <span className="status-badge" style={{ backgroundColor: '#f1f5f9' }}>
                        {c.connectionCount || 1} Meter
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', gap: 4 }}
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Consumer Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? `Edit Consumer (${consumerNumber})` : 'Register New Electricity Consumer'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Ramesh Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Mobile Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                className="form-control"
                placeholder="e.g. 9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. ramesh@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Consumer Number (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Leave blank to auto-generate (e.g. CUST1004)"
                value={consumerNumber}
                onChange={(e) => setConsumerNumber(e.target.value)}
                disabled={isEditing}
              />
              <span className="form-hint">Unique identifier for login & billing</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Service Supply Address <span className="required">*</span>
            </label>
            <textarea
              className="form-control"
              placeholder="Flat/House No., Building, Street, Area, City, Pin Code"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          {!isEditing && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 4,
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={createInitialConn}
                  onChange={(e) => setCreateInitialConn(e.target.checked)}
                />
                Provision First Electricity Connection & Meter Automatically
              </label>

              {createInitialConn && (
                <div className="form-grid" style={{ marginTop: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Connection Tariff Category</label>
                    <select
                      className="form-control"
                      value={connType}
                      onChange={(e) => setConnType(e.target.value as ConnectionType)}
                    >
                      <option value="DOMESTIC">Domestic (Residential)</option>
                      <option value="COMMERCIAL">Commercial (Shops / Offices)</option>
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
                      value={loadKw}
                      onChange={(e) => setLoadKw(parseFloat(e.target.value) || 1)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

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
              {saving ? 'Saving...' : isEditing ? 'Update Consumer' : 'Save & Register Consumer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
