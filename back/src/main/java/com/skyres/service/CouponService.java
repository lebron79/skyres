package com.skyres.service;

import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Service
public class CouponService {

    /** Official Skyres codes — distributed % (sum of single-code maxima; stacking uses sequential application). */
    private static final Map<String, Double> SKYRES_CODES = Map.of(
            "ILSKYRES1", 0.07,
            "FASKYRES3", 0.08,
            "AKSKYRES2", 0.09,
            "YNSKYRES4", 0.10
    );

    /** Legacy demo codes (kept for existing tests / data). */
    private static final Map<String, Double> LEGACY_CODES = Map.of(
            "SKYRES10", 0.10,
            "SKYRES20", 0.20,
            "WELCOME", 0.15,
            "SUMMER25", 0.25
    );

    /** Single-code discount rate (0..1). */
    public double getDiscount(String couponCode) {
        if (couponCode == null || couponCode.isBlank()) {
            return 0.0;
        }
        String key = couponCode.toUpperCase(Locale.ROOT).trim();
        if (SKYRES_CODES.containsKey(key)) {
            return SKYRES_CODES.get(key);
        }
        return LEGACY_CODES.getOrDefault(key, 0.0);
    }

    public boolean isValid(String couponCode) {
        return getDiscount(couponCode) > 0;
    }

    /**
     * Price multiplier after applying up to two distinct codes.
     * Second code is ignored if null/blank. If {@code allowSecondCoupon} is false and a second code is present, throws.
     */
    public double priceMultiplier(String firstCode, String secondCode, boolean allowSecondCoupon) {
        String c1 = normalize(firstCode);
        String c2 = normalize(secondCode);
        if (c1 == null) {
            if (c2 != null) {
                throw new IllegalArgumentException("Indiquez d'abord le premier code promo.");
            }
            return 1.0;
        }
        double m = 1.0 - discountOrZero(c1);
        if (c2 == null) {
            return m;
        }
        if (!allowSecondCoupon) {
            throw new IllegalArgumentException("Un seul code promo pour les comptes ayant déjà une réservation.");
        }
        if (c1 != null && c1.equals(c2)) {
            throw new IllegalArgumentException("Impossible d'appliquer le même code deux fois.");
        }
        m *= (1.0 - discountOrZero(c2));
        return m;
    }

    /** Total discount rate for display: 1 - multiplier (not additive % of list price). */
    public double effectiveDiscountRate(String firstCode, String secondCode, boolean allowSecondCoupon) {
        return 1.0 - priceMultiplier(firstCode, secondCode, allowSecondCoupon);
    }

    private static String normalize(String code) {
        if (code == null || code.isBlank()) {
            return null;
        }
        return code.toUpperCase(Locale.ROOT).trim();
    }

    private double discountOrZero(String normalizedKey) {
        if (normalizedKey == null) {
            return 0.0;
        }
        if (SKYRES_CODES.containsKey(normalizedKey)) {
            return Objects.requireNonNull(SKYRES_CODES.get(normalizedKey));
        }
        return LEGACY_CODES.getOrDefault(normalizedKey, 0.0);
    }
}
