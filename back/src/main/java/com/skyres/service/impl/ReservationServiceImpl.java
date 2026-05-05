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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        // calculate total price
        long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        double subtotal = nights * hotel.getPricePerNight() * request.getNumberOfPersons();

        // apply coupon
        double discount = couponService.getDiscount(request.getCouponCode());
        double totalPrice = subtotal * (1 - discount);

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

        return toResponse(saved, totalPrice);
    }

    @Override
    public ReservationResponse getById(Long id) {
        Reservation r = findById(id);
        double totalPrice = calculateTotalPrice(r);
        return toResponse(r, totalPrice);
    }

    @Override
    public List<ReservationResponse> getByUserId(Long userId) {
        return reservationRepository.findByUserId(userId).stream()
                .map(r -> toResponse(r, calculateTotalPrice(r)))
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
        return toResponse(reservationRepository.save(r), calculateTotalPrice(r));
    }

    @Override
    public byte[] generatePdf(Long id) {
        Reservation r = findById(id);
        double totalPrice = calculateTotalPrice(r);
        return pdfGenerator.generateInvoice(toResponse(r, totalPrice));
    }

    @Override
    public byte[] generateQrCode(Long id) {
        Reservation r = findById(id);
        String content = r.getQrCode() != null ? r.getQrCode() : "SKYRES-" + id;
        return qrCodeGenerator.generate(content, 300, 300);
    }

    // ── helpers ──────────────────────────────────────────

    private Reservation findById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
    }

    private double calculateTotalPrice(Reservation r) {
        long nights = ChronoUnit.DAYS.between(r.getCheckIn(), r.getCheckOut());
        return nights * r.getHotel().getPricePerNight() * r.getNumberOfPersons();
    }

    private ReservationResponse toResponse(Reservation r, double totalPrice) {
        return ReservationResponse.builder()
                .id(r.getId())
                .userId(r.getUser().getId())
                .userFullName(r.getUser().getFirstName() + " " + r.getUser().getLastName())
                .hotelId(r.getHotel().getId())
                .hotelName(r.getHotel().getName())
                .checkIn(r.getCheckIn())
                .checkOut(r.getCheckOut())
                .numberOfPersons(r.getNumberOfPersons())
                .status(r.getStatus())
                .totalPrice(totalPrice)
                .qrCode(r.getQrCode())
                .createdAt(r.getCreatedAt())
                .build();
    }
}