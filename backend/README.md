# Online Electricity Billing System - Spring Boot Backend

A complete, production-grade Spring Boot + Spring Data JPA + Hibernate + Spring Security + MySQL backend designed for college mini-projects, demonstrations, and viva.

---

## 1. System Requirements
- **Java**: JDK 17 or higher
- **Maven**: 3.8+
- **MySQL Server**: 8.0+
- **Node.js**: 18+ (for the React Vite frontend)

---

## 2. MySQL Database Setup
Open MySQL Workbench or your terminal `mysql -u root -p` and execute:

```sql
CREATE DATABASE IF NOT EXISTS electricity_db;
USE electricity_db;
```

Check `backend/src/main/resources/application.properties` and update your username and password:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/electricity_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=root123
```

---

## 3. Running the Backend
From the project root:

```bash
cd backend
mvn clean spring-boot:run
```

The server will start at: `http://localhost:8080/`
API endpoints are mapped at: `http://localhost:8080/api/*`

---

## 4. Default Accounts & Seed Data
On initial startup, `DataInitializer` automatically configures the database with:

### A. Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `ADMIN`

### B. Sample Consumer Accounts
- **Consumer 1**: Username: `CUST1001`, Password: `pass123`, Name: Rajesh Sharma (Domestic, 2kW, Active)
- **Consumer 2**: Username: `CUST1002`, Password: `pass123`, Name: Sunita Patil (Domestic, 1.5kW, Active)
- **Consumer 3**: Username: `CUST1003`, Password: `pass123`, Name: Apex Supermarket (Commercial, 5kW, Active)

---

## 5. Tariff Calculation Logic
Progressive slab calculation formula:

$$\text{Energy Charge} = \sum (\text{Units in Slab} \times \text{Slab Rate})$$
$$\text{Total Bill} = \text{Energy Charge} + \text{Fixed Charge} + \text{Other Charges} + \text{Late Fee} - \text{Discount}$$

### Domestic Tariff Rates:
- **0 – 100 Units**: ₹3.00 / unit
- **101 – 200 Units**: ₹5.00 / unit
- **Above 200 Units**: ₹7.00 / unit
- **Fixed Charge**: ₹100.00 / billing cycle

### Example (250 Units):
1. First 100 units $\times$ ₹3.00 = ₹300.00
2. Next 100 units $\times$ ₹5.00 = ₹500.00
3. Remaining 50 units $\times$ ₹7.00 = ₹350.00
4. Fixed charge = ₹100.00
5. **Total Payable** = **₹1,250.00**

---

## 6. REST API Endpoints Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/login` | Authenticate user & receive JWT token | Public |
| POST | `/api/auth/register-admin` | Create new ADMIN account safely | Public |
| GET | `/api/dashboard/stats` | Key performance indicators & stats | ADMIN |
| GET | `/api/consumers` | List & search consumers | ADMIN |
| POST | `/api/consumers` | Register new consumer | ADMIN |
| GET | `/api/consumers/me` | Logged-in consumer profile | CONSUMER |
| GET | `/api/connections` | List electricity connections | ADMIN / CONSUMER |
| POST | `/api/connections` | Create electricity connection | ADMIN |
| GET | `/api/meter-readings/previous-reading/{connId}` | Fetch last recorded reading | ADMIN |
| POST | `/api/meter-readings` | Record new meter reading | ADMIN |
| GET | `/api/tariffs` | List all tariff slabs | All |
| PUT | `/api/tariffs/{id}` | Update tariff slab rates | ADMIN |
| POST | `/api/bills/generate` | Generate bill with progressive slabs | ADMIN |
| GET | `/api/bills` | Search and filter bills | ADMIN |
| GET | `/api/bills/me` | View consumer's bills | CONSUMER |
| GET | `/api/bills/{id}` | Detailed bill invoice | ADMIN / CONSUMER |
| POST | `/api/payments` | Record full or partial payment | ADMIN / CONSUMER |
| GET | `/api/payments/receipt/{receiptNo}` | Detailed payment receipt | ADMIN / CONSUMER |
| GET | `/api/reports/monthly` | Monthly consumption and billing report | ADMIN |
