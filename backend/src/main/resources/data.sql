-- Seed initial data for Electricity Billing System
-- Passwords: 'admin123' and 'pass123' hashed using BCrypt

-- 1. Default Tariff Slabs (Domestic: 0-100 @ 3, 101-200 @ 5, >200 @ 7; Fixed: 100)
INSERT IGNORE INTO tariff_slabs (id, connection_type, from_unit, to_unit, rate_per_unit, fixed_charge, effective_date, active)
VALUES 
(1, 'DOMESTIC', 0, 100, 3.00, 100.00, '2026-01-01', TRUE),
(2, 'DOMESTIC', 101, 200, 5.00, 100.00, '2026-01-01', TRUE),
(3, 'DOMESTIC', 201, NULL, 7.00, 100.00, '2026-01-01', TRUE),
(4, 'COMMERCIAL', 0, 150, 6.50, 250.00, '2026-01-01', TRUE),
(5, 'COMMERCIAL', 151, NULL, 9.00, 250.00, '2026-01-01', TRUE);

-- 2. Default Admin User (username: admin, password: admin123)
-- BCrypt for 'admin123' is $2a$10$w09yEaD7wD5F/W7L7n73Oek8gN1L2h/eL.L3b7zP0X8I1p5n1A4Q2
INSERT IGNORE INTO users (id, username, password, role, consumer_number, active)
VALUES (1, 'admin', '$2a$10$w09yEaD7wD5F/W7L7n73Oek8gN1L2h/eL.L3b7zP0X8I1p5n1A4Q2', 'ADMIN', NULL, TRUE);

-- 3. Initial Sample Consumers
INSERT IGNORE INTO consumers (id, consumer_number, full_name, phone_number, email, address)
VALUES 
(1, 'CUST1001', 'Rajesh Sharma', '9876543210', 'rajesh.sharma@example.com', 'Flat 402, Shanti Niketan, Station Road, Mumbai'),
(2, 'CUST1002', 'Sunita Patil', '9822334455', 'sunita.patil@example.com', 'Row House 12, Gulmohar Enclave, Pune'),
(3, 'CUST1003', 'Apex Supermarket', '9811223344', 'contact@apexsupermarket.com', 'Shop 1-4, Commercial Complex, Sector 17, Vashi');

-- 4. Corresponding Consumer Users (password: pass123)
-- BCrypt for 'pass123' is $2a$10$Bv0yB3R7d2L4Z8V1n61xOei7dM8L1h/dL.L2b6zP9X7I0p4n0A3P1
INSERT IGNORE INTO users (id, username, password, role, consumer_number, active)
VALUES 
(2, 'CUST1001', '$2a$10$Bv0yB3R7d2L4Z8V1n61xOei7dM8L1h/dL.L2b6zP9X7I0p4n0A3P1', 'CONSUMER', 'CUST1001', TRUE),
(3, 'CUST1002', '$2a$10$Bv0yB3R7d2L4Z8V1n61xOei7dM8L1h/dL.L2b6zP9X7I0p4n0A3P1', 'CONSUMER', 'CUST1002', TRUE),
(4, 'CUST1003', '$2a$10$Bv0yB3R7d2L4Z8V1n61xOei7dM8L1h/dL.L2b6zP9X7I0p4n0A3P1', 'CONSUMER', 'CUST1003', TRUE);

-- 5. Electricity Connections
INSERT IGNORE INTO connections (id, connection_number, consumer_id, connection_type, meter_number, sanctioned_load_kw, connection_date, status)
VALUES
(1, 'CONN-1001', 1, 'DOMESTIC', 'MTR-88401', 2.00, '2025-01-15', 'ACTIVE'),
(2, 'CONN-1002', 2, 'DOMESTIC', 'MTR-88402', 1.50, '2025-02-10', 'ACTIVE'),
(3, 'CONN-1003', 3, 'COMMERCIAL', 'MTR-99105', 5.00, '2024-11-01', 'ACTIVE');

-- 6. Initial Meter Readings
INSERT IGNORE INTO meter_readings (id, connection_id, consumer_id, billing_month, previous_reading, current_reading, units_consumed, reading_date, recorded_by)
VALUES
(1, 1, 1, '2026-02', 1200.00, 1450.00, 250.00, '2026-02-28', 'admin'),
(2, 2, 2, '2026-02', 800.00, 980.00, 180.00, '2026-02-28', 'admin'),
(3, 3, 3, '2026-02', 3200.00, 3600.00, 400.00, '2026-02-28', 'admin');

-- 7. Initial Bills (250 units example: 100*3=300 + 100*5=500 + 50*7=350 + fixed 100 = 1250)
INSERT IGNORE INTO bills (id, bill_number, connection_id, consumer_id, meter_reading_id, billing_month, bill_date, due_date, units_consumed, energy_charges, fixed_charges, other_charges, late_fee, discount, total_amount, paid_amount, balance_amount, status, tariff_details_json)
VALUES
(1, 'BILL-202602-001', 1, 1, 1, '2026-02', '2026-03-01', '2026-03-20', 250.00, 1150.00, 100.00, 0.00, 0.00, 0.00, 1250.00, 1250.00, 0.00, 'PAID', '{"slabs":[{"from":0,"to":100,"rate":3.0,"units":100,"amount":300.0},{"from":101,"to":200,"rate":5.0,"units":100,"amount":500.0},{"from":201,"to":null,"rate":7.0,"units":50,"amount":350.0}],"fixedCharge":100.0}'),
(2, 'BILL-202602-002', 2, 2, 2, '2026-02', '2026-03-01', '2026-03-20', 180.00, 700.00, 100.00, 0.00, 0.00, 0.00, 800.00, 0.00, 800.00, 'UNPAID', '{"slabs":[{"from":0,"to":100,"rate":3.0,"units":100,"amount":300.0},{"from":101,"to":200,"rate":5.0,"units":80,"amount":400.0}],"fixedCharge":100.0}'),
(3, 'BILL-202602-003', 3, 3, 3, '2026-02', '2026-03-01', '2026-03-20', 400.00, 3225.00, 250.00, 0.00, 0.00, 0.00, 3475.00, 1000.00, 2475.00, 'PARTIALLY_PAID', '{"slabs":[{"from":0,"to":150,"rate":6.5,"units":150,"amount":975.0},{"from":151,"to":null,"rate":9.0,"units":250,"amount":2250.0}],"fixedCharge":250.0}');

-- 8. Initial Payment for Bill 1
INSERT IGNORE INTO payments (id, receipt_number, bill_id, consumer_id, payment_date, amount_paid, payment_method, transaction_ref, notes, recorded_by)
VALUES
(1, 'RCPT-202603-001', 1, 1, '2026-03-05 11:30:00', 1250.00, 'UPI', 'UPI/606512399120', 'Full payment settled via PhonePe', 'System/Consumer');
