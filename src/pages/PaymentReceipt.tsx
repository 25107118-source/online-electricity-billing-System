import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/billingService';
import { Payment } from '../types';
import { Printer, ArrowLeft, CheckCircle2, Zap } from 'lucide-react';
import { Alert } from '../components/Alert';

export const PaymentReceipt: React.FC = () => {
  const { receiptNumber } = useParams<{ receiptNumber: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!receiptNumber) return;
    const fetchReceipt = async () => {
      setLoading(true);
      try {
        const data = await paymentService.getByReceiptNumber(receiptNumber);
        setPayment(data);
      } catch (err: any) {
        setError(err.message || 'Payment receipt not found');
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [receiptNumber]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="content-area" style={{ textAlign: 'center', padding: '60px' }}>
        <p>Loading payment receipt...</p>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="content-area">
        <Alert type="error" message={error || 'Receipt not found'} />
        <button onClick={() => navigate('/payments')} className="btn btn-secondary">
          <ArrowLeft size={14} />
          <span>Back to Payments</span>
        </button>
      </div>
    );
  }

  return (
    <div className="content-area">
      {/* Top Action Bar (Hidden during print) */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: 640,
          margin: '0 auto 20px auto',
        }}
      >
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
        <button onClick={handlePrint} className="btn btn-primary btn-sm">
          <Printer size={14} />
          <span>Print Receipt</span>
        </button>
      </div>

      {/* Official Municipal Payment Receipt Box */}
      <div
        className="invoice-container"
        style={{ maxWidth: 640, padding: '30px 32px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div
              style={{
                width: 38,
                height: 38,
                backgroundColor: 'var(--primary-blue)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
              }}
            >
              <Zap size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>
                STATE ELECTRICITY DISTRIBUTION CO. LTD.
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                OFFICIAL REVENUE PAYMENT ACKNOWLEDGEMENT RECEIPT
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#15803d' }}>
              PAYMENT RECEIVED
            </div>
            <div className="num" style={{ fontSize: 11, color: '#475569' }}>
              {payment.paymentDate}
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: 12, borderRadius: 4, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle2 size={24} color="#15803d" />
          <div>
            <div style={{ fontWeight: 700, color: '#166534', fontSize: 14 }}>
              Payment of ₹{payment.amountPaid.toFixed(2)} Successfully Recorded
            </div>
            <div style={{ fontSize: 12, color: '#15803d' }}>
              Receipt Number: <strong className="num">{payment.receiptNumber}</strong>
            </div>
          </div>
        </div>

        {/* Receipt Details Table */}
        <table className="gov-table" style={{ border: '1px solid #cbd5e1', marginBottom: 16 }}>
          <tbody>
            <tr>
              <td style={{ width: '40%', fontWeight: 600, backgroundColor: '#f8fafc' }}>Consumer Account:</td>
              <td><strong>{payment.consumerName}</strong> ({payment.consumerNumber})</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600, backgroundColor: '#f8fafc' }}>Electricity Meter #:</td>
              <td className="num">{payment.meterNumber}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600, backgroundColor: '#f8fafc' }}>Adjusted Against Bill:</td>
              <td><strong className="num">{payment.billNumber}</strong> (Cycle: {payment.billingMonth})</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600, backgroundColor: '#f8fafc' }}>Total Original Bill:</td>
              <td className="num font-mono">₹{payment.billTotalAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600, backgroundColor: '#f8fafc' }}>Amount Received:</td>
              <td className="num font-mono" style={{ fontSize: 16, fontWeight: 800, color: '#15803d' }}>
                ₹{payment.amountPaid.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600, backgroundColor: '#f8fafc' }}>Remaining Balance Due:</td>
              <td className="num font-mono" style={{ fontWeight: 700, color: payment.remainingBalance > 0 ? '#b91c1c' : '#15803d' }}>
                ₹{payment.remainingBalance.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600, backgroundColor: '#f8fafc' }}>Bill Settlement Status:</td>
              <td>
                <span className={`status-badge ${payment.billStatus.toLowerCase()}`}>
                  {payment.billStatus}
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600, backgroundColor: '#f8fafc' }}>Payment Instrument / Mode:</td>
              <td>{payment.paymentMethod}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600, backgroundColor: '#f8fafc' }}>Transaction Ref / UTR:</td>
              <td className="num">{payment.transactionRef || '-'}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600, backgroundColor: '#f8fafc' }}>Cashier / System Node:</td>
              <td>{payment.recordedBy}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#64748b' }}>
          <div>
            * Subject to realization of bank instruments.<br />
            * Keep this computer-generated receipt for your records.
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong>Authorised Cashier</strong><br />
            State Electricity Distribution Board
          </div>
        </div>
      </div>
    </div>
  );
};
