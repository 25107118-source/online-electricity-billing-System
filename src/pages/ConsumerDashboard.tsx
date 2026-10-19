import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  consumerService,
  connectionService,
  billService,
  paymentService,
} from '../services/billingService';
import { Consumer, Connection, Bill, Payment } from '../types';
import {
  Zap,
  CreditCard,
  Receipt,
  AlertCircle,
  CheckCircle,
  FileText,
  Printer,
} from 'lucide-react';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';

export const ConsumerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Consumer | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quick Pay Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'UPI' | 'CARD' | 'CASH'>('UPI');
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState('');
  const [paying, setPaying] = useState(false);

  const loadData = async () => {
    if (!user?.consumerNumber) return;
    setLoading(true);
    try {
      const [consData, connsData, billsData, paymentsData] = await Promise.all([
        consumerService.getByNumber(user.consumerNumber),
        connectionService.getByConsumerNumber(user.consumerNumber),
        billService.getAll({ consumerNumber: user.consumerNumber }),
        paymentService.getByConsumerNumber(user.consumerNumber),
      ]);
      setProfile(consData);
      setConnections(connsData);
      setBills(billsData);
      setPayments(paymentsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load consumer profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const openPaymentModal = (bill: Bill) => {
    setSelectedBill(bill);
    setPayAmount(bill.balanceAmount);
    setPayError('');
    setPaySuccess('');
    setPayModalOpen(true);
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;

    if (payAmount <= 0) {
      setPayError('Payment amount must be greater than zero');
      return;
    }
    if (payAmount > selectedBill.balanceAmount) {
      setPayError(`Amount cannot exceed outstanding balance of ₹${selectedBill.balanceAmount}`);
      return;
    }

    setPaying(true);
    setPayError('');
    try {
      const payment = await paymentService.record({
        billId: selectedBill.id,
        amountPaid: payAmount,
        paymentMethod: payMethod,
      });
      setPaySuccess(`Payment of ₹${payAmount} successful! Receipt: ${payment.receiptNumber}`);
      setTimeout(() => {
        setPayModalOpen(false);
        loadData();
      }, 1500);
    } catch (err: any) {
      setPayError(err.message || 'Payment processing failed');
    } finally {
      setPaying(false);
    }
  };

  // Totals
  const totalOutstanding = bills.reduce((acc, b) => acc + Number(b.balanceAmount), 0);
  const latestBill = bills.length > 0 ? bills[0] : null;

  return (
    <div className="content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Consumer Self-Service Portal</h1>
          <p className="page-desc">
            Welcome, <strong>{profile?.fullName || user?.username}</strong> ({user?.consumerNumber})
          </p>
        </div>
        <div className="page-actions">
          {latestBill && latestBill.balanceAmount > 0 && (
            <button
              onClick={() => openPaymentModal(latestBill)}
              className="btn btn-primary btn-sm"
            >
              <CreditCard size={14} />
              <span>Pay Outstanding Dues</span>
            </button>
          )}
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Highlights Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Total Outstanding Dues</span>
          <div
            className="stat-value"
            style={{ color: totalOutstanding > 0 ? '#b91c1c' : '#15803d' }}
          >
            ₹{loading ? '...' : totalOutstanding.toFixed(2)}
          </div>
          <div className="stat-subtext">
            {totalOutstanding > 0 ? (
              <span style={{ color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertCircle size={12} /> Payment pending
              </span>
            ) : (
              <span style={{ color: '#15803d', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={12} /> All bills settled up to date
              </span>
            )}
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Meter Number</span>
          <div className="stat-value" style={{ fontSize: 20 }}>
            {connections[0]?.meterNumber || 'Loading...'}
          </div>
          <div className="stat-subtext">
            Connection: {connections[0]?.connectionNumber} ({connections[0]?.connectionType})
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Sanctioned Load</span>
          <div className="stat-value" style={{ fontSize: 20 }}>
            {connections[0]?.sanctionedLoadKw ? `${connections[0].sanctionedLoadKw} kW` : '1.00 kW'}
          </div>
          <div className="stat-subtext">Connection Status: ACTIVE</div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Last Month Consumption</span>
          <div className="stat-value" style={{ fontSize: 20 }}>
            {latestBill ? `${latestBill.unitsConsumed} Units` : '0 Units'}
          </div>
          <div className="stat-subtext">Billing Period: {latestBill?.billingMonth || 'N/A'}</div>
        </div>
      </div>

      {/* Consumer & Connection Details Panel */}
      <div className="panel-card">
        <div className="panel-header">
          <h2 className="panel-title">Connection & Premises Details</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div>
            <p style={{ fontSize: 12, color: '#64748b' }}>Registered Consumer Name</p>
            <p style={{ fontWeight: 600 }}>{profile?.fullName || '-'}</p>
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#64748b' }}>Consumer Account ID</p>
            <p className="num" style={{ fontWeight: 600 }}>{profile?.consumerNumber || '-'}</p>
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#64748b' }}>Registered Mobile</p>
            <p>{profile?.phoneNumber || '-'}</p>
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#64748b' }}>Registered Email</p>
            <p>{profile?.email || '-'}</p>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <p style={{ fontSize: 12, color: '#64748b' }}>Supply & Billing Address</p>
            <p>{profile?.address || '-'}</p>
          </div>
        </div>
      </div>

      {/* Electricity Bills Table */}
      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">My Electricity Bills</h2>
            <p style={{ fontSize: 12, color: '#64748b' }}>Monthly billing ledger and payment status</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Bill Number</th>
                <th>Billing Month</th>
                <th className="num-cell">Prev Reading</th>
                <th className="num-cell">Curr Reading</th>
                <th className="num-cell">Units</th>
                <th className="num-cell">Total Bill</th>
                <th className="num-cell">Paid</th>
                <th className="num-cell">Balance Due</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '24px' }}>
                    Loading your bills...
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No electricity bills generated for this connection yet.
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id}>
                    <td style={{ fontWeight: 600 }}>{bill.billNumber}</td>
                    <td>{bill.billingMonth}</td>
                    <td className="num-cell">{bill.previousReading}</td>
                    <td className="num-cell">{bill.currentReading}</td>
                    <td className="num-cell font-mono">{bill.unitsConsumed}</td>
                    <td className="num-cell font-mono" style={{ fontWeight: 600 }}>
                      ₹{Number(bill.totalAmount).toFixed(2)}
                    </td>
                    <td className="num-cell font-mono">₹{Number(bill.paidAmount).toFixed(2)}</td>
                    <td
                      className="num-cell font-mono"
                      style={{
                        fontWeight: 600,
                        color: bill.balanceAmount > 0 ? '#b91c1c' : '#15803d',
                      }}
                    >
                      ₹{Number(bill.balanceAmount).toFixed(2)}
                    </td>
                    <td>{bill.dueDate}</td>
                    <td>
                      <span className={`status-badge ${bill.status.toLowerCase()}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link to={`/bills/${bill.id}`} className="btn btn-outline btn-sm">
                          <Printer size={12} />
                          <span>Invoice</span>
                        </Link>
                        {bill.balanceAmount > 0 && (
                          <button
                            onClick={() => openPaymentModal(bill)}
                            className="btn btn-primary btn-sm"
                          >
                            Pay
                          </button>
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

      {/* Payment History Panel */}
      <div className="panel-card">
        <div className="panel-header">
          <h2 className="panel-title">Payment History & Receipts</h2>
        </div>
        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Payment Date</th>
                <th>Bill #</th>
                <th className="num-cell">Amount Paid (₹)</th>
                <th>Mode</th>
                <th>Transaction Ref</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                    No payment history recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.receiptNumber}</td>
                    <td>{p.paymentDate}</td>
                    <td>{p.billNumber}</td>
                    <td className="num-cell font-mono" style={{ fontWeight: 600, color: '#15803d' }}>
                      ₹{Number(p.amountPaid).toFixed(2)}
                    </td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: '#f1f5f9' }}>
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="num" style={{ fontSize: 12 }}>{p.transactionRef || '-'}</td>
                    <td>
                      <Link to={`/payments/receipt/${p.receiptNumber}`} className="btn btn-outline btn-sm">
                        <FileText size={12} />
                        <span>View Receipt</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title={`Settle Electricity Bill (${selectedBill?.billNumber})`}
      >
        {selectedBill && (
          <form onSubmit={handlePaySubmit}>
            {payError && <Alert type="error" message={payError} />}
            {paySuccess && <Alert type="success" message={paySuccess} />}

            <div style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 4, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                <span>Bill Number:</span>
                <strong className="num">{selectedBill.billNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                <span>Billing Period:</span>
                <span>{selectedBill.billingMonth}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                <span>Total Bill Amount:</span>
                <span className="num">₹{Number(selectedBill.totalAmount).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: '#b91c1c' }}>
                <span>Remaining Outstanding Balance:</span>
                <span className="num">₹{Number(selectedBill.balanceAmount).toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Payment Amount (₹) <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                max={selectedBill.balanceAmount}
                className="form-control"
                value={payAmount}
                onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                required
              />
              <span className="form-hint">
                You can pay full (₹{selectedBill.balanceAmount}) or make a partial payment.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-control"
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as any)}
              >
                <option value="UPI">UPI (Google Pay, PhonePe, Paytm, BHIM)</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="CASH">Cash Counter Payment</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setPayModalOpen(false)}
                disabled={paying}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-success" disabled={paying}>
                {paying ? 'Processing...' : `Confirm Payment of ₹${payAmount.toFixed(2)}`}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
