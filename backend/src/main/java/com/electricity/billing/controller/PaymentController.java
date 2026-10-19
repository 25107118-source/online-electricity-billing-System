package com.electricity.billing.controller;

import com.electricity.billing.dto.PaymentDto;
import com.electricity.billing.dto.PaymentRequest;
import com.electricity.billing.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public ResponseEntity<List<PaymentDto>> getPayments(Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return ResponseEntity.ok(paymentService.getAllPayments());
        } else {
            return ResponseEntity.ok(paymentService.getPaymentsByConsumerNumber(auth.getName()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<List<PaymentDto>> getMyPayments(Authentication auth) {
        return ResponseEntity.ok(paymentService.getPaymentsByConsumerNumber(auth.getName()));
    }

    @GetMapping("/receipt/{receiptNumber}")
    public ResponseEntity<PaymentDto> getPaymentByReceipt(@PathVariable String receiptNumber, Authentication auth) {
        PaymentDto payment = paymentService.getPaymentByReceiptNumber(receiptNumber);
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !payment.getConsumerNumber().equals(auth.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/bill/{billId}")
    public ResponseEntity<List<PaymentDto>> getPaymentsByBill(@PathVariable Long billId) {
        return ResponseEntity.ok(paymentService.getPaymentsByBillId(billId));
    }

    @PostMapping
    public ResponseEntity<PaymentDto> recordPayment(@Valid @RequestBody PaymentRequest request, Authentication auth) {
        return new ResponseEntity<>(paymentService.recordPayment(request, auth.getName()), HttpStatus.CREATED);
    }
}
