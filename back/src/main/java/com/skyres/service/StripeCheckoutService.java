package com.skyres.service;

import com.skyres.dto.request.CheckoutSessionRequest;
import com.skyres.dto.response.CheckoutSessionResponse;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class StripeCheckoutService {

    @Value("${stripe.secret.key:}")
    private String stripeSecretKey;

    @Value("${skyres.app.public-url:http://localhost:5173}")
    private String publicAppUrl;

    @PostConstruct
    void initStripe() {
        if (stripeSecretKey != null && !stripeSecretKey.isBlank()) {
            Stripe.apiKey = stripeSecretKey.trim();
        }
    }

    public CheckoutSessionResponse createCheckoutSession(CheckoutSessionRequest req) throws StripeException {
        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            throw new IllegalStateException("Stripe is not configured. Set STRIPE_SECRET_KEY or add back/.stripe.properties with stripe.secret.key.");
        }

        String base = publicAppUrl.trim().replaceAll("/+$", "");
        String successUrl = base + "/payment/success?session_id={CHECKOUT_SESSION_ID}";
        String cancelUrl = base + "/payment/cancel";

        long unitAmountCents = req.getAmountEur()
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();

        if (unitAmountCents < 50) {
            throw new IllegalArgumentException("Amount must be at least €0.50.");
        }

        String productName = truncate(req.getName().trim(), 120);
        String type = req.getType().toLowerCase();
        String ref = req.getRefId() != null ? req.getRefId().trim() : "";

        SessionCreateParams.Builder b = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .putMetadata("skyres_type", type)
                .putMetadata("skyres_ref_id", ref)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("eur")
                                                .setUnitAmount(unitAmountCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(productName)
                                                                .setDescription(switch (type) {
                                                                    case "guide" -> "Guide session (hourly rate — first unit)";
                                                                    case "reservation" -> "Hotel reservation (SkyRes)";
                                                                    default -> "Activity booking";
                                                                })
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                );

        Session session = Session.create(b.build());
        if (session.getUrl() == null) {
            throw new IllegalStateException("Stripe did not return a checkout URL.");
        }
        return new CheckoutSessionResponse(session.getUrl());
    }

    private static String truncate(String s, int max) {
        if (s.length() <= max) return s;
        return s.substring(0, max - 1) + "…";
    }
}
