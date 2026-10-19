import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  connectionService,
  meterReadingService,
  tariffService,
  billService,
} from '../services/billingService';
import { Connection, MeterReading } from '../types';
import { FileCheck, Receipt, AlertCircle, ArrowRight } from 'lucide-react';
import { Alert } from '../components/Alert';

export const GenerateBill: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<number>(0);
  const [billingMonth, setBillingMonth] = useState<string>('2026-03');
  const [reading, setReading] = useState<MeterReading | null>(null);

  // Billing adjustments
  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [lateFee, setLateFee] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [billDate, setBillDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0]
  );

  const [loading, setLoading] = useState(true);
  const [checkingReading, setCheckingReading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const loadConnections = async () => {
    setLoading(true);
    try {
      const data = await connectionService.getAll();
      const activeConns = data.filter((c) => c.status === 'ACTIVE');
      setConnections(activeConns);
      if (activeConns.length > 0) {
        setSelectedConnectionId(activeConns[0].id);
        fetchReadingForConnection(activeConns[0].id, billingMonth);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const fetchReadingForConnection = async (connId: number, month: string) => {
    setCheckingReading(true);
    setError('');
    try {
      const allReadings = await meterReadingService.getAll();
      const found = allReadings.find((r) => r.connectionId === connId && r.billingMonth === month);
      setReading(found || null);
    } catch {
      setReading(null);
    } finally {
      setCheckingReading(false);
    }
  };

  const handleConnectionSelect = (connId: number) => {
    setSelectedConnectionId(connId);
    fetchReadingForConnection(connId, billingMonth);
  };

  const handleMonthChange = (month: string) => {
    setBillingMonth(month);
    if (selectedConnectionId) {
      fetchReadingForConnection(selectedConnectionId, month);
    }
  };

  const selectedConnectionObj = connections.find((c) => c.id === selectedConnectionId);

  // Calculate preview if reading is found
  const calcPreview = reading
    ? tariffService.calculateEstimate(
        reading.unitsConsumed,
        selectedConnectionObj?.connectionType || 'DOMESTIC'
      )
    : null;

  const totalPayable = calcPreview
    ? Math.max(0, calcPreview.total + otherCharges + lateFee - discount)
    : 0;

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnectionId || !reading) {
      setError('Cannot generate bill without an accepted meter reading for this cycle');
      return;
    }

    setGenerating(true);
    setError('');
    setSuccess('');

    try {
      const generatedBill = await billService.generate({
        connectionId: selectedConnectionId,
        billingMonth,
        billDate,
        dueDate,
        otherCharges,
        lateFee,
        discount,
      });

      setSuccess(`Bill #${generatedBill.billNumber} generated successfully! Redirecting to invoice...`);
      setTimeout(() => {
        navigate(`/bills/${generatedBill.id}`);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Bill generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Generate Monthly Electricity Bill</h1>
          <p className="page-desc">
            Calculate slab-wise energy charges, assess fixed surcharges, and issue official municipal invoices.
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(300px, 1fr)', gap: 24 }}>
        {/* Bill Parameters Form */}
        <div className="panel-card">
          <div className="panel-header">
            <h2 className="panel-title">1. Connection & Billing Cycle Selection</h2>
          </div>

          <form onSubmit={handleGenerateSubmit}>
            <div className="form-group">
              <label className="form-label">
                Select Active Power Connection <span className="required">*</span>
              </label>
              <select
                className="form-control"
                value={selectedConnectionId}
                onChange={(e) => handleConnectionSelect(Number(e.target.value))}
                required
              >
                {connections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.connectionNumber} — {c.consumerName} ({c.meterNumber} · {c.connectionType})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Billing Cycle Month <span className="required">*</span>
                </label>
                <input
                  type="month"
                  className="form-control"
                  value={billingMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bill Generation Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Due Date (Grace Period)</label>
              <input
                type="date"
                className="form-control"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
              <span className="form-hint">Standard due date is 20 days from bill generation date</span>
            </div>

            {/* Adjustments */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#334155' }}>
                Optional Adjustments & Surcharges:
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Other Charges / Cess (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    value={otherCharges}
                    onChange={(e) => setOtherCharges(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Late Surcharge / Arrears (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    value={lateFee}
                    onChange={(e) => setLateFee(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Prompt Payment Rebate / Subsidy (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', height: 42, fontSize: 14 }}
                disabled={generating || !reading}
              >
                <FileCheck size={16} />
                <span>{generating ? 'Processing Bill...' : 'Generate & Issue Electricity Bill'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Calculation Preview & Meter Status */}
        <div>
          <div className="panel-card">
            <div className="panel-header">
              <h2 className="panel-title">2. Metering Inspection & Calculation Audit</h2>
            </div>

            {checkingReading ? (
              <p style={{ color: '#64748b' }}>Inspecting meter readings...</p>
            ) : !reading ? (
              <div
                style={{
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  padding: 16,
                  borderRadius: 4,
                  color: '#92400e',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 4 }}>
                  <AlertCircle size={16} />
                  <span>No Meter Reading Found for {billingMonth}</span>
                </div>
                <p style={{ fontSize: 12.5, marginBottom: 12 }}>
                  Before a bill can be generated, the meter reader must record the current index for connection{' '}
                  <strong>{selectedConnectionObj?.connectionNumber}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/meter-readings')}
                  className="btn btn-secondary btn-sm"
                >
                  Go to Record Meter Reading
                </button>
              </div>
            ) : (
              <div>
                <div style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 4, marginBottom: 14, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>Consumer:</span>
                    <strong>{reading.consumerName} ({reading.consumerNumber})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>Meter Serial:</span>
                    <strong className="num">{reading.meterNumber}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>Previous Index:</span>
                    <span className="num font-mono">{reading.previousReading} kWh</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>Current Index:</span>
                    <span className="num font-mono">{reading.currentReading} kWh</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#1e40af' }}>
                    <span>Net Units Consumed:</span>
                    <span className="num font-mono">{reading.unitsConsumed} kWh</span>
                  </div>
                </div>

                {calcPreview && (
                  <div className="calc-breakdown-box" style={{ margin: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      PROGRESSIVE SLAB AUDIT BREAKDOWN:
                    </div>
                    {calcPreview.breakdown.map((item, idx) => (
                      <div key={idx} className="calc-breakdown-row">
                        <span>
                          Slab {idx + 1} ({item.from}–{item.to === null ? 'Above' : item.to}):{' '}
                          {item.units} units @ ₹{item.rate.toFixed(2)}
                        </span>
                        <span className="num font-mono">₹{item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="calc-breakdown-row">
                      <span>Fixed Demand Charge:</span>
                      <span className="num font-mono">₹{calcPreview.fixedCharge.toFixed(2)}</span>
                    </div>

                    {otherCharges > 0 && (
                      <div className="calc-breakdown-row">
                        <span>Other Charges:</span>
                        <span className="num font-mono">₹{otherCharges.toFixed(2)}</span>
                      </div>
                    )}
                    {lateFee > 0 && (
                      <div className="calc-breakdown-row">
                        <span>Late Surcharge:</span>
                        <span className="num font-mono">₹{lateFee.toFixed(2)}</span>
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="calc-breakdown-row" style={{ color: '#15803d' }}>
                        <span>Discount / Subsidy:</span>
                        <span className="num font-mono">−₹{discount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="calc-breakdown-row total">
                      <span>Total Bill Payable:</span>
                      <span className="num font-mono" style={{ color: 'var(--primary-blue)' }}>
                        ₹{totalPayable.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
