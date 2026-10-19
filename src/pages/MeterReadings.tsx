import React, { useEffect, useState } from 'react';
import {
  meterReadingService,
  connectionService,
} from '../services/billingService';
import { MeterReading, Connection } from '../types';
import { Gauge, PlusCircle, AlertCircle, Calendar } from 'lucide-react';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';

export const MeterReadings: React.FC = () => {
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Record Reading Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<number>(0);
  const [billingMonth, setBillingMonth] = useState<string>('2026-03');
  const [previousReading, setPreviousReading] = useState<number>(0);
  const [currentReading, setCurrentReading] = useState<number>(0);
  const [readingDate, setReadingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rList, cList] = await Promise.all([
        meterReadingService.getAll(),
        connectionService.getAll(),
      ]);
      setReadings(rList);
      setConnections(cList.filter((c) => c.status === 'ACTIVE'));

      if (cList.length > 0) {
        const firstActive = cList.find((c) => c.status === 'ACTIVE') || cList[0];
        setSelectedConnectionId(firstActive.id);
        const prev = await meterReadingService.getPreviousReading(firstActive.id);
        setPreviousReading(prev);
        setCurrentReading(prev + 100);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch meter readings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConnectionChange = async (connId: number) => {
    setSelectedConnectionId(connId);
    try {
      const prev = await meterReadingService.getPreviousReading(connId);
      setPreviousReading(prev);
      setCurrentReading(prev > 0 ? prev + 100 : 100);
    } catch {
      setPreviousReading(0);
      setCurrentReading(100);
    }
  };

  const unitsConsumed = Number((currentReading - previousReading).toFixed(2));

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnectionId) {
      setError('Please select an active electricity connection');
      return;
    }

    if (currentReading < previousReading) {
      setError(`Current meter reading (${currentReading}) cannot be less than previous reading (${previousReading})`);
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const recorded = await meterReadingService.record({
        connectionId: selectedConnectionId,
        billingMonth,
        previousReading,
        currentReading,
        readingDate,
      });

      setSuccess(`Meter reading recorded: ${recorded.unitsConsumed} units consumed in cycle ${recorded.billingMonth}`);
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to record meter reading');
    } finally {
      setSaving(false);
    }
  };

  const selectedConnectionObj = connections.find((c) => c.id === selectedConnectionId);

  return (
    <div className="content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Meter Reading Management</h1>
          <p className="page-desc">
            Record monthly kilowatt-hour meter indices with automatic delta calculations and validation rules.
          </p>
        </div>
        <div className="page-actions">
          <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-sm">
            <PlusCircle size={14} />
            <span>Record Meter Reading</span>
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Meter Readings Table */}
      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Meter Reading Log</h2>
            <p style={{ fontSize: 12, color: '#64748b' }}>Authorized entries accepted for billing calculations</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Reading ID</th>
                <th>Consumer Name</th>
                <th>Consumer #</th>
                <th>Meter #</th>
                <th>Billing Month</th>
                <th className="num-cell">Prev Reading (kWh)</th>
                <th className="num-cell">Curr Reading (kWh)</th>
                <th className="num-cell">Units Consumed</th>
                <th>Reading Date</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '24px' }}>
                    Loading meter readings...
                  </td>
                </tr>
              ) : readings.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No meter readings recorded yet. Click "Record Meter Reading" to log the first index.
                  </td>
                </tr>
              ) : (
                readings.map((r) => (
                  <tr key={r.id}>
                    <td className="num" style={{ fontWeight: 600 }}>#{r.id}</td>
                    <td>{r.consumerName}</td>
                    <td>{r.consumerNumber}</td>
                    <td className="num">{r.meterNumber}</td>
                    <td style={{ fontWeight: 600 }}>{r.billingMonth}</td>
                    <td className="num-cell font-mono">{r.previousReading}</td>
                    <td className="num-cell font-mono">{r.currentReading}</td>
                    <td className="num-cell font-mono" style={{ fontWeight: 700, color: '#1e40af' }}>
                      {r.unitsConsumed}
                    </td>
                    <td>{r.readingDate}</td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: '#f1f5f9' }}>
                        {r.recordedBy}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Reading Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Monthly Meter Reading"
      >
        <form onSubmit={handleRecordSubmit}>
          <div className="form-group">
            <label className="form-label">
              Select Connection / Meter <span className="required">*</span>
            </label>
            <select
              className="form-control"
              value={selectedConnectionId}
              onChange={(e) => handleConnectionChange(Number(e.target.value))}
              required
            >
              {connections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.connectionNumber} — {c.consumerName} ({c.meterNumber} · {c.connectionType})
                </option>
              ))}
            </select>
          </div>

          {selectedConnectionObj && (
            <div style={{ backgroundColor: '#f8fafc', padding: 10, borderRadius: 4, marginBottom: 14, fontSize: 12.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span>Consumer Number:</span>
                <strong>{selectedConnectionObj.consumerNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span>Physical Meter Serial:</span>
                <strong className="num">{selectedConnectionObj.meterNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tariff Classification:</span>
                <span>{selectedConnectionObj.connectionType}</span>
              </div>
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Billing Month (YYYY-MM) <span className="required">*</span>
              </label>
              <input
                type="month"
                className="form-control"
                value={billingMonth}
                onChange={(e) => setBillingMonth(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reading Inspection Date</label>
              <input
                type="date"
                className="form-control"
                value={readingDate}
                onChange={(e) => setReadingDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Previous Meter Reading (kWh) <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={previousReading}
                onChange={(e) => setPreviousReading(parseFloat(e.target.value) || 0)}
                required
              />
              <span className="form-hint">Automatically retrieved from last accepted entry</span>
            </div>

            <div className="form-group">
              <label className="form-label">
                Current Meter Reading (kWh) <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min={previousReading}
                className="form-control"
                value={currentReading}
                onChange={(e) => setCurrentReading(parseFloat(e.target.value) || 0)}
                required
              />
              <span className="form-hint">Must be ≥ previous reading</span>
            </div>
          </div>

          {/* Units Consumed Calculation Preview */}
          <div
            className="calc-breakdown-box"
            style={{
              backgroundColor: unitsConsumed >= 0 ? '#eff6ff' : '#fef2f2',
              borderColor: unitsConsumed >= 0 ? '#bfdbfe' : '#fecaca',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                  CALCULATED CONSUMPTION DELTA:
                </div>
                <div style={{ fontSize: 11.5, color: '#64748b' }}>
                  Current ({currentReading}) − Previous ({previousReading})
                </div>
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: unitsConsumed >= 0 ? '#1d4ed8' : '#b91c1c',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {unitsConsumed >= 0 ? `${unitsConsumed} Units` : 'Invalid (Negative)'}
              </div>
            </div>
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
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || unitsConsumed < 0}
            >
              {saving ? 'Recording...' : 'Submit Meter Reading'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
