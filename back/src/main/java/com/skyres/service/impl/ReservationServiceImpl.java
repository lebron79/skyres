package com.skyres.service.impl;

import com.skyres.dto.request.ReservationRequest;
import com.skyres.dto.response.ReservationResponse;
import com.skyres.model.entity.Hotel;
import com.skyres.model.entity.Reservation;
import com.skyres.model.entity.User;
import com.skyres.model.enums.ReservationStatus;
import com.skyres.repository.HotelRepository;
import com.skyres.repository.ReservationRepository;
import com.skyres.repository.UserRepository;
import com.skyres.service.CouponService;
import com.skyres.service.ReservationService;
import com.skyres.util.PdfGenerator;
import com.skyres.util.QrCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final QrCodeGenerator qrCodeGenerator;
    private final PdfGenerator pdfGenerator;
    private final CouponService couponService;

    /** Destination `estimatedBudget` is EUR; hotel `pricePerNight` is stored as TND and converted here. */
    @Value("${skyres.tnd-per-eur:3.42}")
    private double tndPerEur;

    @Override
    @Transactional
    public ReservationResponse create(ReservationRequest request) {
        // validate dates
        if (!request.getCheckOut().isAfter(request.getCheckIn())) {
            throw new IllegalArgumentException("Check-out must be after check-in");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        if (!hotel.isAvailable()) {
            throw new IllegalArgumentException("Hotel is not available");
        }

        // Total in EUR: hotel stay (TND→EUR) + destination package (EUR, once per booking)
        long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        double hotelStaySubtotalEur = nights * (hotel.getPricePerNight() / tndPerEur) * request.getNumberOfPersons();
        double destinationFeeEur = destinationPackageEur(hotel);
        double combinedBeforeDiscount = hotelStaySubtotalEur + destinationFeeEur;

        long priorCount = reservationRepository.countByUser_Id(request.getUserId());
        boolean allowSecondCoupon = priorCount == 0;
        double mult = couponService.priceMultiplier(request.getCouponCode(), request.getSecondCouponCode(), allowSecondCoupon);
        double totalPrice = combinedBeforeDiscount * mult;

        // build reservation
        Reservation reservation = Reservation.builder()
                .user(user)
                .hotel(hotel)
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .numberOfPersons(request.getNumberOfPersons())
                .status(ReservationStatus.PENDING)
                .build();

        Reservation saved = reservationRepository.save(reservation);

        // generate QR code content
        String qrContent = "SKYRES-RESERVATION-" + saved.getId()
                + "-USER-" + user.getId()
                + "-HOTEL-" + hotel.getId();
        saved.setQrCode(qrContent);
        reservationRepository.save(saved);

        return toResponse(saved, hotelStaySubtotalEur, destinationFeeEur, totalPrice);
    }

    @Override
    public ReservationResponse getById(Long id) {
        Reservation r = findById(id);
        PricingBreakdown b = pricingBreakdown(r);
        return toResponse(r, b.hotelStaySubtotalEur(), b.destinationPackageEur(), b.totalPriceEur());
    }

    @Override
    public List<ReservationResponse> getByUserId(Long userId) {
        return reservationRepository.findByUserId(userId).stream()
                .map(r -> {
                    PricingBreakdown b = pricingBreakdown(r);
                    return toResponse(r, b.hotelStaySubtotalEur(), b.destinationPackageEur(), b.totalPriceEur());
                })
                .toList();
    }

    @Override
    @Transactional
    public ReservationResponse cancel(Long id) {
        Reservation r = findById(id);
        if (r.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalArgumentException("Reservation is already cancelled");
        }
        r.setStatus(ReservationStatus.CANCELLED);
        PricingBreakdown b = pricingBreakdown(r);
        return toResponse(reservationRepository.save(r), b.hotelStaySubtotalEur(), b.destinationPackageEur(), b.totalPriceEur());
    }

    @Override
    @Transactional
    public void deleteCancelledIfOwned(Long reservationId, String ownerEmail) {
        var actor = userRepository.findByEmailIgnoreCase(ownerEmail.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));
        if (!r.getUser().getId().equals(actor.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your reservation");
        }
        if (r.getStatus() != ReservationStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only cancelled reservations can be deleted");
        }
        reservationRepository.delete(r);
    }

    @Override
    public byte[] generatePdf(Long id) {
        Reservation r = findById(id);
        PricingBreakdown b = pricingBreakdown(r);
        return pdfGenerator.generateInvoice(toResponse(r, b.hotelStaySubtotalEur(), b.destinationPackageEur(), b.totalPriceEur()));
    }

    @Override
    public byte[] generateQrCode(Long id) {
        Reservation r = findById(id);
        String content = r.getQrCode() != null ? r.getQrCode() : "SKYRES-" + id;
        return qrCodeGenerator.generate(content, 300, 300);
    }

    // ── helpers ──────────────────────────────────────────

    private record PricingBreakdown(double hotelStaySubtotalEur, double destinationPackageEur, double totalPriceEur) {}

    private PricingBreakdown pricingBreakdown(Reservation r) {
        long nights = ChronoUnit.DAYS.between(r.getCheckIn(), r.getCheckOut());
        double hotelStayEur = nights * (r.getHotel().getPricePerNight() / tndPerEur) * r.getNumberOfPersons();
        double destEur = destinationPackageEur(r.getHotel());
        return new PricingBreakdown(hotelStayEur, destEur, hotelStayEur + destEur);
    }

    private double destinationPackageEur(Hotel hotel) {
        if (hotel.getDestination() == null || hotel.getDestination().getEstimatedBudget() == null) {
            return 0;
        }
        double v = hotel.getDestination().getEstimatedBudget();
        return v > 0 ? v : 0;
    }

    private Reservation findById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
    }

    private ReservationResponse toResponse(Reservation r, double hotelStaySubtotalEur,
                                           double destinationPackageEur, double totalPriceEur) {
        var dest = r.getHotel().getDestination();
        return ReservationResponse.builder()
                .id(r.getId())
                .userId(r.getUser().getId())
                .userFullName(r.getUser().getFirstName() + " " + r.getUser().getLastName())
                .hotelId(r.getHotel().getId())
                .hotelName(r.getHotel().getName())
                .destinationCity(dest != null ? dest.getCity() : null)
                .destinationCountry(dest != null ? dest.getCountry() : null)
                .destinationId(dest != null ? dest.getId() : null)
                .hotelStaySubtotal(hotelStaySubtotalEur)
                .destinationPackageFee(destinationPackageEur > 0 ? destinationPackageEur : null)
                .checkIn(r.getCheckIn())
                .checkOut(r.getCheckOut())
                .numberOfPersons(r.getNumberOfPersons())
                .status(r.getStatus())
                .totalPrice(totalPriceEur)
                .qrCode(r.getQrCode())
                .createdAt(r.getCreatedAt())
                .build();
    }
}