import React, { useEffect, useState } from 'react';
import { tariffService } from '../services/billingService';
import { TariffSlab, ConnectionType } from '../types';
import { SlidersHorizontal, Calculator, Edit2, Check, RefreshCw } from 'lucide-react';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';

export const TariffManagement: React.FC = () => {
  const [tariffs, setTariffs] = useState<TariffSlab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Simulator State (perfect for college viva!)
  const [simUnits, setSimUnits] = useState<number>(250);
  const [simType, setSimType] = useState<ConnectionType>('DOMESTIC');

  // Edit Tariff Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSlab, setEditingSlab] = useState<TariffSlab | null>(null);
  const [ratePerUnit, setRatePerUnit] = useState<number>(0);
  const [fixedCharge, setFixedCharge] = useState<number>(0);
  const [fromUnit, setFromUnit] = useState<number>(0);
  const [toUnit, setToUnit] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const fetchTariffs = async () => {
    setLoading(true);
    try {
      const data = await tariffService.getAll();
      setTariffs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tariff slabs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTariffs();
  }, []);

  const handleEditClick = (slab: TariffSlab) => {
    setEditingSlab(slab);
    setRatePerUnit(slab.ratePerUnit);
    setFixedCharge(slab.fixedCharge);
    setFromUnit(slab.fromUnit);
    setToUnit(slab.toUnit !== null ? slab.toUnit.toString() : '');
    setError('');
    setSuccess('');
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlab) return;

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await tariffService.update(editingSlab.id, {
        ratePerUnit,
        fixedCharge,
        fromUnit,
        toUnit: toUnit === '' ? null : parseInt(toUnit, 10),
      });
      setSuccess(`Tariff slab #${editingSlab.id} updated successfully`);
      setEditModalOpen(false);
      fetchTariffs();
    } catch (err: any) {
      setError(err.message || 'Failed to update tariff slab');
    } finally {
      setSaving(false);
    }
  };

  // Run calculation simulator
  const simResult = tariffService.calculateEstimate(simUnits, simType);

  const domesticSlabs = tariffs.filter((t) => t.connectionType === 'DOMESTIC');
  const commercialSlabs = tariffs.filter((t) => t.connectionType === 'COMMERCIAL');

  return (
    <div className="content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tariff Slab Configuration</h1>
          <p className="page-desc">
            Progressive energy rate brackets, fixed demand surcharges, and simulation engine.
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Live Viva Calculation Simulator Box */}
      <div className="panel-card" style={{ borderLeft: '4px solid var(--primary-blue)' }}>
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calculator size={18} color="var(--primary-blue)" />
            <h2 className="panel-title">Progressive Tariff Calculation Engine (Viva Demonstration)</h2>
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Academic standard progressive slab formula
          </span>
        </div>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="form-label">Simulation Units Consumed (kWh)</label>
            <input
              type="number"
              min="0"
              max="10000"
              className="form-control"
              value={simUnits}
              onChange={(e) => setSimUnits(Math.max(0, parseFloat(e.target.value) || 0))}
            />
            <span className="form-hint">Try testing with 250 units to match academic specification</span>
          </div>

          <div style={{ width: 220 }}>
            <label className="form-label">Connection Category</label>
            <select
              className="form-control"
              value={simType}
              onChange={(e) => setSimType(e.target.value as ConnectionType)}
            >
              <option value="DOMESTIC">Domestic (Residential)</option>
              <option value="COMMERCIAL">Commercial (Enterprise)</option>
            </select>
          </div>
        </div>

        {/* Calculation breakdown */}
        <div className="calc-breakdown-box">
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: '#1e293b' }}>
            STEP-BY-STEP PROGRESSIVE SLAB BREAKDOWN FOR {simUnits} UNITS:
          </div>
          {simResult.breakdown.map((item, idx) => (
            <div key={idx} className="calc-breakdown-row">
              <span>
                Slab {idx + 1} ({item.from} – {item.to === null ? 'Above' : item.to} units):{' '}
                <strong>{item.units} units</strong> @ ₹{item.rate.toFixed(2)}/unit
              </span>
              <span className="num font-mono">₹{item.amount.toFixed(2)}</span>
            </div>
          ))}

          <div className="calc-breakdown-row">
            <span>Energy Charge Subtotal (Sum of applicable slabs)</span>
            <span className="num font-mono" style={{ fontWeight: 600 }}>
              ₹{simResult.energyCharges.toFixed(2)}
            </span>
          </div>

          <div className="calc-breakdown-row">
            <span>Fixed Monthly Demand Charge</span>
            <span className="num font-mono">₹{simResult.fixedCharge.toFixed(2)}</span>
          </div>

          <div className="calc-breakdown-row total">
            <span>Total Simulated Payable Bill Amount</span>
            <span className="num font-mono" style={{ color: 'var(--primary-blue)' }}>
              ₹{simResult.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Domestic Tariffs Table */}
      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Domestic Tariff Slabs (Residential Consumers)</h2>
            <p style={{ fontSize: 12, color: '#64748b' }}>Current active schedule for home power connections</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Slab #</th>
                <th>From Unit</th>
                <th>To Unit</th>
                <th>Rate Per Unit (₹)</th>
                <th>Fixed Monthly Charge (₹)</th>
                <th>Effective From</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {domesticSlabs.map((s, idx) => (
                <tr key={s.id}>
                  <td className="num">Slab {idx + 1}</td>
                  <td className="num-cell">{s.fromUnit}</td>
                  <td className="num-cell">{s.toUnit !== null ? s.toUnit : 'Above 200'}</td>
                  <td className="num-cell font-mono" style={{ fontWeight: 600 }}>
                    ₹{s.ratePerUnit.toFixed(2)}
                  </td>
                  <td className="num-cell font-mono">₹{s.fixedCharge.toFixed(2)}</td>
                  <td>{s.effectiveDate}</td>
                  <td>
                    <span className="status-badge active">ACTIVE</span>
                  </td>
                  <td>
                    <button onClick={() => handleEditClick(s)} className="btn btn-secondary btn-sm">
                      <Edit2 size={12} />
                      <span>Edit Rate</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commercial Tariffs Table */}
      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Commercial Tariff Slabs (Enterprises & Shops)</h2>
            <p style={{ fontSize: 12, color: '#64748b' }}>Commercial utility billing tariff schedules</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Slab #</th>
                <th>From Unit</th>
                <th>To Unit</th>
                <th>Rate Per Unit (₹)</th>
                <th>Fixed Monthly Charge (₹)</th>
                <th>Effective From</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {commercialSlabs.map((s, idx) => (
                <tr key={s.id}>
                  <td className="num">Slab {idx + 1}</td>
                  <td className="num-cell">{s.fromUnit}</td>
                  <td className="num-cell">{s.toUnit !== null ? s.toUnit : 'Above 150'}</td>
                  <td className="num-cell font-mono" style={{ fontWeight: 600 }}>
                    ₹{s.ratePerUnit.toFixed(2)}
                  </td>
                  <td className="num-cell font-mono">₹{s.fixedCharge.toFixed(2)}</td>
                  <td>{s.effectiveDate}</td>
                  <td>
                    <span className="status-badge commercial">ACTIVE</span>
                  </td>
                  <td>
                    <button onClick={() => handleEditClick(s)} className="btn btn-secondary btn-sm">
                      <Edit2 size={12} />
                      <span>Edit Rate</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Slab Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Update Tariff Slab (#${editingSlab?.id} · ${editingSlab?.connectionType})`}
      >
        {editingSlab && (
          <form onSubmit={handleEditSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">From Unit (kWh)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={fromUnit}
                  onChange={(e) => setFromUnit(parseInt(e.target.value, 10) || 0)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">To Unit (kWh)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Leave empty for unconstrained (>)"
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                />
                <span className="form-hint">Leave blank for uppermost slab (e.g. Above 200)</span>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Rate Per Unit (₹) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  className="form-control"
                  value={ratePerUnit}
                  onChange={(e) => setRatePerUnit(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Fixed Charge Per Cycle (₹) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={fixedCharge}
                  onChange={(e) => setFixedCharge(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Updating...' : 'Save Tariff Slab'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
