package com.skyres.util;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.skyres.dto.response.ReservationResponse;
import org.springframework.stereotype.Component;
import com.itextpdf.text.pdf.draw.LineSeparator;
import java.io.ByteArrayOutputStream;

@Component
public class PdfGenerator {

    public byte[] generateInvoice(ReservationResponse reservation) {
        try {
            Document document = new Document(PageSize.A4);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, out);
            document.open();

            // fonts
            Font titleFont = new Font(Font.FontFamily.HELVETICA, 22, Font.BOLD, new BaseColor(12, 122, 110));
            Font headerFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
            Font normalFont = new Font(Font.FontFamily.HELVETICA, 11, Font.NORMAL);
            Font smallFont = new Font(Font.FontFamily.HELVETICA, 9, Font.ITALIC, BaseColor.GRAY);

            // title
            Paragraph title = new Paragraph("SkyRes — Booking Invoice", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // divider
            document.add(new Chunk(new LineSeparator()));
            document.add(Chunk.NEWLINE);

            // reservation details table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);
            table.setSpacingAfter(10);

            addRow(table, "Reservation ID", String.valueOf(reservation.getId()), headerFont, normalFont);
            addRow(table, "Guest", reservation.getUserFullName(), headerFont, normalFont);
            addRow(table, "Hotel", reservation.getHotelName(), headerFont, normalFont);
            addRow(table, "Check-in", reservation.getCheckIn().toString(), headerFont, normalFont);
            addRow(table, "Check-out", reservation.getCheckOut().toString(), headerFont, normalFont);
            addRow(table, "Persons", String.valueOf(reservation.getNumberOfPersons()), headerFont, normalFont);
            addRow(table, "Status", reservation.getStatus().name(), headerFont, normalFont);
            addRow(table, "Total Price", "$" + String.format("%.2f", reservation.getTotalPrice()), headerFont, normalFont);

            document.add(table);

            // footer
            document.add(new Chunk(new LineSeparator()));
            Paragraph footer = new Paragraph("Thank you for choosing SkyRes. Have a great trip!", smallFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(10);
            document.add(footer);

            document.close();
            return out.toByteArray();

        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage());
        }
    }

    private void addRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(Rectangle.BOTTOM);
        labelCell.setPadding(8);
        labelCell.setBackgroundColor(new BaseColor(240, 248, 247));

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(Rectangle.BOTTOM);
        valueCell.setPadding(8);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }
}