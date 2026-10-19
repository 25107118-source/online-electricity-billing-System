package com.electricity.billing.controller;

import com.electricity.billing.dto.BillDto;
import com.electricity.billing.dto.BillGenerationRequest;
import com.electricity.billing.entity.BillStatus;
import com.electricity.billing.service.BillingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillingService billingService;

    public BillController(BillingService billingService) {
        this.billingService = billingService;
    }

    @GetMapping
    public ResponseEntity<List<BillDto>> getBills(
            @RequestParam(required = false) String consumerNumber,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) BillStatus status,
            Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            // Force consumer to only see their own bills
            return ResponseEntity.ok(billingService.getBillsByConsumerNumber(auth.getName()));
        }
        return ResponseEntity.ok(billingService.getAllBills(consumerNumber, month, status));
    }

    @GetMapping("/me")
    public ResponseEntity<List<BillDto>> getMyBills(Authentication auth) {
        return ResponseEntity.ok(billingService.getBillsByConsumerNumber(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillDto> getBillById(@PathVariable Long id, Authentication auth) {
        BillDto bill = billingService.getBillById(id);
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !bill.getConsumerNumber().equals(auth.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(bill);
    }

    @GetMapping("/number/{billNumber}")
    public ResponseEntity<BillDto> getBillByNumber(@PathVariable String billNumber, Authentication auth) {
        BillDto bill = billingService.getBillByNumber(billNumber);
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !bill.getConsumerNumber().equals(auth.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(bill);
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BillDto> generateBill(@Valid @RequestBody BillGenerationRequest request) {
        return new ResponseEntity<>(billingService.generateBill(request), HttpStatus.CREATED);
    }
}
