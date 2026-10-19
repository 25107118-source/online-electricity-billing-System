import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Cable,
  Gauge,
  SlidersHorizontal,
  FileSpreadsheet,
  ReceiptText,
  CreditCard,
  BarChart3,
  Home,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();

  return (
    <aside className="app-sidebar">
      <ul className="sidebar-menu">
        <li className="menu-heading">Main Navigation</li>

        {isAdmin ? (
          <>
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>Admin Dashboard</span>
              </NavLink>
            </li>

            <li className="menu-heading" style={{ marginTop: 8 }}>
              Consumer Registry
            </li>
            <li>
              <NavLink
                to="/consumers"
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
              >
                <Users size={18} />
                <span>Consumers</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/connections"
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
              >
                <Cable size={18} />
                <span>Connections</span>
              </NavLink>
            </li>

            <li className="menu-heading" style={{ marginTop: 8 }}>
              Metering & Billing
            </li>
            <li>
              <NavLink
                to="/meter-readings"
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
              >
                <Gauge size={18} />
                <span>Meter Readings</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/tariffs"
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
              >
                <SlidersHorizontal size={18} />
                <span>Tariff Slabs</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/generate-bill"
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
              >
                <FileSpreadsheet size={18} />
                <span>Generate Bill</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/bills"
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
              >
                <ReceiptText size={18} />
                <span>Bill History</span>
              </NavLink>
            </li>

            <li className="menu-heading" style={{ marginTop: 8 }}>
              Revenue & Accounts
            </li>
            <li>
              <NavLink
                to="/payments"
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
              >
                <CreditCard size={18} />
                <span>Payments</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/reports"
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
              >
                <BarChart3 size={18} />
                <span>Reports</span>
              </NavLink>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink
                to="/consumer-dashboard"
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
              >
                <Home size={18} />
                <span>Consumer Portal</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/bills"
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
              >
                <ReceiptText size={18} />
                <span>My Electricity Bills</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/payments"
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
              >
                <CreditCard size={18} />
                <span>Payment & Receipts</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/connections"
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
              >
                <Cable size={18} />
                <span>My Connection Info</span>
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </aside>
  );
};
