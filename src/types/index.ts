export type Role = 'ADMIN' | 'CONSUMER';

export type ConnectionType = 'DOMESTIC' | 'COMMERCIAL';
export type ConnectionStatus = 'ACTIVE' | 'DISCONNECTED';
export type BillStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
export type PaymentMethod = 'CASH' | 'CARD' | 'UPI';

export interface User {
  id: number;
  username: string;
  role: Role;
  consumerNumber?: string;
  token?: string;
}

export interface Consumer {
  id: number;
  consumerNumber: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  createdAt?: string;
  connectionCount?: number;
}

export interface Connection {
  id: number;
  connectionNumber: string;
  consumerId: number;
  consumerName?: string;
  consumerNumber?: string;
  connectionType: ConnectionType;
  meterNumber: string;
  sanctionedLoadKw: number;
  connectionDate: string;
  status: ConnectionStatus;
  createdAt?: string;
}

export interface MeterReading {
  id: number;
  connectionId: number;
  connectionNumber?: string;
  meterNumber?: string;
  consumerId?: number;
  consumerName?: string;
  consumerNumber?: string;
  billingMonth: string; // YYYY-MM
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  readingDate: string;
  recordedBy: string;
}

export interface TariffSlab {
  id: number;
  connectionType: ConnectionType;
  fromUnit: number;
  toUnit: number | null;
  ratePerUnit: number;
  fixedCharge: number;
  effectiveDate: string;
  active: boolean;
}

export interface SlabBreakdownItem {
  from: number;
  to: number | null;
  rate: number;
  units: number;
  amount: number;
}

export interface Bill {
  id: number;
  billNumber: string;
  connectionId: number;
  connectionNumber: string;
  connectionType: ConnectionType;
  meterNumber: string;
  sanctionedLoadKw: number;
  consumerId: number;
  consumerNumber: string;
  consumerName: string;
  consumerEmail: string;
  consumerPhone: string;
  consumerAddress: string;
  meterReadingId: number;
  billingMonth: string;
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  readingDate: string;
  billDate: string;
  dueDate: string;
  energyCharges: number;
  fixedCharges: number;
  otherCharges: number;
  lateFee: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: BillStatus;
  tariffDetailsJson?: string;
  createdAt?: string;
}

export interface Payment {
  id: number;
  receiptNumber: string;
  billId: number;
  billNumber: string;
  billingMonth: string;
  consumerId: number;
  consumerName: string;
  consumerNumber: string;
  meterNumber: string;
  paymentDate: string;
  amountPaid: number;
  billTotalAmount: number;
  remainingBalance: number;
  billStatus: string;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  notes?: string;
  recordedBy: string;
}

export interface DashboardStats {
  totalRegisteredConsumers: number;
  activeConnections: number;
  billsGeneratedThisMonth: number;
  totalAmountBilledThisMonth: number;
  totalAmountBilledAllTime: number;
  totalAmountCollectedAllTime: number;
  totalOutstandingPayments: number;
  recentBills: Bill[];
}

export interface MonthlyReport {
  month: string;
  totalBills: number;
  totalUnitsConsumed: number;
  totalBilledAmount: number;
  totalCollectedAmount: number;
  outstandingAmount: number;
  collectionEfficiencyPercentage: number;
}
