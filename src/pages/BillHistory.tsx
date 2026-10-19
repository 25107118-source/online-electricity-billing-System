import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { billService } from '../services/billingService';
import { Bill } from '../types';
import { Search, Printer, FileText, Filter, X, CreditCard } from 'lucide-react';
import { Alert } from '../components/Alert';

export const BillHistory: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBills = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (!isAdmin && user?.consumerNumber) {
        params.consumerNumber = user.consumerNumber;
      }
      if (monthFilter) params.month = monthFilter;
      if (statusFilter) params.status = statusFilter;

      const data = await billService.getAll(params);
      setBills(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [monthFilter, statusFilter, user, isAdmin]);

  const filteredBills = bills.filter((b) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      b.billNumber.toLowerCase().includes(q) ||
      b.consumerNumber.toLowerCase().includes(q) ||
      b.consumerName.toLowerCase().includes(q) ||
      b.meterNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div className="content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isAdmin ? 'Electricity Bill Registry & History' : 'My Electricity Invoices'}</h1>
          <p className="page-desc">
            {isAdmin
              ? 'Complete ledger of electricity bills issued across domestic and commercial connections.'
              : 'View, verify, download, and print your electricity utility invoices.'}
          </p>
        </div>
        {isAdmin && (
          <div className="page-actions">
            <Link to="/generate-bill" className="btn btn-primary btn-sm">
              <FileText size={14} />
              <span>Generate New Bill</span>
            </Link>
          </div>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Filter and Search Bar */}
      <div className="panel-card" style={{ padding: 14, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Bill # (e.g. BILL-202602-0001), Consumer #, or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 34 }}
            />
            <Search
              size={16}
              style={{ position: 'absolute', left: 10, top: 11, color: '#94a3b8' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Billing Month:</span>
            <input
              type="month"
              className="form-control"
              style={{ width: 150, height: 38 }}
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Status:</span>
            <select
              className="form-control"
              style={{ width: 140, height: 38 }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
            </select>
          </div>

          {(searchTerm || monthFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setMonthFilter('');
                setStatusFilter('');
              }}
              className="btn btn-secondary btn-sm"
              title="Reset Filters"
            >
              <X size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Bills Table */}
      <div className="panel-card">
        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Bill Number</th>
                {isAdmin && <th>Consumer Name</th>}
                <th>Consumer #</th>
                <th>Meter #</th>
                <th>Month</th>
                <th className="num-cell">Units</th>
                <th className="num-cell">Total (₹)</th>
                <th className="num-cell">Paid (₹)</th>
                <th className="num-cell">Balance (₹)</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '24px' }}>
                    Loading bills...
                  </td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No electricity bills found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredBills.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>{b.billNumber}</td>
                    {isAdmin && <td>{b.consumerName}</td>}
                    <td>{b.consumerNumber}</td>
                    <td className="num">{b.meterNumber}</td>
                    <td style={{ fontWeight: 600 }}>{b.billingMonth}</td>
                    <td className="num-cell font-mono">{b.unitsConsumed}</td>
                    <td className="num-cell font-mono" style={{ fontWeight: 600 }}>
                      ₹{Number(b.totalAmount).toFixed(2)}
                    </td>
                    <td className="num-cell font-mono">₹{Number(b.paidAmount).toFixed(2)}</td>
                    <td
                      className="num-cell font-mono"
                      style={{
                        fontWeight: 600,
                        color: b.balanceAmount > 0 ? '#b91c1c' : '#15803d',
                      }}
                    >
                      ₹{Number(b.balanceAmount).toFixed(2)}
                    </td>
                    <td>{b.dueDate}</td>
                    <td>
                      <span className={`status-badge ${b.status.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link to={`/bills/${b.id}`} className="btn btn-outline btn-sm">
                          <Printer size={12} />
                          <span>Invoice</span>
                        </Link>
                        {b.balanceAmount > 0 && (
                          <Link to="/payments" className="btn btn-primary btn-sm">
                            <CreditCard size={12} />
                            <span>Pay</span>
                          </Link>
                        )}
                      </div>
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
