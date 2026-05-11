package com.skyres.controller;

import com.skyres.dto.request.BudgetSimulationRequest;
import com.skyres.dto.response.BudgetSimulationResponse;
import com.skyres.model.entity.Hotel;
import com.skyres.repository.HotelRepository;
import com.skyres.service.CouponService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.temporal.ChronoUnit;

@RestController
@RequestMapping("/api/budget")
@RequiredArgsConstructor
@Tag(name = "Budget Simulation")
public class BudgetController {

    private final HotelRepository hotelRepository;
    private final CouponService couponService;

    @PostMapping("/simulate")
    public ResponseEntity<BudgetSimulationResponse> simulate(
            @Valid @RequestBody BudgetSimulationRequest request) {

        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        if (nights <= 0) throw new IllegalArgumentException("Check-out must be after check-in");

        double pricePerNight = hotel.getPricePerNight();
        double subtotal = nights * pricePerNight * request.getNumberOfPersons();
        double discountRate = couponService.getDiscount(request.getCouponCode());
        double discount = subtotal * discountRate;
        double total = subtotal - discount;

        return ResponseEntity.ok(BudgetSimulationResponse.builder()
                .hotelName(hotel.getName())
                .numberOfNights((int) nights)
                .numberOfPersons(request.getNumberOfPersons())
                .pricePerNight(pricePerNight)
                .subtotal(subtotal)
                .discount(discount)
                .total(total)
                .couponApplied(discountRate > 0 ? request.getCouponCode() : "None")
                .build());
    }
}