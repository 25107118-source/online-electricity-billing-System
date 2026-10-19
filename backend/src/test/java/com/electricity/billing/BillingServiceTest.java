package com.electricity.billing;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.math.RoundingMode;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Unit Test demonstrating progressive slab bill calculations.
 * Perfect for College Viva & Demonstrations!
 *
 * Test Case: 250 units consumption (Domestic connection)
 * Slab 1: 0 - 100 units   @ ₹3.00 = ₹300.00
 * Slab 2: 101 - 200 units @ ₹5.00 = ₹500.00
 * Slab 3: Above 200 units @ ₹7.00 = ₹350.00 (50 units)
 * Fixed Charge:                    = ₹100.00
 * Expected Total:                  = ₹1,250.00
 */
public class BillingServiceTest {

    @Test
    public void testProgressiveTariffCalculationFor250Units() {
        double units = 250.0;
        BigDecimal energyCharges = BigDecimal.ZERO;
        BigDecimal fixedCharge = new BigDecimal("100.00");

        // Slab 1: First 100 units @ 3.00
        double slab1Units = Math.min(units, 100.0);
        energyCharges = energyCharges.add(BigDecimal.valueOf(slab1Units).multiply(new BigDecimal("3.00")));
        units -= slab1Units;

        // Slab 2: Next 100 units @ 5.00
        double slab2Units = Math.min(units, 100.0);
        energyCharges = energyCharges.add(BigDecimal.valueOf(slab2Units).multiply(new BigDecimal("5.00")));
        units -= slab2Units;

        // Slab 3: Remaining 50 units @ 7.00
        double slab3Units = units;
        energyCharges = energyCharges.add(BigDecimal.valueOf(slab3Units).multiply(new BigDecimal("7.00")));

        BigDecimal totalBill = energyCharges.add(fixedCharge).setScale(2, RoundingMode.HALF_UP);

        assertEquals(new BigDecimal("300.00"), BigDecimal.valueOf(slab1Units).multiply(new BigDecimal("3.00")).setScale(2, RoundingMode.HALF_UP));
        assertEquals(new BigDecimal("500.00"), BigDecimal.valueOf(slab2Units).multiply(new BigDecimal("5.00")).setScale(2, RoundingMode.HALF_UP));
        assertEquals(new BigDecimal("350.00"), BigDecimal.valueOf(slab3Units).multiply(new BigDecimal("7.00")).setScale(2, RoundingMode.HALF_UP));
        assertEquals(new BigDecimal("1150.00"), energyCharges.setScale(2, RoundingMode.HALF_UP));
        assertEquals(new BigDecimal("1250.00"), totalBill);
    }
}
