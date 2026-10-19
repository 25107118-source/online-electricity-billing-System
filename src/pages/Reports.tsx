import React, { useEffect, useState } from 'react';
import { reportService, billService, consumerService } from '../services/billingService';
import { MonthlyReport, Bill, Consumer } from '../types';
import { BarChart3, Printer, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { Alert } from '../components/Alert';

export const Reports: React.FC = () => {
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [allBills, setAllBills] = useState<Bill[]>([]);
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [selectedConsumer, setSelectedConsumer] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = async () => {
    setLoading(true);
    try {
      const [mReports, bills, cons] = await Promise.all([
        reportService.getMonthlyReports(),
        billService.getAll(),
        consumerService.getAll(),
      ]);
      setMonthlyReports(mReports);
      setAllBills(bills);
      setConsumers(cons);
    } catch (err: any) {
      setError(err.message || 'Failed to generate billing reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Aggregates for Monthly Summary Table
  const totalBillsCount = monthlyReports.reduce((acc, r) => acc + r.totalBills, 0);
  const totalUnitsAll = monthlyReports.reduce((acc, r) => acc + Number(r.totalUnitsConsumed), 0);
  const totalBilledAll = monthlyReports.reduce((acc, r) => acc + Number(r.totalBilledAmount), 0);
  const totalCollectedAll = monthlyReports.reduce((acc, r) => acc + Number(r.totalCollectedAmount), 0);
  const totalOutstandingAll = monthlyReports.reduce((acc, r) => acc + Number(r.outstandingAmount), 0);
  const overallEfficiency = totalBilledAll > 0 ? (totalCollectedAll / totalBilledAll) * 100 : 0;

  // Filter bills by selected consumer
  const consumerFilteredBills = selectedConsumer === 'ALL'
    ? allBills
    : allBills.filter((b) => b.consumerNumber === selectedConsumer);

  return (
    <div className="content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Revenue & Consumption Reports</h1>
          <p className="page-desc">
            Tabular monthly billing summaries, collection efficiencies, and consumer ledger audits.
          </p>
        </div>
        <div className="page-actions no-print">
          <button onClick={loadReports} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={14} />
            <span>Reload</span>
          </button>
          <button onClick={handlePrint} className="btn btn-outline btn-sm">
            <Printer size={14} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Summary KPI Strip */}
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Total Cumulative Billed</span>
          <div className="stat-value font-mono">
            ₹{loading ? '...' : totalBilledAll.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="stat-subtext">Total generated revenue demand</div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Total Realized Revenue</span>
          <div className="stat-value font-mono" style={{ color: '#15803d' }}>
            ₹{loading ? '...' : totalCollectedAll.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="stat-subtext">Cumulative payments deposited</div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Pending Arrears Balance</span>
          <div className="stat-value font-mono" style={{ color: '#b91c1c' }}>
            ₹{loading ? '...' : totalOutstandingAll.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="stat-subtext">Unsettled consumer bills</div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Collection Efficiency</span>
          <div className="stat-value font-mono" style={{ color: overallEfficiency >= 70 ? '#15803d' : '#b45309' }}>
            {loading ? '...' : `${overallEfficiency.toFixed(1)}%`}
          </div>
          <div className="stat-subtext">Revenue realization percentage</div>
        </div>
      </div>

      {/* Report 1: Monthly Electricity Consumption & Revenue Realization */}
      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">1. Monthly Consumption & Billing Demand Summary</h2>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              Cycle-wise breakdown of energy consumption, demand, collection, and recovery percentage
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Billing Month</th>
                <th className="num-cell">Invoices Generated</th>
                <th className="num-cell">Total Units Consumed (kWh)</th>
                <th className="num-cell">Billed Amount (₹)</th>
                <th className="num-cell">Collected Amount (₹)</th>
                <th className="num-cell">Outstanding Dues (₹)</th>
                <th className="num-cell">Collection Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>
                    Compiling monthly report...
                  </td>
                </tr>
              ) : monthlyReports.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No billing cycles to report yet.
                  </td>
                </tr>
              ) : (
                monthlyReports.map((r) => (
                  <tr key={r.month}>
                    <td style={{ fontWeight: 700 }}>{r.month}</td>
                    <td className="num-cell font-mono">{r.totalBills}</td>
                    <td className="num-cell font-mono">{r.totalUnitsConsumed}</td>
                    <td className="num-cell font-mono" style={{ fontWeight: 600 }}>
                      ₹{Number(r.totalBilledAmount).toFixed(2)}
                    </td>
                    <td className="num-cell font-mono" style={{ color: '#15803d', fontWeight: 600 }}>
                      ₹{Number(r.totalCollectedAmount).toFixed(2)}
                    </td>
                    <td className="num-cell font-mono" style={{ color: r.outstandingAmount > 0 ? '#b91c1c' : '#15803d' }}>
                      ₹{Number(r.outstandingAmount).toFixed(2)}
                    </td>
                    <td className="num-cell font-mono" style={{ fontWeight: 700 }}>
                      {r.collectionEfficiencyPercentage.toFixed(1)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {monthlyReports.length > 0 && (
              <tfoot>
                <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 800 }}>
                  <td>TOTAL / OVERALL</td>
                  <td className="num-cell font-mono">{totalBillsCount}</td>
                  <td className="num-cell font-mono">{totalUnitsAll}</td>
                  <td className="num-cell font-mono">₹{totalBilledAll.toFixed(2)}</td>
                  <td className="num-cell font-mono" style={{ color: '#15803d' }}>
                    ₹{totalCollectedAll.toFixed(2)}
                  </td>
                  <td className="num-cell font-mono" style={{ color: '#b91c1c' }}>
                    ₹{totalOutstandingAll.toFixed(2)}
                  </td>
                  <td className="num-cell font-mono">{overallEfficiency.toFixed(1)}%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Report 2: Consumer Billing & Consumption Ledger */}
      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">2. Consumer Billing History Ledger</h2>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              Historical power usage and payment reconciliation by consumer
            </p>
          </div>
          <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Filter Consumer:</span>
            <select
              className="form-control"
              style={{ width: 220, height: 32 }}
              value={selectedConsumer}
              onChange={(e) => setSelectedConsumer(e.target.value)}
            >
              <option value="ALL">All Consumers</option>
              {consumers.map((c) => (
                <option key={c.id} value={c.consumerNumber}>
                  {c.consumerNumber} — {c.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Bill #</th>
                <th>Consumer Name</th>
                <th>Consumer #</th>
                <th>Cycle</th>
                <th className="num-cell">Units Consumed</th>
                <th className="num-cell">Energy (₹)</th>
                <th className="num-cell">Fixed (₹)</th>
                <th className="num-cell">Total Billed (₹)</th>
                <th className="num-cell">Amount Paid (₹)</th>
                <th className="num-cell">Balance Due (₹)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {consumerFilteredBills.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No records found for the selected filter.
                  </td>
                </tr>
              ) : (
                consumerFilteredBills.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>{b.billNumber}</td>
                    <td>{b.consumerName}</td>
                    <td>{b.consumerNumber}</td>
                    <td>{b.billingMonth}</td>
                    <td className="num-cell font-mono">{b.unitsConsumed}</td>
                    <td className="num-cell font-mono">₹{Number(b.energyCharges).toFixed(2)}</td>
                    <td className="num-cell font-mono">₹{Number(b.fixedCharges).toFixed(2)}</td>
                    <td className="num-cell font-mono" style={{ fontWeight: 600 }}>
                      ₹{Number(b.totalAmount).toFixed(2)}
                    </td>
                    <td className="num-cell font-mono" style={{ color: '#15803d' }}>
                      ₹{Number(b.paidAmount).toFixed(2)}
                    </td>
                    <td
                      className="num-cell font-mono"
                      style={{
                        fontWeight: 700,
                        color: b.balanceAmount > 0 ? '#b91c1c' : '#15803d',
                      }}
                    >
                      ₹{Number(b.balanceAmount).toFixed(2)}
                    </td>
                    <td>
                      <span className={`status-badge ${b.status.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
