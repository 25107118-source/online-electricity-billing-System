import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { billService, paymentService } from '../services/billingService';
import { Bill, Payment, PaymentMethod } from '../types';
import { CreditCard, FileText, CheckCircle2, AlertCircle, PlusCircle, Printer } from 'lucide-react';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';

export const Payments: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Payment Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<number>(0);
  const [amountToPay, setAmountToPay] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [recording, setRecording] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = !isAdmin && user?.consumerNumber ? { consumerNumber: user.consumerNumber } : {};
      const [allBills, allPayments] = await Promise.all([
        billService.getAll(params),
        isAdmin
          ? paymentService.getAll()
          : paymentService.getByConsumerNumber(user?.consumerNumber || ''),
      ]);
      setBills(allBills);
      setPayments(allPayments);

      const unpaidBills = allBills.filter((b) => b.balanceAmount > 0);
      if (unpaidBills.length > 0) {
        setSelectedBillId(unpaidBills[0].id);
        setAmountToPay(unpaidBills[0].balanceAmount);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payments data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, isAdmin]);

  const unpaidBills = bills.filter((b) => b.balanceAmount > 0);
  const selectedBill = bills.find((b) => b.id === selectedBillId);

  const handleBillSelect = (billId: number) => {
    setSelectedBillId(billId);
    const b = bills.find((item) => item.id === billId);
    if (b) {
      setAmountToPay(b.balanceAmount);
    }
  };

  const openPaymentForBill = (bill: Bill) => {
    setSelectedBillId(bill.id);
    setAmountToPay(bill.balanceAmount);
    setNotes('');
    setTransactionRef('');
    setPayModalOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;

    if (amountToPay <= 0) {
      setError('Payment amount must be greater than zero');
      return;
    }

    if (amountToPay > selectedBill.balanceAmount) {
      setError(`Payment cannot exceed outstanding balance of ₹${selectedBill.balanceAmount}`);
      return;
    }

    setRecording(true);
    setError('');
    setSuccess('');

    try {
      const receipt = await paymentService.record({
        billId: selectedBill.id,
        amountPaid: amountToPay,
        paymentMethod,
        transactionRef: transactionRef.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setSuccess(`Payment of ₹${amountToPay.toFixed(2)} recorded successfully! Receipt Number: ${receipt.receiptNumber}`);
      setPayModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setRecording(false);
    }
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment & Revenue Counter</h1>
          <p className="page-desc">
            Collect electricity bill payments (UPI, Debit/Credit Card, Cash), reconcile dues, and issue payment receipts.
          </p>
        </div>
        <div className="page-actions">
          {unpaidBills.length > 0 && (
            <button onClick={() => setPayModalOpen(true)} className="btn btn-primary btn-sm">
              <PlusCircle size={14} />
              <span>Record New Payment</span>
            </button>
          )}
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Unpaid / Pending Bills Panel */}
      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Pending Unsettled Invoices</h2>
            <p style={{ fontSize: 12, color: '#64748b' }}>Bills with outstanding balance awaiting settlement</p>
          </div>
          <span className="status-badge unpaid">{unpaidBills.length} Bills Pending</span>
        </div>

        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Bill Number</th>
                {isAdmin && <th>Consumer Name</th>}
                <th>Consumer #</th>
                <th>Month</th>
                <th className="num-cell">Total Bill</th>
                <th className="num-cell">Paid So Far</th>
                <th className="num-cell">Balance Due (₹)</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {unpaidBills.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '24px', color: '#15803d' }}>
                    <CheckCircle2 size={18} style={{ display: 'inline', marginRight: 6 }} />
                    All electricity bills are currently fully settled. No outstanding dues!
                  </td>
                </tr>
              ) : (
                unpaidBills.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>{b.billNumber}</td>
                    {isAdmin && <td>{b.consumerName}</td>}
                    <td>{b.consumerNumber}</td>
                    <td>{b.billingMonth}</td>
                    <td className="num-cell font-mono">₹{Number(b.totalAmount).toFixed(2)}</td>
                    <td className="num-cell font-mono">₹{Number(b.paidAmount).toFixed(2)}</td>
                    <td className="num-cell font-mono" style={{ fontWeight: 700, color: '#b91c1c' }}>
                      ₹{Number(b.balanceAmount).toFixed(2)}
                    </td>
                    <td>{b.dueDate}</td>
                    <td>
                      <span className={`status-badge ${b.status.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => openPaymentForBill(b)}
                        className="btn btn-primary btn-sm"
                      >
                        <CreditCard size={13} />
                        <span>Settle Bill</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Receipts Ledger Panel */}
      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Processed Payment Receipts</h2>
            <p style={{ fontSize: 12, color: '#64748b' }}>Historical ledger of collections and transaction references</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Payment Date</th>
                <th>Bill Number</th>
                {isAdmin && <th>Consumer Name</th>}
                <th>Consumer #</th>
                <th>Meter #</th>
                <th className="num-cell">Amount Paid (₹)</th>
                <th>Payment Mode</th>
                <th>Transaction Ref</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No payment transactions recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.receiptNumber}</td>
                    <td>{p.paymentDate}</td>
                    <td>{p.billNumber}</td>
                    {isAdmin && <td>{p.consumerName}</td>}
                    <td>{p.consumerNumber}</td>
                    <td className="num">{p.meterNumber}</td>
                    <td className="num-cell font-mono" style={{ fontWeight: 700, color: '#15803d' }}>
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
                        <Printer size={12} />
                        <span>Print Receipt</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="Record Bill Payment"
      >
        <form onSubmit={handlePaymentSubmit}>
          <div className="form-group">
            <label className="form-label">
              Select Pending Bill <span className="required">*</span>
            </label>
            <select
              className="form-control"
              value={selectedBillId}
              onChange={(e) => handleBillSelect(Number(e.target.value))}
              required
            >
              {unpaidBills.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.billNumber} — {b.consumerName} ({b.billingMonth} · Due: ₹{b.balanceAmount})
                </option>
              ))}
            </select>
          </div>

          {selectedBill && (
            <div style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 4, marginBottom: 14, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span>Consumer:</span>
                <strong>{selectedBill.consumerName} ({selectedBill.consumerNumber})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span>Meter Serial:</span>
                <span className="num">{selectedBill.meterNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span>Original Total Bill:</span>
                <span className="num font-mono">₹{Number(selectedBill.totalAmount).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span>Amount Paid Earlier:</span>
                <span className="num font-mono">₹{Number(selectedBill.paidAmount).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#b91c1c' }}>
                <span>Current Remaining Balance:</span>
                <span className="num font-mono">₹{Number(selectedBill.balanceAmount).toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Amount Paid (₹) <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                max={selectedBill?.balanceAmount}
                className="form-control"
                value={amountToPay}
                onChange={(e) => setAmountToPay(parseFloat(e.target.value) || 0)}
                required
              />
              <span className="form-hint">Enter exact amount received (allows partial payment)</span>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Channel Mode</label>
              <select
                className="form-control"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                <option value="UPI">UPI (BHIM / Google Pay / PhonePe / Paytm)</option>
                <option value="CARD">Debit Card / Credit Card / POS Terminal</option>
                <option value="CASH">Cash Counter Payment</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Transaction Reference / UTR Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. UPI/606512399120 or POS receipt number"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cashier Remarks / Notes</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Cleared at Counter 2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPayModalOpen(false)}
              disabled={recording}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-success" disabled={recording}>
              {recording ? 'Recording...' : `Record Payment of ₹${amountToPay.toFixed(2)}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
