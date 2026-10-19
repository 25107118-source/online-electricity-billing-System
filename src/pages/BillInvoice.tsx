import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { billService } from '../services/billingService';
import { Bill } from '../types';
import { Printer, ArrowLeft, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert } from '../components/Alert';

export const BillInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const fetchBill = async () => {
      setLoading(true);
      try {
        const data = await billService.getById(Number(id));
        setBill(data);
      } catch (err: any) {
        setError(err.message || 'Bill invoice not found');
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="content-area" style={{ textAlign: 'center', padding: '60px' }}>
        <p>Loading electricity bill invoice...</p>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="content-area">
        <Alert type="error" message={error || 'Invoice not found'} />
        <button onClick={() => navigate('/bills')} className="btn btn-secondary">
          <ArrowLeft size={14} />
          <span>Back to Bills</span>
        </button>
      </div>
    );
  }

  // Parse tariff slabs details JSON
  let slabItems: any[] = [];
  try {
    if (bill.tariffDetailsJson) {
      const parsed = JSON.parse(bill.tariffDetailsJson);
      slabItems = parsed.slabs || [];
    }
  } catch {}

  return (
    <div className="content-area">
      {/* Top Toolbar (Hidden during print) */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          maxWidth: 820,
          margin: '0 auto 20px auto',
        }}
      >
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          {bill.balanceAmount > 0 && (
            <Link to="/payments" className="btn btn-primary btn-sm">
              Pay Bill (₹{bill.balanceAmount.toFixed(2)})
            </Link>
          )}
          <button onClick={handlePrint} className="btn btn-outline btn-sm">
            <Printer size={14} />
            <span>Print Invoice (A4)</span>
          </button>
        </div>
      </div>

      {/* Official Municipal Electricity Bill Invoice Document */}
      <div className="invoice-container">
        {/* Header */}
        <div className="invoice-header">
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div
              style={{
                width: 44,
                height: 44,
                backgroundColor: 'var(--primary-blue)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
              }}
            >
              <Zap size={24} />
            </div>
            <div>
              <div className="gov-org-name">STATE ELECTRICITY DISTRIBUTION CORPORATION LTD.</div>
              <div className="gov-dept-name">A Government of India Undertaking · Electricity Revenue Department</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                GSTIN: 27AAACS1234F1Z8 · Customer Care / Helpline: 1912 (Toll Free)
              </div>
            </div>
          </div>
          <div className="invoice-badge-title">
            <div className="invoice-type-text">ELECTRICITY BILL</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginTop: 2 }}>
              CYCLE: {bill.billingMonth}
            </div>
          </div>
        </div>

        {/* Consumer & Metering Meta Grid */}
        <div className="invoice-meta-grid">
          <div className="invoice-meta-block">
            <div style={{ fontWeight: 700, borderBottom: '1px solid #cbd5e1', paddingBottom: 4, marginBottom: 6 }}>
              CONSUMER PARTICULARS
            </div>
            <div>
              <span className="invoice-meta-label">Consumer Number:</span>{' '}
              <strong className="num">{bill.consumerNumber}</strong>
            </div>
            <div>
              <span className="invoice-meta-label">Consumer Name:</span>{' '}
              <strong>{bill.consumerName}</strong>
            </div>
            <div>
              <span className="invoice-meta-label">Mobile Phone:</span> {bill.consumerPhone}
            </div>
            <div>
              <span className="invoice-meta-label">Email:</span> {bill.consumerEmail}
            </div>
            <div style={{ marginTop: 4 }}>
              <span className="invoice-meta-label">Supply Address:</span> {bill.consumerAddress}
            </div>
          </div>

          <div className="invoice-meta-block">
            <div style={{ fontWeight: 700, borderBottom: '1px solid #cbd5e1', paddingBottom: 4, marginBottom: 6 }}>
              BILL & CONNECTION DETAILS
            </div>
            <div>
              <span className="invoice-meta-label">Bill Number:</span>{' '}
              <strong className="num">{bill.billNumber}</strong>
            </div>
            <div>
              <span className="invoice-meta-label">Bill Issue Date:</span> {bill.billDate}
            </div>
            <div>
              <span className="invoice-meta-label">Payment Due Date:</span>{' '}
              <strong style={{ color: '#b91c1c' }}>{bill.dueDate}</strong>
            </div>
            <div>
              <span className="invoice-meta-label">Connection Number:</span>{' '}
              <span className="num">{bill.connectionNumber}</span>
            </div>
            <div>
              <span className="invoice-meta-label">Tariff Category:</span>{' '}
              <strong>{bill.connectionType}</strong>
            </div>
            <div>
              <span className="invoice-meta-label">Sanctioned Load:</span> {bill.sanctionedLoadKw} kW
            </div>
          </div>
        </div>

        {/* Meter Reading Summary Table */}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>METER READING STATEMENT</div>
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Meter Number</th>
              <th>Reading Date</th>
              <th className="num-cell">Previous Index (kWh)</th>
              <th className="num-cell">Current Index (kWh)</th>
              <th className="num-cell">Multiplying Factor</th>
              <th className="num-cell">Total Units Consumed</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="num" style={{ fontWeight: 600 }}>{bill.meterNumber}</td>
              <td>{bill.readingDate}</td>
              <td className="num-cell font-mono">{bill.previousReading}</td>
              <td className="num-cell font-mono">{bill.currentReading}</td>
              <td className="num-cell font-mono">1.0</td>
              <td className="num-cell font-mono" style={{ fontWeight: 700, fontSize: 14 }}>
                {bill.unitsConsumed} kWh
              </td>
            </tr>
          </tbody>
        </table>

        {/* Progressive Tariff Calculation Table */}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, marginTop: 16 }}>
          PROGRESSIVE TARIFF ENERGY ASSESSMENT
        </div>
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Tariff Slab Description</th>
              <th className="num-cell">Units Billed</th>
              <th className="num-cell">Rate / Unit (₹)</th>
              <th className="num-cell">Energy Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {slabItems.length > 0 ? (
              slabItems.map((slab: any, idx: number) => (
                <tr key={idx}>
                  <td>
                    Slab {idx + 1} ({slab.from} – {slab.to === null ? 'Above' : slab.to} units)
                  </td>
                  <td className="num-cell font-mono">{slab.units}</td>
                  <td className="num-cell font-mono">₹{Number(slab.rate).toFixed(2)}</td>
                  <td className="num-cell font-mono">₹{Number(slab.amount).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td>Standard Slabs Calculation ({bill.unitsConsumed} units)</td>
                <td className="num-cell font-mono">{bill.unitsConsumed}</td>
                <td className="num-cell font-mono">-</td>
                <td className="num-cell font-mono">₹{bill.energyCharges.toFixed(2)}</td>
              </tr>
            )}
            <tr style={{ backgroundColor: '#f8fafc', fontWeight: 600 }}>
              <td colSpan={3}>Subtotal Energy Charges</td>
              <td className="num-cell font-mono">₹{bill.energyCharges.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* Financial Summary Calculation Box */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 16 }}>
          {/* Status & Payment Stamp */}
          <div style={{ border: '2px dashed #94a3b8', padding: 14, borderRadius: 4, width: 280, textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              BILL PAYMENT STATUS
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color:
                  bill.status === 'PAID'
                    ? '#15803d'
                    : bill.status === 'PARTIALLY_PAID'
                    ? '#b45309'
                    : '#b91c1c',
                margin: '8px 0',
              }}
            >
              {bill.status}
            </div>
            <div style={{ fontSize: 11.5, color: '#475569' }}>
              {bill.status === 'PAID'
                ? `Paid in Full · Outstanding: ₹0.00`
                : bill.status === 'PARTIALLY_PAID'
                ? `Partial Paid: ₹${bill.paidAmount.toFixed(2)} · Balance: ₹${bill.balanceAmount.toFixed(2)}`
                : `Pay Before: ${bill.dueDate}`}
            </div>
          </div>

          {/* Amount Calculation Rows */}
          <div className="invoice-summary-box">
            <div className="summary-row">
              <span>Energy Charges:</span>
              <span className="font-mono">₹{bill.energyCharges.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Fixed Demand Charges:</span>
              <span className="font-mono">₹{bill.fixedCharges.toFixed(2)}</span>
            </div>
            {bill.otherCharges > 0 && (
              <div className="summary-row">
                <span>Other Charges / Duty:</span>
                <span className="font-mono">₹{bill.otherCharges.toFixed(2)}</span>
              </div>
            )}
            {bill.lateFee > 0 && (
              <div className="summary-row">
                <span>Arrears / Surcharge:</span>
                <span className="font-mono">₹{bill.lateFee.toFixed(2)}</span>
              </div>
            )}
            {bill.discount > 0 && (
              <div className="summary-row" style={{ color: '#15803d' }}>
                <span>Rebate / Subsidy:</span>
                <span className="font-mono">−₹{bill.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row grand-total">
              <span>TOTAL BILL AMOUNT:</span>
              <span>₹{bill.totalAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Amount Paid:</span>
              <span className="font-mono" style={{ color: '#15803d', fontWeight: 600 }}>
                ₹{bill.paidAmount.toFixed(2)}
              </span>
            </div>
            <div className="summary-row" style={{ backgroundColor: '#fff1f2', fontWeight: 700, color: '#b91c1c' }}>
              <span>NET PAYABLE BALANCE:</span>
              <span className="font-mono">₹{bill.balanceAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="invoice-footer">
          <div>
            1. Cheque/Demand Draft payable to "State Electricity Distribution Corporation Ltd."<br />
            2. Late payment surcharge @ 1.5% per month will be applicable after due date {bill.dueDate}.<br />
            3. This is a computer generated invoice and requires no physical signature.
          </div>
          <div style={{ textAlign: 'right', marginTop: 10 }}>
            <strong>Revenue Officer</strong><br />
            Sub-Divisional Office, Electricity Dept.
          </div>
        </div>
      </div>
    </div>
  );
};
