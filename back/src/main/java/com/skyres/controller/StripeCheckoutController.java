package com.skyres.controller;

import com.skyres.dto.request.CheckoutSessionRequest;
import com.skyres.dto.response.CheckoutSessionResponse;
import com.skyres.service.StripeCheckoutService;
import com.stripe.exception.StripeException;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments")
public class StripeCheckoutController {

    private final StripeCheckoutService stripeCheckoutService;

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutSessionResponse> createCheckout(@Valid @RequestBody CheckoutSessionRequest request)
            throws StripeException {
        return ResponseEntity.ok(stripeCheckoutService.createCheckoutSession(request));
    }
}
