import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/billingService';
import { DashboardStats } from '../types';
import {
  Users,
  Cable,
  FileCheck2,
  IndianRupee,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Gauge,
  Receipt,
} from 'lucide-react';
import { Alert } from '../components/Alert';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-desc">
            Operational overview of consumers, power connections, metering, and revenue realization.
          </p>
        </div>
        <div className="page-actions">
          <Link to="/consumers" className="btn btn-secondary btn-sm">
            <PlusCircle size={14} />
            <span>New Consumer</span>
          </Link>
          <Link to="/meter-readings" className="btn btn-secondary btn-sm">
            <Gauge size={14} />
            <span>Record Reading</span>
          </Link>
          <Link to="/generate-bill" className="btn btn-primary btn-sm">
            <Receipt size={14} />
            <span>Generate Bill</span>
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Summary KPI Cards Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Registered Consumers</span>
            <Users size={18} color="#64748b" />
          </div>
          <div className="stat-value">{loading ? '...' : stats?.totalRegisteredConsumers || 0}</div>
          <div className="stat-subtext">Active account holders in jurisdiction</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Active Connections</span>
            <Cable size={18} color="#15803d" />
          </div>
          <div className="stat-value">{loading ? '...' : stats?.activeConnections || 0}</div>
          <div className="stat-subtext">Energized domestic & commercial meters</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Bills Generated (Feb 2026)</span>
            <FileCheck2 size={18} color="#1d4ed8" />
          </div>
          <div className="stat-value">{loading ? '...' : stats?.billsGeneratedThisMonth || 0}</div>
          <div className="stat-subtext">Current billing cycle generation</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Total Amount Billed</span>
            <IndianRupee size={18} color="#0f172a" />
          </div>
          <div className="stat-value">
            ₹{loading ? '...' : Number(stats?.totalAmountBilledAllTime || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="stat-subtext">Cumulative energy & fixed charges</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Total Revenue Collected</span>
            <IndianRupee size={18} color="#15803d" />
          </div>
          <div className="stat-value" style={{ color: '#15803d' }}>
            ₹{loading ? '...' : Number(stats?.totalAmountCollectedAllTime || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="stat-subtext">Processed bank & cash payments</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Outstanding Dues</span>
            <AlertTriangle size={18} color="#b91c1c" />
          </div>
          <div className="stat-value" style={{ color: '#b91c1c' }}>
            ₹{loading ? '...' : Number(stats?.totalOutstandingPayments || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="stat-subtext">Pending realization from consumers</div>
        </div>
      </div>

      {/* Recent Bills Panel */}
      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Recent Electricity Invoices</h2>
            <p style={{ fontSize: 12, color: '#64748b' }}>Latest billing cycles generated across feeders</p>
          </div>
          <Link to="/bills" className="btn btn-secondary btn-sm">
            <span>View All Bills</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Bill Number</th>
                <th>Consumer Name</th>
                <th>Consumer #</th>
                <th>Meter #</th>
                <th>Month</th>
                <th className="num-cell">Units</th>
                <th className="num-cell">Total (₹)</th>
                <th className="num-cell">Balance (₹)</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '24px' }}>
                    Loading billing records...
                  </td>
                </tr>
              ) : !stats?.recentBills || stats.recentBills.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No electricity bills generated yet. Go to Generate Bill to create the first bill.
                  </td>
                </tr>
              ) : (
                stats.recentBills.map((bill) => (
                  <tr key={bill.id}>
                    <td style={{ fontWeight: 600 }}>{bill.billNumber}</td>
                    <td>{bill.consumerName}</td>
                    <td>{bill.consumerNumber}</td>
                    <td className="num">{bill.meterNumber}</td>
                    <td>{bill.billingMonth}</td>
                    <td className="num-cell">{bill.unitsConsumed}</td>
                    <td className="num-cell font-mono" style={{ fontWeight: 600 }}>
                      ₹{Number(bill.totalAmount).toFixed(2)}
                    </td>
                    <td className="num-cell font-mono" style={{ color: bill.balanceAmount > 0 ? '#b91c1c' : '#15803d' }}>
                      ₹{Number(bill.balanceAmount).toFixed(2)}
                    </td>
                    <td>{bill.dueDate}</td>
                    <td>
                      <span className={`status-badge ${bill.status.toLowerCase()}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/bills/${bill.id}`} className="btn btn-outline btn-sm">
                        View Invoice
                      </Link>
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
