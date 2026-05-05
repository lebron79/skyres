package com.skyres.service;

import org.springframework.stereotype.Service;

@Service
public class CouponService {

    // coupons simples hardcodés — on peut les mettre en DB plus tard
    public double getDiscount(String couponCode) {
        if (couponCode == null || couponCode.isBlank()) return 0.0;
        return switch (couponCode.toUpperCase().trim()) {
            case "SKYRES10" -> 0.10; // 10%
            case "SKYRES20" -> 0.20; // 20%
            case "WELCOME"  -> 0.15; // 15%
            case "SUMMER25" -> 0.25; // 25%
            default -> 0.0;
        };
    }

    public boolean isValid(String couponCode) {
        return getDiscount(couponCode) > 0;
    }
}