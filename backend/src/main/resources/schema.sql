-- ==============================================================================
-- MySQL Schema for Online Electricity Billing System
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS electricity_db;
USE electricity_db;

-- 1. Users Table (Authentication & Role-Based Access)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    consumer_number VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Consumers Table
CREATE TABLE IF NOT EXISTS consumers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    consumer_number VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Connections Table
CREATE TABLE IF NOT EXISTS connections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    connection_number VARCHAR(50) NOT NULL UNIQUE,
    consumer_id BIGINT NOT NULL,
    connection_type VARCHAR(20) NOT NULL, -- DOMESTIC, COMMERCIAL
    meter_number VARCHAR(50) NOT NULL UNIQUE,
    sanctioned_load_kw DECIMAL(5,2) DEFAULT 1.00,
    connection_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, DISCONNECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_connection_consumer FOREIGN KEY (consumer_id) REFERENCES consumers(id) ON DELETE CASCADE
);

-- 4. Tariff Slabs Table
CREATE TABLE IF NOT EXISTS tariff_slabs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    connection_type VARCHAR(20) NOT NULL, -- DOMESTIC, COMMERCIAL
    from_unit INT NOT NULL,
    to_unit INT, -- NULL means infinity (above 200)
    rate_per_unit DECIMAL(10,2) NOT NULL,
    fixed_charge DECIMAL(10,2) NOT NULL,
    effective_date DATE NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

-- 5. Meter Readings Table
CREATE TABLE IF NOT EXISTS meter_readings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    connection_id BIGINT NOT NULL,
    consumer_id BIGINT NOT NULL,
    billing_month VARCHAR(7) NOT NULL, -- e.g., '2026-03'
    previous_reading DECIMAL(10,2) NOT NULL,
    current_reading DECIMAL(10,2) NOT NULL,
    units_consumed DECIMAL(10,2) NOT NULL,
    reading_date DATE NOT NULL,
    recorded_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reading_connection FOREIGN KEY (connection_id) REFERENCES connections(id),
    CONSTRAINT fk_reading_consumer FOREIGN KEY (consumer_id) REFERENCES consumers(id),
    CONSTRAINT uq_connection_month UNIQUE (connection_id, billing_month)
);

-- 6. Bills Table
CREATE TABLE IF NOT EXISTS bills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bill_number VARCHAR(50) NOT NULL UNIQUE,
    connection_id BIGINT NOT NULL,
    consumer_id BIGINT NOT NULL,
    meter_reading_id BIGINT NOT NULL,
    billing_month VARCHAR(7) NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE NOT NULL,
    units_consumed DECIMAL(10,2) NOT NULL,
    energy_charges DECIMAL(10,2) NOT NULL,
    fixed_charges DECIMAL(10,2) NOT NULL,
    other_charges DECIMAL(10,2) DEFAULT 0.00,
    late_fee DECIMAL(10,2) DEFAULT 0.00,
    discount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    balance_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'UNPAID', -- UNPAID, PARTIALLY_PAID, PAID
    tariff_details_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bill_connection FOREIGN KEY (connection_id) REFERENCES connections(id),
    CONSTRAINT fk_bill_consumer FOREIGN KEY (consumer_id) REFERENCES consumers(id),
    CONSTRAINT fk_bill_reading FOREIGN KEY (meter_reading_id) REFERENCES meter_readings(id),
    CONSTRAINT uq_bill_connection_month UNIQUE (connection_id, billing_month)
);

-- 7. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    bill_id BIGINT NOT NULL,
    consumer_id BIGINT NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL, -- CASH, CARD, UPI
    transaction_ref VARCHAR(100),
    notes VARCHAR(255),
    recorded_by VARCHAR(50) NOT NULL,
    CONSTRAINT fk_payment_bill FOREIGN KEY (bill_id) REFERENCES bills(id),
    CONSTRAINT fk_payment_consumer FOREIGN KEY (consumer_id) REFERENCES consumers(id)
);
