package com.skyres.controller;

import com.skyres.dto.request.BudgetSimulationRequest;
import com.skyres.dto.response.BudgetSimulationResponse;
import com.skyres.model.entity.Hotel;
import com.skyres.repository.HotelRepository;
import com.skyres.repository.ReservationRepository;
import com.skyres.service.CouponService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
    private final ReservationRepository reservationRepository;

    @Value("${skyres.tnd-per-eur:3.42}")
    private double tndPerEur;

    @PostMapping("/simulate")
    public ResponseEntity<BudgetSimulationResponse> simulate(
            @Valid @RequestBody BudgetSimulationRequest request) {

        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        if (nights <= 0) throw new IllegalArgumentException("Check-out must be after check-in");

        double pricePerNightTnd = hotel.getPricePerNight();
        double hotelStaySubtotalEur = nights * (pricePerNightTnd / tndPerEur) * request.getNumberOfPersons();
        double destinationFeeEur = destinationPackageEur(hotel);
        double combinedSubtotal = hotelStaySubtotalEur + destinationFeeEur;

        boolean allowSecond = request.getUserId() != null
                && reservationRepository.countByUser_Id(request.getUserId()) == 0;
        if (request.getSecondCouponCode() != null && !request.getSecondCouponCode().isBlank() && !allowSecond) {
            throw new IllegalArgumentException("Deuxième code réservé aux comptes sans réservation passée (indiquez userId pour la simulation).");
        }
        double mult = couponService.priceMultiplier(request.getCouponCode(), request.getSecondCouponCode(), allowSecond);
        double total = combinedSubtotal * mult;
        double discount = combinedSubtotal - total;

        var dest = hotel.getDestination();
        return ResponseEntity.ok(BudgetSimulationResponse.builder()
                .hotelName(hotel.getName())
                .destinationCity(dest != null ? dest.getCity() : null)
                .destinationCountry(dest != null ? dest.getCountry() : null)
                .numberOfNights((int) nights)
                .numberOfPersons(request.getNumberOfPersons())
                .pricePerNight(pricePerNightTnd)
                .hotelStaySubtotal(hotelStaySubtotalEur)
                .destinationPackageFee(destinationFeeEur > 0 ? destinationFeeEur : null)
                .subtotal(combinedSubtotal)
                .discount(discount)
                .total(total)
                .couponApplied(couponLabel(request.getCouponCode(), request.getSecondCouponCode(), discount > 0))
                .build());
    }

    private double destinationPackageEur(Hotel hotel) {
        if (hotel.getDestination() == null || hotel.getDestination().getEstimatedBudget() == null) {
            return 0;
        }
        double v = hotel.getDestination().getEstimatedBudget();
        return v > 0 ? v : 0;
    }

    private static String couponLabel(String c1, String c2, boolean anyDiscount) {
        if (!anyDiscount) {
            return "None";
        }
        String a = c1 == null ? "" : c1.trim();
        String b = c2 == null ? "" : c2.trim();
        if (!b.isEmpty()) {
            return a + " + " + b;
        }
        return a.isEmpty() ? "None" : a;
    }
}