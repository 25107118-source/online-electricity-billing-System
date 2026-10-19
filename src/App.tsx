import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { ConsumerDashboard } from './pages/ConsumerDashboard';
import { ConsumerManagement } from './pages/ConsumerManagement';
import { ConnectionManagement } from './pages/ConnectionManagement';
import { MeterReadings } from './pages/MeterReadings';
import { TariffManagement } from './pages/TariffManagement';
import { GenerateBill } from './pages/GenerateBill';
import { BillHistory } from './pages/BillHistory';
import { BillInvoice } from './pages/BillInvoice';
import { Payments } from './pages/Payments';
import { PaymentReceipt } from './pages/PaymentReceipt';
import { Reports } from './pages/Reports';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f4f6f9' }}>
        <p style={{ color: '#475569', fontSize: 14 }}>Authenticating portal session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-layout">
        <Sidebar />
        {children}
      </div>
    </div>
  );
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, isConsumer } = useAuth();
  if (isConsumer) {
    return <Navigate to="/consumer-dashboard" replace />;
  }
  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'ADMIN' ? <Navigate to="/dashboard" replace /> : <Navigate to="/consumer-dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              </ProtectedLayout>
            }
          />
          <Route
            path="/consumers"
            element={
              <ProtectedLayout>
                <AdminRoute>
                  <ConsumerManagement />
                </AdminRoute>
              </ProtectedLayout>
            }
          />
          <Route
            path="/connections"
            element={
              <ProtectedLayout>
                <ConnectionManagement />
              </ProtectedLayout>
            }
          />
          <Route
            path="/meter-readings"
            element={
              <ProtectedLayout>
                <AdminRoute>
                  <MeterReadings />
                </AdminRoute>
              </ProtectedLayout>
            }
          />
          <Route
            path="/tariffs"
            element={
              <ProtectedLayout>
                <AdminRoute>
                  <TariffManagement />
                </AdminRoute>
              </ProtectedLayout>
            }
          />
          <Route
            path="/generate-bill"
            element={
              <ProtectedLayout>
                <AdminRoute>
                  <GenerateBill />
                </AdminRoute>
              </ProtectedLayout>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedLayout>
                <AdminRoute>
                  <Reports />
                </AdminRoute>
              </ProtectedLayout>
            }
          />

          {/* Shared Routes (Both Admin and Consumer) */}
          <Route
            path="/consumer-dashboard"
            element={
              <ProtectedLayout>
                <ConsumerDashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/bills"
            element={
              <ProtectedLayout>
                <BillHistory />
              </ProtectedLayout>
            }
          />
          <Route
            path="/bills/:id"
            element={
              <ProtectedLayout>
                <BillInvoice />
              </ProtectedLayout>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedLayout>
                <Payments />
              </ProtectedLayout>
            }
          />
          <Route
            path="/payments/receipt/:receiptNumber"
            element={
              <ProtectedLayout>
                <PaymentReceipt />
              </ProtectedLayout>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
