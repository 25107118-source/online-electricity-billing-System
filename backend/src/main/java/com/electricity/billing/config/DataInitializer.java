package com.electricity.billing.config;

import com.electricity.billing.entity.*;
import com.electricity.billing.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ConsumerRepository consumerRepository;
    private final ConnectionRepository connectionRepository;
    private final TariffSlabRepository tariffSlabRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final BillRepository billRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           ConsumerRepository consumerRepository,
                           ConnectionRepository connectionRepository,
                           TariffSlabRepository tariffSlabRepository,
                           MeterReadingRepository meterReadingRepository,
                           BillRepository billRepository,
                           PaymentRepository paymentRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.consumerRepository = consumerRepository;
        this.connectionRepository = connectionRepository;
        this.tariffSlabRepository = tariffSlabRepository;
        this.meterReadingRepository = meterReadingRepository;
        this.billRepository = billRepository;
        this.paymentRepository = paymentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Initialize Tariff Slabs if not present
        if (tariffSlabRepository.count() == 0) {
            tariffSlabRepository.save(new TariffSlab(ConnectionType.DOMESTIC, 0, 100, new BigDecimal("3.00"), new BigDecimal("100.00"), LocalDate.of(2026, 1, 1), true));
            tariffSlabRepository.save(new TariffSlab(ConnectionType.DOMESTIC, 101, 200, new BigDecimal("5.00"), new BigDecimal("100.00"), LocalDate.of(2026, 1, 1), true));
            tariffSlabRepository.save(new TariffSlab(ConnectionType.DOMESTIC, 201, null, new BigDecimal("7.00"), new BigDecimal("100.00"), LocalDate.of(2026, 1, 1), true));

            tariffSlabRepository.save(new TariffSlab(ConnectionType.COMMERCIAL, 0, 150, new BigDecimal("6.50"), new BigDecimal("250.00"), LocalDate.of(2026, 1, 1), true));
            tariffSlabRepository.save(new TariffSlab(ConnectionType.COMMERCIAL, 151, null, new BigDecimal("9.00"), new BigDecimal("250.00"), LocalDate.of(2026, 1, 1), true));
        }

        // 2. Initialize Admin account if not present
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User("admin", passwordEncoder.encode("admin123"), Role.ADMIN, null);
            userRepository.save(admin);
        }

        // 3. Initialize Sample Consumers and Connections if empty
        if (consumerRepository.count() == 0) {
            Consumer c1 = new Consumer("CUST1001", "Rajesh Sharma", "9876543210", "rajesh.sharma@example.com", "Flat 402, Shanti Niketan, Station Road, Mumbai");
            Consumer c2 = new Consumer("CUST1002", "Sunita Patil", "9822334455", "sunita.patil@example.com", "Row House 12, Gulmohar Enclave, Pune");
            Consumer c3 = new Consumer("CUST1003", "Apex Supermarket", "9811223344", "contact@apexsupermarket.com", "Shop 1-4, Commercial Complex, Sector 17, Vashi");

            c1 = consumerRepository.save(c1);
            c2 = consumerRepository.save(c2);
            c3 = consumerRepository.save(c3);

            // Create Consumer Logins (password: pass123)
            userRepository.save(new User("CUST1001", passwordEncoder.encode("pass123"), Role.CONSUMER, "CUST1001"));
            userRepository.save(new User("CUST1002", passwordEncoder.encode("pass123"), Role.CONSUMER, "CUST1002"));
            userRepository.save(new User("CUST1003", passwordEncoder.encode("pass123"), Role.CONSUMER, "CUST1003"));

            // Create Connections
            Connection conn1 = new Connection("CONN-1001", c1, ConnectionType.DOMESTIC, "MTR-88401", new BigDecimal("2.00"), LocalDate.of(2025, 1, 15), ConnectionStatus.ACTIVE);
            Connection conn2 = new Connection("CONN-1002", c2, ConnectionType.DOMESTIC, "MTR-88402", new BigDecimal("1.50"), LocalDate.of(2025, 2, 10), ConnectionStatus.ACTIVE);
            Connection conn3 = new Connection("CONN-1003", c3, ConnectionType.COMMERCIAL, "MTR-99105", new BigDecimal("5.00"), LocalDate.of(2024, 11, 1), ConnectionStatus.ACTIVE);

            conn1 = connectionRepository.save(conn1);
            conn2 = connectionRepository.save(conn2);
            conn3 = connectionRepository.save(conn3);

            // Create Meter Readings
            MeterReading r1 = new MeterReading(conn1, c1, "2026-02", new BigDecimal("1200.00"), new BigDecimal("1450.00"), new BigDecimal("250.00"), LocalDate.of(2026, 2, 28), "admin");
            MeterReading r2 = new MeterReading(conn2, c2, "2026-02", new BigDecimal("800.00"), new BigDecimal("980.00"), new BigDecimal("180.00"), LocalDate.of(2026, 2, 28), "admin");
            MeterReading r3 = new MeterReading(conn3, c3, "2026-02", new BigDecimal("3200.00"), new BigDecimal("3600.00"), new BigDecimal("400.00"), LocalDate.of(2026, 2, 28), "admin");

            r1 = meterReadingRepository.save(r1);
            r2 = meterReadingRepository.save(r2);
            r3 = meterReadingRepository.save(r3);

            // Create Bills
            // Bill 1: 250 units = 100*3(300) + 100*5(500) + 50*7(350) + 100 fixed = 1250 (PAID)
            Bill b1 = new Bill("BILL-202602-001", conn1, c1, r1, "2026-02", LocalDate.of(2026, 3, 1), LocalDate.of(2026, 3, 20),
                    new BigDecimal("250.00"), new BigDecimal("1150.00"), new BigDecimal("100.00"),
                    BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                    new BigDecimal("1250.00"), BigDecimal.ZERO, BillStatus.PAID,
                    "{\"slabs\":[{\"from\":0,\"to\":100,\"rate\":3.0,\"units\":100,\"amount\":300.0},{\"from\":101,\"to\":200,\"rate\":5.0,\"units\":100,\"amount\":500.0},{\"from\":201,\"to\":null,\"rate\":7.0,\"units\":50,\"amount\":350.0}],\"fixedCharge\":100.0}");
            b1.setPaidAmount(new BigDecimal("1250.00"));
            b1 = billRepository.save(b1);

            // Record Payment for Bill 1
            paymentRepository.save(new Payment("RCPT-202603-001", b1, c1, new BigDecimal("1250.00"),
                    PaymentMethod.UPI, "UPI/606512399120", "Full payment settled via PhonePe", "admin"));

            // Bill 2: 180 units = 100*3(300) + 80*5(400) + 100 fixed = 800 (UNPAID)
            Bill b2 = new Bill("BILL-202602-002", conn2, c2, r2, "2026-02", LocalDate.of(2026, 3, 1), LocalDate.of(2026, 3, 20),
                    new BigDecimal("180.00"), new BigDecimal("700.00"), new BigDecimal("100.00"),
                    BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                    new BigDecimal("800.00"), new BigDecimal("800.00"), BillStatus.UNPAID,
                    "{\"slabs\":[{\"from\":0,\"to\":100,\"rate\":3.0,\"units\":100,\"amount\":300.0},{\"from\":101,\"to\":200,\"rate\":5.0,\"units\":80,\"amount\":400.0}],\"fixedCharge\":100.0}");
            billRepository.save(b2);

            // Bill 3: 400 commercial units = 150*6.50(975) + 250*9(2250) + 250 fixed = 3475 (PARTIALLY_PAID 1000)
            Bill b3 = new Bill("BILL-202602-003", conn3, c3, r3, "2026-02", LocalDate.of(2026, 3, 1), LocalDate.of(2026, 3, 20),
                    new BigDecimal("400.00"), new BigDecimal("3225.00"), new BigDecimal("250.00"),
                    BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                    new BigDecimal("3475.00"), new BigDecimal("2475.00"), BillStatus.PARTIALLY_PAID,
                    "{\"slabs\":[{\"from\":0,\"to\":150,\"rate\":6.5,\"units\":150,\"amount\":975.0},{\"from\":151,\"to\":null,\"rate\":9.0,\"units\":250,\"amount\":2250.0}],\"fixedCharge\":250.0}");
            b3.setPaidAmount(new BigDecimal("1000.00"));
            b3 = billRepository.save(b3);

            paymentRepository.save(new Payment("RCPT-202603-002", b3, c3, new BigDecimal("1000.00"),
                    PaymentMethod.CARD, "TXN-CRD-778102", "Advance partial payment via debit card", "admin"));
        }
    }
}
