# Online Electricity Billing System — Full Stack Java Mini Project

A comprehensive, production-grade Online Electricity Billing System created for engineering students (BTech/BE/BCA/MCA) for laboratory practicals, college project submissions, and viva examinations.

The application simulates the real-world operational workflows of a State Electricity Distribution Board: consumer onboarding, physical meter connectivity, monthly meter reading logs, progressive tariff calculation engine with slab audit, bill generation, simulated payment settlement (UPI, Card, Cash), printable A4 invoices, and revenue reports.

---

## 1. Technology Stack Architecture

### Frontend (User Interface & Portal)
- **Framework**: React.js 19 with Vite
- **Styling**: Pure Plain CSS (custom municipal utility theme, zero Bootstrap, zero Tailwind CSS)
- **Routing**: React Router v7
- **HTTP Client**: Axios with Bearer token authorization interceptors
- **Icons**: Lucide Icons
- **Print Engine**: Dedicated A4 print stylesheet (`@media print`) for bills and payment receipts

### Backend (RESTful Web Service)
- **Language**: Java 17+
- **Framework**: Spring Boot 3.2.4
- **ORM / Persistence**: Spring Data JPA & Hibernate
- **Security**: Spring Security 6 with BCrypt password hashing & JWT (JSON Web Tokens)
- **Build & Dependency Management**: Apache Maven 3.8+
- **Validation**: Jakarta Bean Validation (`@Valid`, `@NotNull`, `@NotBlank`)
- **Arithmetic**: `BigDecimal` with half-up rounding for monetary financial figures

### Database
- **Engine**: MySQL 8.0+
- **Schema**: 7 Relational JPA Entities (`users`, `consumers`, `connections`, `tariff_slabs`, `meter_readings`, `bills`, `payments`)

---

## 2. Directory Structure

```text
├── backend/                               # Spring Boot Maven Project
│   ├── pom.xml                            # Maven dependencies & build plugins
│   ├── README.md                          # Backend instructions & API documentation
│   └── src/
│       ├── main/
│       │   ├── java/com/electricity/billing/
│       │   │   ├── ElectricityBillingApplication.java
│       │   │   ├── config/                # DataInitializer, CORS setup
│       │   │   ├── controller/            # REST Controllers (@RestController)
│       │   │   ├── dto/                   # Request/Response Data Transfer Objects
│       │   │   ├── entity/                # JPA Relational Entities & Enums
│       │   │   ├── exception/             # GlobalExceptionHandler & custom exceptions
│       │   │   ├── repository/            # Spring Data JPA Repositories
│       │   │   ├── security/              # SecurityConfig, JwtUtils, JwtAuthFilter
│       │   │   └── service/               # Business logic & progressive billing engine
│       │   └── resources/
│       │       ├── application.properties # MySQL & JWT configuration
│       │       ├── schema.sql             # DDL database creation script
│       │       └── data.sql               # Seed data for default admin, consumers, & slabs
│       └── test/java/com/electricity/billing/
│           └── BillingServiceTest.java    # Unit test demonstrating progressive slab calculation
│
├── src/                                   # React Frontend
│   ├── components/                        # Navbar, Sidebar, Alert, Modal
│   ├── context/                           # AuthContext (role-based state & token manager)
│   ├── pages/                             # 11 Dedicated application pages
│   │   ├── Login.tsx                      # Login with demo shortcuts & admin creation
│   │   ├── AdminDashboard.tsx             # Executive metrics & recent bills
│   │   ├── ConsumerDashboard.tsx          # Consumer portal with balance & quick pay
│   │   ├── ConsumerManagement.tsx         # Search, register, edit consumers
│   │   ├── ConnectionManagement.tsx       # Power supply & meter allocation
│   │   ├── MeterReadings.tsx              # Meter logging with auto-delta calculation
│   │   ├── TariffManagement.tsx           # Tariff slabs & live viva calculation simulator
│   │   ├── GenerateBill.tsx               # Progressive slab bill generation
│   │   ├── BillHistory.tsx                # Filterable bill ledger
│   │   ├── BillInvoice.tsx                # Official A4 printable bill
│   │   ├── Payments.tsx                   # Cash/Card/UPI payment counter
│   │   ├── PaymentReceipt.tsx             # Official payment receipt
│   │   └── Reports.tsx                    # Tabular revenue & consumption reports
│   ├── services/
│   │   ├── api.ts                         # Axios client with interceptors
│   │   └── billingService.ts              # Full API client facade + in-browser fallback
│   ├── types/
│   │   └── index.ts                       # TypeScript interfaces
│   ├── index.css                          # Plain CSS municipal stylesheet
│   └── App.tsx                            # Protected router configuration
└── package.json                           # React dependencies & scripts
```

---

## 3. How to Run on Localhost

You have multiple convenient ways to run the project on your machine:

### Option A: 1-Click Launchers (Easiest)
- **On Windows**: Double-click `start-localhost.bat` (or run it in Command Prompt).
- **On macOS / Linux**: Run `./start-localhost.sh` in terminal.

---

### Option B: Terminal Execution

#### 1. Start the Java Spring Boot Backend (Port 8080)
Choose between MySQL or the instant H2 in-memory profile:

- **Instant H2 Profile (Zero MySQL Setup Needed)**:
  ```bash
  cd backend
  mvn spring-boot:run -Dspring-boot.run.profiles=h2
  ```
  *(H2 web database console is accessible at `http://localhost:8080/h2-console`)*

- **MySQL Database Profile**:
  1. Open MySQL and create the database:
     ```sql
     CREATE DATABASE IF NOT EXISTS electricity_db;
     ```
  2. Verify credentials in `backend/src/main/resources/application.properties` (username: `root`, password: `root123` or your local password).
  3. Run:
     ```bash
     cd backend
     mvn clean spring-boot:run
     ```

The Spring Boot backend will start on **http://localhost:8080**.
- Initial seed data (admin, consumers, connections, readings, tariffs) will be populated automatically by `DataInitializer.java`.
- Health status check: `http://localhost:8080/api/auth/status`

#### 2. Start the React Frontend (Port 3000)
In another terminal at the project root:

```bash
npm install
npm run dev
```

The frontend will run on **http://localhost:3000**.
Vite is pre-configured with a reverse proxy for `/api`, automatically routing all requests directly to `http://localhost:8080/api` without any CORS configuration troubles!

---

### Backend Connection Indicator & Assistant
In the top navigation bar, click the **Backend Status Indicator** at any time to open the **Localhost Connection Assistant**:
- Test connectivity to Spring Boot in real time.
- Switch between **Auto Detect**, **Force Spring Boot**, or **In-Browser Demo**.
- Copy terminal startup commands directly to your clipboard.

---

## 4. Default Login Accounts & Demo Shortcuts

The login page features 1-click credential pre-fill buttons for quick college demonstrations:

| Role | Username / Consumer # | Password | Description |
|---|---|---|---|
| **ADMIN** | `admin` | `admin123` | Department Administrator (full access) |
| **CONSUMER** | `CUST1001` | `pass123` | Rajesh Sharma (Domestic, 2kW load) |
| **CONSUMER** | `CUST1002` | `pass123` | Sunita Patil (Domestic, 1.5kW load) |
| **CONSUMER** | `CUST1003` | `pass123` | Apex Supermarket (Commercial, 5kW load) |

### Creating Additional Admin Accounts
A safe modal is available on the Login screen ("Create / Register First Admin Account"), which sends a `POST /api/auth/register-admin` request to securely create and hash the admin credentials with BCrypt.

---

## 5. Tariff Calculation Logic & Viva Question Guide

### Progressive Slab Formula:
$$\text{Energy Charge} = \sum (\text{Units in Slab} \times \text{Slab Rate})$$
$$\text{Total Bill} = \text{Energy Charge} + \text{Fixed Charge} + \text{Other Charges} + \text{Late Fee} - \text{Discount}$$

### Standard Academic Rates:
- **0 to 100 units**: ₹3.00 per unit
- **101 to 200 units**: ₹5.00 per unit
- **Above 200 units**: ₹7.00 per unit
- **Fixed Demand Charge**: ₹100.00 per billing period

### Numerical Example (250 units consumption):
1. **First 100 units**: $100 \times 3.00 = ₹300.00$
2. **Next 100 units**: $100 \times 5.00 = ₹500.00$
3. **Remaining 50 units**: $50 \times 7.00 = ₹350.00$
4. **Energy Charge Subtotal**: $300 + 500 + 350 = ₹1,150.00$
5. **Fixed Surcharge**: ₹100.00
6. **Total Payable Amount**: **₹1,250.00**

*Note: You can verify this in real-time under the "Tariff Slabs" page in the interactive calculation engine, or run the JUnit test in `backend/src/test/java/com/electricity/billing/BillingServiceTest.java`.*

---

## 6. Viva Exam Frequently Asked Questions (FAQ)

1. **Why use `BigDecimal` instead of `double` or `float` for monetary amounts?**
   - *Answer*: `float` and `double` use binary floating-point representation (IEEE 754), which causes round-off inaccuracies (e.g. `0.1 + 0.2 != 0.3`). `BigDecimal` provides exact arbitrary-precision arithmetic necessary for financial transactions and utility billing.

2. **How does the system ensure historical bills are not altered if tariff rates change?**
   - *Answer*: During bill generation, the exact slab rates, units per slab, and fixed charges applied are serialized into `tariff_details_json` and saved in the `bills` table inside a database transaction (`@Transactional`). Subsequent modifications to the `tariff_slabs` table do not alter historical records.

3. **How is role-based security enforced?**
   - *Answer*: Spring Security validates the incoming JWT in `JwtAuthFilter`. In `SecurityConfig`, endpoints like `/api/bills/generate` and `/api/tariffs/**` require `hasRole('ADMIN')`. In `ConsumerController` and `BillController`, checks ensure consumers can only view records matching their authenticated consumer number.

4. **How are duplicate bills and readings prevented?**
   - *Answer*: The database schema enforces unique constraints: `UNIQUE(connection_id, billing_month)` on both `meter_readings` and `bills`. The service layer checks `existsByConnectionIdAndBillingMonth()` prior to persisting.
