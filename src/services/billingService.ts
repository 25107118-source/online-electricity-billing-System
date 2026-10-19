import { apiClient, API_BASE_URL } from './api';
import {
  User,
  Consumer,
  Connection,
  MeterReading,
  TariffSlab,
  Bill,
  Payment,
  DashboardStats,
  MonthlyReport,
  ConnectionType,
  PaymentMethod,
} from '../types';

const STORAGE_PREFIX = 'ebs_';

// State flag to track live backend reachability
let isLiveBackendActive: boolean | null = null;

// Allow forcing live mode or demo mode via localStorage setting
export const getActiveModePreference = (): 'AUTO' | 'FORCE_SPRING' | 'DEMO' => {
  return (localStorage.getItem('ebs_mode_pref') as any) || 'AUTO';
};

export const setActiveModePreference = (mode: 'AUTO' | 'FORCE_SPRING' | 'DEMO') => {
  localStorage.setItem('ebs_mode_pref', mode);
};

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const res = await apiClient.get('/auth/status', { timeout: 2000 });
    isLiveBackendActive = res.status === 200;
    return true;
  } catch {
    isLiveBackendActive = false;
    return false;
  }
};

export const getBackendMode = () => isLiveBackendActive;

// Helper to handle API vs Mock fallback logic cleanly
const shouldFallback = (err: any) => {
  const pref = getActiveModePreference();
  if (pref === 'FORCE_SPRING') return false; // Never fallback if user forced Spring Boot
  if (pref === 'DEMO') return true; // Always use local if user forced Demo

  // In AUTO mode: ONLY fallback if it's a network disconnect (!err.response)
  if (err.response) {
    // The server answered with 400, 401, 403, 404, 500 etc. Throw server's real message!
    const msg =
      err.response.data?.message ||
      err.response.data?.error ||
      `Server Error (${err.response.status})`;
    throw new Error(msg);
  }
  return true;
};

// -------------------------------------------------------------
// Seed Data Initialization for Local/Sandbox Preview
// -------------------------------------------------------------
const initLocalStore = () => {
  if (!localStorage.getItem(`${STORAGE_PREFIX}initialized`)) {
    const defaultTariffs: TariffSlab[] = [
      { id: 1, connectionType: 'DOMESTIC', fromUnit: 0, toUnit: 100, ratePerUnit: 3, fixedCharge: 100, effectiveDate: '2026-01-01', active: true },
      { id: 2, connectionType: 'DOMESTIC', fromUnit: 101, toUnit: 200, ratePerUnit: 5, fixedCharge: 100, effectiveDate: '2026-01-01', active: true },
      { id: 3, connectionType: 'DOMESTIC', fromUnit: 201, toUnit: null, ratePerUnit: 7, fixedCharge: 100, effectiveDate: '2026-01-01', active: true },
      { id: 4, connectionType: 'COMMERCIAL', fromUnit: 0, toUnit: 150, ratePerUnit: 6.5, fixedCharge: 250, effectiveDate: '2026-01-01', active: true },
      { id: 5, connectionType: 'COMMERCIAL', fromUnit: 151, toUnit: null, ratePerUnit: 9, fixedCharge: 250, effectiveDate: '2026-01-01', active: true },
    ];

    const defaultConsumers: Consumer[] = [
      { id: 1, consumerNumber: 'CUST1001', fullName: 'Rajesh Sharma', phoneNumber: '9876543210', email: 'rajesh.sharma@example.com', address: 'Flat 402, Shanti Niketan, Station Road, Mumbai', connectionCount: 1 },
      { id: 2, consumerNumber: 'CUST1002', fullName: 'Sunita Patil', phoneNumber: '9822334455', email: 'sunita.patil@example.com', address: 'Row House 12, Gulmohar Enclave, Pune', connectionCount: 1 },
      { id: 3, consumerNumber: 'CUST1003', fullName: 'Apex Supermarket', phoneNumber: '9811223344', email: 'contact@apexsupermarket.com', address: 'Shop 1-4, Commercial Complex, Sector 17, Vashi', connectionCount: 1 },
    ];

    const defaultConnections: Connection[] = [
      { id: 1, connectionNumber: 'CONN-1001', consumerId: 1, consumerName: 'Rajesh Sharma', consumerNumber: 'CUST1001', connectionType: 'DOMESTIC', meterNumber: 'MTR-88401', sanctionedLoadKw: 2.0, connectionDate: '2025-01-15', status: 'ACTIVE' },
      { id: 2, connectionNumber: 'CONN-1002', consumerId: 2, consumerName: 'Sunita Patil', consumerNumber: 'CUST1002', connectionType: 'DOMESTIC', meterNumber: 'MTR-88402', sanctionedLoadKw: 1.5, connectionDate: '2025-02-10', status: 'ACTIVE' },
      { id: 3, connectionNumber: 'CONN-1003', consumerId: 3, consumerName: 'Apex Supermarket', consumerNumber: 'CUST1003', connectionType: 'COMMERCIAL', meterNumber: 'MTR-99105', sanctionedLoadKw: 5.0, connectionDate: '2024-11-01', status: 'ACTIVE' },
    ];

    const defaultReadings: MeterReading[] = [
      { id: 1, connectionId: 1, connectionNumber: 'CONN-1001', meterNumber: 'MTR-88401', consumerId: 1, consumerName: 'Rajesh Sharma', consumerNumber: 'CUST1001', billingMonth: '2026-02', previousReading: 1200, currentReading: 1450, unitsConsumed: 250, readingDate: '2026-02-28', recordedBy: 'admin' },
      { id: 2, connectionId: 2, connectionNumber: 'CONN-1002', meterNumber: 'MTR-88402', consumerId: 2, consumerName: 'Sunita Patil', consumerNumber: 'CUST1002', billingMonth: '2026-02', previousReading: 800, currentReading: 980, unitsConsumed: 180, readingDate: '2026-02-28', recordedBy: 'admin' },
      { id: 3, connectionId: 3, connectionNumber: 'CONN-1003', meterNumber: 'MTR-99105', consumerId: 3, consumerName: 'Apex Supermarket', consumerNumber: 'CUST1003', billingMonth: '2026-02', previousReading: 3200, currentReading: 3600, unitsConsumed: 400, readingDate: '2026-02-28', recordedBy: 'admin' },
    ];

    const defaultBills: Bill[] = [
      {
        id: 1,
        billNumber: 'BILL-202602-0001',
        connectionId: 1,
        connectionNumber: 'CONN-1001',
        connectionType: 'DOMESTIC',
        meterNumber: 'MTR-88401',
        sanctionedLoadKw: 2.0,
        consumerId: 1,
        consumerNumber: 'CUST1001',
        consumerName: 'Rajesh Sharma',
        consumerEmail: 'rajesh.sharma@example.com',
        consumerPhone: '9876543210',
        consumerAddress: 'Flat 402, Shanti Niketan, Station Road, Mumbai',
        meterReadingId: 1,
        billingMonth: '2026-02',
        previousReading: 1200,
        currentReading: 1450,
        unitsConsumed: 250,
        readingDate: '2026-02-28',
        billDate: '2026-03-01',
        dueDate: '2026-03-20',
        energyCharges: 1150,
        fixedCharges: 100,
        otherCharges: 0,
        lateFee: 0,
        discount: 0,
        totalAmount: 1250,
        paidAmount: 1250,
        balanceAmount: 0,
        status: 'PAID',
        tariffDetailsJson: JSON.stringify({
          slabs: [
            { from: 0, to: 100, rate: 3, units: 100, amount: 300 },
            { from: 101, to: 200, rate: 5, units: 100, amount: 500 },
            { from: 201, to: null, rate: 7, units: 50, amount: 350 },
          ],
          fixedCharge: 100,
        }),
      },
      {
        id: 2,
        billNumber: 'BILL-202602-0002',
        connectionId: 2,
        connectionNumber: 'CONN-1002',
        connectionType: 'DOMESTIC',
        meterNumber: 'MTR-88402',
        sanctionedLoadKw: 1.5,
        consumerId: 2,
        consumerNumber: 'CUST1002',
        consumerName: 'Sunita Patil',
        consumerEmail: 'sunita.patil@example.com',
        consumerPhone: '9822334455',
        consumerAddress: 'Row House 12, Gulmohar Enclave, Pune',
        meterReadingId: 2,
        billingMonth: '2026-02',
        previousReading: 800,
        currentReading: 980,
        unitsConsumed: 180,
        readingDate: '2026-02-28',
        billDate: '2026-03-01',
        dueDate: '2026-03-20',
        energyCharges: 700,
        fixedCharges: 100,
        otherCharges: 0,
        lateFee: 0,
        discount: 0,
        totalAmount: 800,
        paidAmount: 0,
        balanceAmount: 800,
        status: 'UNPAID',
        tariffDetailsJson: JSON.stringify({
          slabs: [
            { from: 0, to: 100, rate: 3, units: 100, amount: 300 },
            { from: 101, to: 200, rate: 5, units: 80, amount: 400 },
          ],
          fixedCharge: 100,
        }),
      },
      {
        id: 3,
        billNumber: 'BILL-202602-0003',
        connectionId: 3,
        connectionNumber: 'CONN-1003',
        connectionType: 'COMMERCIAL',
        meterNumber: 'MTR-99105',
        sanctionedLoadKw: 5.0,
        consumerId: 3,
        consumerNumber: 'CUST1003',
        consumerName: 'Apex Supermarket',
        consumerEmail: 'contact@apexsupermarket.com',
        consumerPhone: '9811223344',
        consumerAddress: 'Shop 1-4, Commercial Complex, Sector 17, Vashi',
        meterReadingId: 3,
        billingMonth: '2026-02',
        previousReading: 3200,
        currentReading: 3600,
        unitsConsumed: 400,
        readingDate: '2026-02-28',
        billDate: '2026-03-01',
        dueDate: '2026-03-20',
        energyCharges: 3225,
        fixedCharges: 250,
        otherCharges: 0,
        lateFee: 0,
        discount: 0,
        totalAmount: 3475,
        paidAmount: 1000,
        balanceAmount: 2475,
        status: 'PARTIALLY_PAID',
        tariffDetailsJson: JSON.stringify({
          slabs: [
            { from: 0, to: 150, rate: 6.5, units: 150, amount: 975 },
            { from: 151, to: null, rate: 9, units: 250, amount: 2250 },
          ],
          fixedCharge: 250,
        }),
      },
    ];

    const defaultPayments: Payment[] = [
      {
        id: 1,
        receiptNumber: 'RCPT-202603-0001',
        billId: 1,
        billNumber: 'BILL-202602-0001',
        billingMonth: '2026-02',
        consumerId: 1,
        consumerName: 'Rajesh Sharma',
        consumerNumber: 'CUST1001',
        meterNumber: 'MTR-88401',
        paymentDate: '2026-03-05 11:30:00',
        amountPaid: 1250,
        billTotalAmount: 1250,
        remainingBalance: 0,
        billStatus: 'PAID',
        paymentMethod: 'UPI',
        transactionRef: 'UPI/606512399120',
        notes: 'Full payment settled via PhonePe',
        recordedBy: 'admin',
      },
      {
        id: 2,
        receiptNumber: 'RCPT-202603-0002',
        billId: 3,
        billNumber: 'BILL-202602-0003',
        billingMonth: '2026-02',
        consumerId: 3,
        consumerName: 'Apex Supermarket',
        consumerNumber: 'CUST1003',
        meterNumber: 'MTR-99105',
        paymentDate: '2026-03-06 14:15:00',
        amountPaid: 1000,
        billTotalAmount: 3475,
        remainingBalance: 2475,
        billStatus: 'PARTIALLY_PAID',
        paymentMethod: 'CARD',
        transactionRef: 'TXN-CRD-778102',
        notes: 'Advance partial payment via debit card',
        recordedBy: 'admin',
      },
    ];

    localStorage.setItem(`${STORAGE_PREFIX}tariffs`, JSON.stringify(defaultTariffs));
    localStorage.setItem(`${STORAGE_PREFIX}consumers`, JSON.stringify(defaultConsumers));
    localStorage.setItem(`${STORAGE_PREFIX}connections`, JSON.stringify(defaultConnections));
    localStorage.setItem(`${STORAGE_PREFIX}readings`, JSON.stringify(defaultReadings));
    localStorage.setItem(`${STORAGE_PREFIX}bills`, JSON.stringify(defaultBills));
    localStorage.setItem(`${STORAGE_PREFIX}payments`, JSON.stringify(defaultPayments));
    localStorage.setItem(`${STORAGE_PREFIX}initialized`, 'true');
  }
};

initLocalStore();

const getLocal = <T>(key: string): T[] => {
  return JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}${key}`) || '[]');
};

const setLocal = <T>(key: string, data: T[]) => {
  localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data));
};

// -------------------------------------------------------------
// Service Methods Implementation
// -------------------------------------------------------------

export const authService = {
  login: async (credentials: { username: string; password: string }): Promise<User> => {
    try {
      const res = await apiClient.post('/auth/login', credentials);
      localStorage.setItem('token', res.data.token);
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;

      // Local fallback
      const { username, password } = credentials;
      if (username === 'admin' && password === 'admin123') {
        const adminUser: User = { id: 1, username: 'admin', role: 'ADMIN', token: 'mock-jwt-admin-token' };
        localStorage.setItem('token', adminUser.token!);
        return adminUser;
      }
      const consumers = getLocal<Consumer>('consumers');
      const found = consumers.find((c) => c.consumerNumber.toLowerCase() === username.toLowerCase());
      if (found && password === 'pass123') {
        const consumerUser: User = {
          id: found.id,
          username: found.consumerNumber,
          role: 'CONSUMER',
          consumerNumber: found.consumerNumber,
          token: `mock-jwt-${found.consumerNumber}-token`,
        };
        localStorage.setItem('token', consumerUser.token!);
        return consumerUser;
      }
      throw new Error('Invalid username or password. (Hint: admin / admin123 or CUST1001 / pass123)');
    }
  },

  registerAdmin: async (data: { username: string; password: string }): Promise<User> => {
    try {
      const res = await apiClient.post('/auth/register-admin', data);
      localStorage.setItem('token', res.data.token);
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      const newUser: User = { id: Date.now(), username: data.username, role: 'ADMIN', token: 'mock-jwt-token' };
      localStorage.setItem('token', newUser.token!);
      return newUser;
    }
  },
};

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const res = await apiClient.get('/dashboard/stats');
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      const consumers = getLocal<Consumer>('consumers');
      const connections = getLocal<Connection>('connections');
      const bills = getLocal<Bill>('bills');
      const payments = getLocal<Payment>('payments');

      const totalBilled = bills.reduce((acc, b) => acc + Number(b.totalAmount), 0);
      const totalCollected = payments.reduce((acc, p) => acc + Number(p.amountPaid), 0);
      const outstanding = bills.reduce((acc, b) => acc + Number(b.balanceAmount), 0);

      const activeConns = connections.filter((c) => c.status === 'ACTIVE').length;

      return {
        totalRegisteredConsumers: consumers.length,
        activeConnections: activeConns,
        billsGeneratedThisMonth: bills.filter((b) => b.billingMonth === '2026-02').length,
        totalAmountBilledThisMonth: bills
          .filter((b) => b.billingMonth === '2026-02')
          .reduce((acc, b) => acc + Number(b.totalAmount), 0),
        totalAmountBilledAllTime: totalBilled,
        totalAmountCollectedAllTime: totalCollected,
        totalOutstandingPayments: outstanding,
        recentBills: [...bills].reverse().slice(0, 5),
      };
    }
  },
};

export const consumerService = {
  getAll: async (search?: string): Promise<Consumer[]> => {
    try {
      const res = await apiClient.get('/consumers', { params: { search } });
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      let consumers = getLocal<Consumer>('consumers');
      const connections = getLocal<Connection>('connections');

      consumers = consumers.map((c) => ({
        ...c,
        connectionCount: connections.filter((conn) => conn.consumerId === c.id).length,
      }));

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        return consumers.filter(
          (c) =>
            c.fullName.toLowerCase().includes(q) ||
            c.consumerNumber.toLowerCase().includes(q) ||
            c.phoneNumber.includes(q) ||
            c.email.toLowerCase().includes(q)
        );
      }
      return consumers;
    }
  },

  getById: async (id: number): Promise<Consumer> => {
    try {
      const res = await apiClient.get(`/consumers/${id}`);
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      const consumers = getLocal<Consumer>('consumers');
      const found = consumers.find((c) => c.id === id);
      if (!found) throw new Error('Consumer not found');
      return found;
    }
  },

  getByNumber: async (consumerNumber: string): Promise<Consumer> => {
    try {
      const res = await apiClient.get(`/consumers/by-number/${consumerNumber}`);
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      const consumers = getLocal<Consumer>('consumers');
      const found = consumers.find((c) => c.consumerNumber === consumerNumber);
      if (!found) throw new Error('Consumer not found');
      return found;
    }
  },

  getCurrentConsumerProfile: async (): Promise<Consumer> => {
    try {
      const res = await apiClient.get('/consumers/me');
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser?.consumerNumber) {
        return consumerService.getByNumber(currentUser.consumerNumber);
      }
      throw new Error('Consumer profile not found');
    }
  },

  create: async (data: Omit<Consumer, 'id' | 'consumerNumber'> & { consumerNumber?: string }): Promise<Consumer> => {
    try {
      const res = await apiClient.post('/consumers', data);
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      const consumers = getLocal<Consumer>('consumers');
      const nextId = consumers.length > 0 ? Math.max(...consumers.map((c) => c.id)) + 1 : 1;
      const consumerNumber = data.consumerNumber || `CUST${1000 + nextId}`;

      if (consumers.some((c) => c.consumerNumber === consumerNumber)) {
        throw new Error(`Consumer number ${consumerNumber} already exists`);
      }
      if (consumers.some((c) => c.email.toLowerCase() === data.email.toLowerCase())) {
        throw new Error(`Email ${data.email} is already in use`);
      }

      const newConsumer: Consumer = {
        id: nextId,
        consumerNumber,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        address: data.address,
        createdAt: new Date().toISOString(),
        connectionCount: 0,
      };

      consumers.push(newConsumer);
      setLocal('consumers', consumers);
      return newConsumer;
    }
  },

  update: async (id: number, data: Partial<Consumer>): Promise<Consumer> => {
    try {
      const res = await apiClient.put(`/consumers/${id}`, data);
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      const consumers = getLocal<Consumer>('consumers');
      const index = consumers.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Consumer not found');

      consumers[index] = { ...consumers[index], ...data };
      setLocal('consumers', consumers);
      return consumers[index];
    }
  },
};

export const connectionService = {
  getAll: async (): Promise<Connection[]> => {
    try {
      const res = await apiClient.get('/connections');
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      return getLocal<Connection>('connections');
    }
  },

  getByConsumerNumber: async (consumerNumber: string): Promise<Connection[]> => {
    try {
      const res = await apiClient.get(`/connections/consumer/${consumerNumber}`);
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      const connections = getLocal<Connection>('connections');
      return connections.filter((c) => c.consumerNumber === consumerNumber);
    }
  },

  create: async (data: {
    consumerId: number;
    connectionType: ConnectionType;
    meterNumber?: string;
    sanctionedLoadKw: number;
    connectionDate?: string;
  }): Promise<Connection> => {
    try {
      const res = await apiClient.post('/connections', data);
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      const connections = getLocal<Connection>('connections');
      const consumers = getLocal<Consumer>('consumers');
      const consumer = consumers.find((c) => c.id === data.consumerId);
      if (!consumer) throw new Error('Consumer not found');

      const nextId = connections.length > 0 ? Math.max(...connections.map((c) => c.id)) + 1 : 1;
      const connectionNumber = `CONN-${1000 + nextId}`;
      const meterNumber = data.meterNumber || `MTR-${88400 + nextId}`;

      const newConn: Connection = {
        id: nextId,
        connectionNumber,
        consumerId: consumer.id,
        consumerName: consumer.fullName,
        consumerNumber: consumer.consumerNumber,
        connectionType: data.connectionType,
        meterNumber,
        sanctionedLoadKw: data.sanctionedLoadKw || 1.0,
        connectionDate: data.connectionDate || new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      connections.push(newConn);
      setLocal('connections', connections);
      return newConn;
    }
  },

  updateStatus: async (id: number, status: 'ACTIVE' | 'DISCONNECTED'): Promise<Connection> => {
    try {
      const res = await apiClient.patch(`/connections/${id}/status`, null, { params: { status } });
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      const connections = getLocal<Connection>('connections');
      const index = connections.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Connection not found');
      connections[index].status = status;
      setLocal('connections', connections);
      return connections[index];
    }
  },
};

export const meterReadingService = {
  getAll: async (): Promise<MeterReading[]> => {
    try {
      const res = await apiClient.get('/meter-readings');
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      return getLocal<MeterReading>('readings');
    }
  },

  getPreviousReading: async (connectionId: number): Promise<number> => {
    try {
      const res = await apiClient.get(`/meter-readings/previous-reading/${connectionId}`);
      return res.data.previousReading;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      const readings = getLocal<MeterReading>('readings');
      const connReadings = readings.filter((r) => r.connectionId === connectionId);
      if (connReadings.length === 0) return 0;
      connReadings.sort((a, b) => b.currentReading - a.currentReading);
      return connReadings[0].currentReading;
    }
  },

  record: async (data: {
    connectionId: number;
    billingMonth: string;
    previousReading: number;
    currentReading: number;
    readingDate?: string;
  }): Promise<MeterReading> => {
    try {
      const res = await apiClient.post('/meter-readings', data);
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      const readings = getLocal<MeterReading>('readings');
      const connections = getLocal<Connection>('connections');
      const connection = connections.find((c) => c.id === data.connectionId);
      if (!connection) throw new Error('Connection not found');

      if (readings.some((r) => r.connectionId === data.connectionId && r.billingMonth === data.billingMonth)) {
        throw new Error(`Meter reading for ${data.billingMonth} already exists for this connection`);
      }

      if (data.currentReading < data.previousReading) {
        throw new Error(`Current reading (${data.currentReading}) cannot be less than previous reading (${data.previousReading})`);
      }

      const unitsConsumed = Number((data.currentReading - data.previousReading).toFixed(2));
      const nextId = readings.length > 0 ? Math.max(...readings.map((r) => r.id)) + 1 : 1;

      const newReading: MeterReading = {
        id: nextId,
        connectionId: connection.id,
        connectionNumber: connection.connectionNumber,
        meterNumber: connection.meterNumber,
        consumerId: connection.consumerId,
        consumerName: connection.consumerName,
        consumerNumber: connection.consumerNumber,
        billingMonth: data.billingMonth,
        previousReading: data.previousReading,
        currentReading: data.currentReading,
        unitsConsumed,
        readingDate: data.readingDate || new Date().toISOString().split('T')[0],
        recordedBy: 'admin',
      };

      readings.unshift(newReading);
      setLocal('readings', readings);
      return newReading;
    }
  },
};

export const tariffService = {
  getAll: async (): Promise<TariffSlab[]> => {
    try {
      const res = await apiClient.get('/tariffs');
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      return getLocal<TariffSlab>('tariffs');
    }
  },

  update: async (id: number, data: Partial<TariffSlab>): Promise<TariffSlab> => {
    try {
      const res = await apiClient.put(`/tariffs/${id}`, data);
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      const tariffs = getLocal<TariffSlab>('tariffs');
      const index = tariffs.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Tariff slab not found');
      tariffs[index] = { ...tariffs[index], ...data };
      setLocal('tariffs', tariffs);
      return tariffs[index];
    }
  },

  calculateEstimate: (units: number, connectionType: ConnectionType = 'DOMESTIC') => {
    const tariffs = getLocal<TariffSlab>('tariffs').filter((t) => t.connectionType === connectionType && t.active);
    tariffs.sort((a, b) => a.fromUnit - b.fromUnit);

    let remaining = units;
    let energyCharges = 0;
    const breakdown: { from: number; to: number | null; rate: number; units: number; amount: number }[] = [];
    const fixedCharge = tariffs[0]?.fixedCharge || 100;

    for (const slab of tariffs) {
      if (remaining <= 0) break;
      const capacity = slab.toUnit === null ? Infinity : slab.toUnit - slab.fromUnit + (slab.fromUnit === 0 ? 0 : 1);
      const unitsInSlab = Math.min(remaining, capacity);
      const amount = Number((unitsInSlab * slab.ratePerUnit).toFixed(2));

      energyCharges += amount;
      remaining -= unitsInSlab;

      breakdown.push({
        from: slab.fromUnit,
        to: slab.toUnit,
        rate: slab.ratePerUnit,
        units: unitsInSlab,
        amount,
      });
    }

    const total = energyCharges + fixedCharge;
    return {
      energyCharges: Number(energyCharges.toFixed(2)),
      fixedCharge,
      total: Number(total.toFixed(2)),
      breakdown,
    };
  },
};

export const billService = {
  getAll: async (params?: { consumerNumber?: string; month?: string; status?: string }): Promise<Bill[]> => {
    try {
      const res = await apiClient.get('/bills', { params });
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      let bills = getLocal<Bill>('bills');
      if (params?.consumerNumber) {
        bills = bills.filter((b) => b.consumerNumber.toLowerCase() === params.consumerNumber?.toLowerCase());
      }
      if (params?.month) {
        bills = bills.filter((b) => b.billingMonth === params.month);
      }
      if (params?.status) {
        bills = bills.filter((b) => b.status === params.status);
      }
      return bills;
    }
  },

  getById: async (id: number): Promise<Bill> => {
    try {
      const res = await apiClient.get(`/bills/${id}`);
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      const bills = getLocal<Bill>('bills');
      const found = bills.find((b) => b.id === id);
      if (!found) throw new Error('Bill not found');
      return found;
    }
  },

  getByNumber: async (billNumber: string): Promise<Bill> => {
    try {
      const res = await apiClient.get(`/bills/number/${billNumber}`);
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      const bills = getLocal<Bill>('bills');
      const found = bills.find((b) => b.billNumber === billNumber);
      if (!found) throw new Error('Bill not found');
      return found;
    }
  },

  generate: async (data: {
    connectionId: number;
    billingMonth: string;
    billDate?: string;
    dueDate?: string;
    otherCharges?: number;
    lateFee?: number;
    discount?: number;
  }): Promise<Bill> => {
    try {
      const res = await apiClient.post('/bills/generate', data);
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      const bills = getLocal<Bill>('bills');
      const connections = getLocal<Connection>('connections');
      const readings = getLocal<MeterReading>('readings');
      const consumers = getLocal<Consumer>('consumers');

      const connection = connections.find((c) => c.id === data.connectionId);
      if (!connection) throw new Error('Connection not found');

      const consumer = consumers.find((c) => c.id === connection.consumerId);
      if (!consumer) throw new Error('Consumer not found');

      if (bills.some((b) => b.connectionId === connection.id && b.billingMonth === data.billingMonth)) {
        throw new Error(`A bill has already been generated for connection ${connection.connectionNumber} for month ${data.billingMonth}`);
      }

      const reading = readings.find((r) => r.connectionId === connection.id && r.billingMonth === data.billingMonth);
      if (!reading) {
        throw new Error(`No meter reading found for month ${data.billingMonth}. Please record reading first.`);
      }

      const calc = tariffService.calculateEstimate(reading.unitsConsumed, connection.connectionType);

      const otherCharges = data.otherCharges || 0;
      const lateFee = data.lateFee || 0;
      const discount = data.discount || 0;
      const totalAmount = Number((calc.total + otherCharges + lateFee - discount).toFixed(2));

      const billDate = data.billDate || new Date().toISOString().split('T')[0];
      const dueDate = data.dueDate || new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0];

      const nextId = bills.length > 0 ? Math.max(...bills.map((b) => b.id)) + 1 : 1;
      const billNumber = `BILL-${data.billingMonth.replace('-', '')}-${String(nextId).padStart(4, '0')}`;

      const newBill: Bill = {
        id: nextId,
        billNumber,
        connectionId: connection.id,
        connectionNumber: connection.connectionNumber,
        connectionType: connection.connectionType,
        meterNumber: connection.meterNumber,
        sanctionedLoadKw: connection.sanctionedLoadKw,
        consumerId: consumer.id,
        consumerNumber: consumer.consumerNumber,
        consumerName: consumer.fullName,
        consumerEmail: consumer.email,
        consumerPhone: consumer.phoneNumber,
        consumerAddress: consumer.address,
        meterReadingId: reading.id,
        billingMonth: data.billingMonth,
        previousReading: reading.previousReading,
        currentReading: reading.currentReading,
        unitsConsumed: reading.unitsConsumed,
        readingDate: reading.readingDate,
        billDate,
        dueDate,
        energyCharges: calc.energyCharges,
        fixedCharges: calc.fixedCharge,
        otherCharges,
        lateFee,
        discount,
        totalAmount,
        paidAmount: 0,
        balanceAmount: totalAmount,
        status: 'UNPAID',
        tariffDetailsJson: JSON.stringify({
          slabs: calc.breakdown,
          fixedCharge: calc.fixedCharge,
        }),
        createdAt: new Date().toISOString(),
      };

      bills.unshift(newBill);
      setLocal('bills', bills);
      return newBill;
    }
  },
};

export const paymentService = {
  getAll: async (): Promise<Payment[]> => {
    try {
      const res = await apiClient.get('/payments');
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      return getLocal<Payment>('payments');
    }
  },

  getByConsumerNumber: async (consumerNumber: string): Promise<Payment[]> => {
    try {
      const res = await apiClient.get(`/payments/me`);
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      const payments = getLocal<Payment>('payments');
      return payments.filter((p) => p.consumerNumber === consumerNumber);
    }
  },

  getByReceiptNumber: async (receiptNumber: string): Promise<Payment> => {
    try {
      const res = await apiClient.get(`/payments/receipt/${receiptNumber}`);
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      const payments = getLocal<Payment>('payments');
      const found = payments.find((p) => p.receiptNumber === receiptNumber);
      if (!found) throw new Error('Payment receipt not found');
      return found;
    }
  },

  record: async (data: {
    billId: number;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    transactionRef?: string;
    notes?: string;
  }): Promise<Payment> => {
    try {
      const res = await apiClient.post('/payments', data);
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      const bills = getLocal<Bill>('bills');
      const payments = getLocal<Payment>('payments');

      const bill = bills.find((b) => b.id === data.billId);
      if (!bill) throw new Error('Bill not found');

      if (bill.status === 'PAID') {
        throw new Error(`Bill ${bill.billNumber} is already fully paid`);
      }

      const amountPaid = Number(Number(data.amountPaid).toFixed(2));
      if (amountPaid <= 0) {
        throw new Error('Payment amount must be greater than zero');
      }
      if (amountPaid > bill.balanceAmount) {
        throw new Error(`Payment amount (₹${amountPaid}) cannot exceed remaining balance (₹${bill.balanceAmount})`);
      }

      const newPaidAmount = Number((bill.paidAmount + amountPaid).toFixed(2));
      const newBalance = Number((bill.totalAmount - newPaidAmount).toFixed(2));
      bill.paidAmount = newPaidAmount;
      bill.balanceAmount = newBalance;
      bill.status = newBalance === 0 ? 'PAID' : 'PARTIALLY_PAID';

      setLocal('bills', bills);

      const nextId = payments.length > 0 ? Math.max(...payments.map((p) => p.id)) + 1 : 1;
      const receiptNumber = `RCPT-${bill.billingMonth.replace('-', '')}-${String(nextId).padStart(4, '0')}`;

      const newPayment: Payment = {
        id: nextId,
        receiptNumber,
        billId: bill.id,
        billNumber: bill.billNumber,
        billingMonth: bill.billingMonth,
        consumerId: bill.consumerId,
        consumerName: bill.consumerName,
        consumerNumber: bill.consumerNumber,
        meterNumber: bill.meterNumber,
        paymentDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
        amountPaid,
        billTotalAmount: bill.totalAmount,
        remainingBalance: newBalance,
        billStatus: bill.status,
        paymentMethod: data.paymentMethod,
        transactionRef: data.transactionRef || `TXN-${data.paymentMethod}-${Date.now().toString().slice(-6)}`,
        notes: data.notes || `Payment received via ${data.paymentMethod}`,
        recordedBy: 'admin',
      };

      payments.unshift(newPayment);
      setLocal('payments', payments);
      return newPayment;
    }
  },
};

export const reportService = {
  getMonthlyReports: async (): Promise<MonthlyReport[]> => {
    try {
      const res = await apiClient.get('/reports/monthly');
      return res.data;
    } catch (err: any) {
      if (!shouldFallback(err)) throw err;
      const bills = getLocal<Bill>('bills');
      const byMonth: Record<string, Bill[]> = {};

      bills.forEach((b) => {
        if (!byMonth[b.billingMonth]) byMonth[b.billingMonth] = [];
        byMonth[b.billingMonth].push(b);
      });

      const reports: MonthlyReport[] = Object.keys(byMonth).map((month) => {
        const mBills = byMonth[month];
        const totalBills = mBills.length;
        const totalUnitsConsumed = mBills.reduce((acc, b) => acc + Number(b.unitsConsumed), 0);
        const totalBilledAmount = mBills.reduce((acc, b) => acc + Number(b.totalAmount), 0);
        const totalCollectedAmount = mBills.reduce((acc, b) => acc + Number(b.paidAmount), 0);
        const outstandingAmount = mBills.reduce((acc, b) => acc + Number(b.balanceAmount), 0);
        const efficiency = totalBilledAmount > 0 ? (totalCollectedAmount / totalBilledAmount) * 100 : 0;

        return {
          month,
          totalBills,
          totalUnitsConsumed,
          totalBilledAmount: Number(totalBilledAmount.toFixed(2)),
          totalCollectedAmount: Number(totalCollectedAmount.toFixed(2)),
          outstandingAmount: Number(outstandingAmount.toFixed(2)),
          collectionEfficiencyPercentage: Number(efficiency.toFixed(1)),
        };
      });

      reports.sort((a, b) => b.month.localeCompare(a.month));
      return reports;
    }
  },
};
