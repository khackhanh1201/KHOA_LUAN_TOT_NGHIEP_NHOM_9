package com.thanglong.landtax.usecase.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.*;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * Xuất phiếu tiếp nhận hồ sơ địa chính (PDF).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class RecordReceiptPdfService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final RecordJpaRepository recordJpaRepository;
    private final CitizenLocalJpaRepository citizenLocalJpaRepository;
    private final LandParcelJpaRepository landParcelJpaRepository;
    private final LandTypeJpaRepository landTypeJpaRepository;
    private final RecordDocumentJpaRepository recordDocumentJpaRepository;
    private final TaxDeclarationRepository taxDeclarationRepository;

    public byte[] generateReceipt(Integer recordId, String officerName) {
        log.info("Generating record receipt PDF for recordId={}", recordId);

        RecordEntity record = recordJpaRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay ho so: " + recordId));

        CitizenLocalEntity citizen = citizenLocalJpaRepository.findById(record.getCitizenId())
                .orElseThrow(() -> new RuntimeException("Khong tim thay cong dan"));

        LandParcelEntity parcel = landParcelJpaRepository.findById(record.getLandParcelId())
                .orElseThrow(() -> new RuntimeException("Khong tim thay thua dat"));

        String landTypeName = landTypeJpaRepository.findById(parcel.getLandTypeId())
                .map(LandTypeEntity::getTypeName)
                .orElse("—");

        String declaredUsage = taxDeclarationRepository.findByRecordId(recordId)
                .map(TaxDeclarationEntity::getDeclaredUsage)
                .orElse(null);

        List<String> docNames = recordDocumentJpaRepository.findByRecordId(recordId.longValue()).stream()
                .map(RecordDocumentEntity::getFileName)
                .collect(Collectors.toList());

        Document document = new Document(PageSize.A4, 50, 50, 50, 50);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font normal = FontFactory.getFont(FontFactory.HELVETICA, 11, BaseColor.BLACK);
            Font bold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, BaseColor.BLACK);
            Font title = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, BaseColor.BLACK);
            Font small = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.BLACK);
            Font smallBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.BLACK);

            PdfPTable header = new PdfPTable(2);
            header.setWidthPercentage(100);
            header.setSpacingAfter(20f);

            PdfPCell left = new PdfPCell();
            left.setBorder(Rectangle.NO_BORDER);
            left.addElement(new Phrase("SO TAI NGUYEN VA MOI TRUONG\nVAN PHONG DANG KY DAT DAI", smallBold));
            header.addCell(left);

            PdfPCell right = new PdfPCell();
            right.setBorder(Rectangle.NO_BORDER);
            right.setHorizontalAlignment(Element.ALIGN_RIGHT);
            right.addElement(new Phrase("CONG HOA XA HOI CHU NGHIA VIET NAM\nDoc lap - Tu do - Hanh phuc", smallBold));
            header.addCell(right);
            document.add(header);

            Paragraph docTitle = new Paragraph("PHIEU TIEP NHAN HO SO", title);
            docTitle.setAlignment(Element.ALIGN_CENTER);
            docTitle.setSpacingAfter(4f);
            document.add(docTitle);

            String receiptNo = String.format("HS-%06d/PTN-VPDKDD", recordId);
            Paragraph receiptNumber = new Paragraph("So: " + receiptNo, normal);
            receiptNumber.setAlignment(Element.ALIGN_CENTER);
            receiptNumber.setSpacingAfter(16f);
            document.add(receiptNumber);

            document.add(line("1. Thong tin nguoi nop: " + safe(citizen.getFullName()), normal));
            document.add(line("2. So CCCD/So to/So thua: "
                    + safe(citizen.getCccdNumber()) + " / "
                    + safe(parcel.getMapSheetNumber()) + " / "
                    + safe(parcel.getParcelNumber()), normal));
            document.add(line("3. Doi tuong mien thue: "
                    + (declaredUsage != null ? "Khong co" : "Khong co"), normal));
            document.add(line("4. Loai ho so: " + mapCategory(record.getRecordCategory()), normal));

            document.add(new Paragraph("5. Thong tin thua dat:", bold));
            document.add(line("   - Thua dat so: " + safe(parcel.getParcelNumber())
                    + "; To ban do so: " + safe(parcel.getMapSheetNumber()), normal));
            document.add(line("   - Dien tich: " + (parcel.getAreaSize() != null ? parcel.getAreaSize() + " m2" : "—"), normal));
            document.add(line("   - Loai dat: " + landTypeName, normal));
            document.add(line("   - Hinh thuc su dung: " + safe(parcel.getUsageType()), normal));
            document.add(line("   - Dia chi: " + safe(parcel.getAddress()), normal));

            document.add(new Paragraph("6. Danh muc tai lieu dinh kem:", bold));
            if (docNames.isEmpty()) {
                document.add(line("   Khong co tai lieu dinh kem", normal));
            } else {
                for (String name : docNames) {
                    document.add(line("   - " + name + " (Da nop)", normal));
                }
            }

            String submitted = record.getSubmittedAt() != null
                    ? record.getSubmittedAt().format(DATE_FMT) : "—";
            document.add(line("7. Ngay tiep nhan: " + submitted, normal));
            document.add(line("8. Trang thai: " + mapStatus(record.getCurrentStatus()), normal));

            document.add(Chunk.NEWLINE);

            PdfPTable sign = new PdfPTable(2);
            sign.setWidthPercentage(100);
            sign.setSpacingBefore(30f);

            PdfPCell submitter = new PdfPCell();
            submitter.setBorder(Rectangle.NO_BORDER);
            submitter.setHorizontalAlignment(Element.ALIGN_CENTER);
            submitter.addElement(new Phrase("NGUOI NOP HO SO", bold));
            submitter.addElement(new Phrase("\n\n\n" + safe(citizen.getFullName()), normal));
            sign.addCell(submitter);

            PdfPCell officer = new PdfPCell();
            officer.setBorder(Rectangle.NO_BORDER);
            officer.setHorizontalAlignment(Element.ALIGN_CENTER);
            String placeDate = record.getSubmittedAt() != null
                    ? String.format(Locale.forLanguageTag("vi"), "Ha Noi, ngay %d thang %d nam %d",
                    record.getSubmittedAt().getDayOfMonth(),
                    record.getSubmittedAt().getMonthValue(),
                    record.getSubmittedAt().getYear())
                    : "Ha Noi, ...";
            officer.addElement(new Phrase(placeDate, FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10)));
            officer.addElement(new Phrase("\nCAN BO TIEP NHAN", bold));
            officer.addElement(new Phrase("\n\n\n" + safe(officerName != null ? officerName : ""), normal));
            sign.addCell(officer);

            document.add(sign);
            document.close();

            log.info("Record receipt PDF generated for recordId={}", recordId);
            return out.toByteArray();
        } catch (DocumentException e) {
            log.error("Error generating record receipt PDF: {}", e.getMessage());
            throw new RuntimeException("Loi tao file PDF", e);
        }
    }

    private Paragraph line(String text, Font font) {
        Paragraph p = new Paragraph(text, font);
        p.setSpacingAfter(6f);
        return p;
    }

    private String safe(String v) {
        return v != null && !v.isBlank() ? v : "—";
    }

    private String mapCategory(String cat) {
        if (cat == null) return "—";
        return switch (cat) {
            case "TAX_DECLARATION" -> "Khai thue dat";
            case "LAND_OWNERSHIP_NEW" -> "Khai bao dat so huu (Dat moi)";
            case "TRANSFER" -> "Tach/Hop thua dat";
            case "CHANGE_PURPOSE" -> "Thay doi muc dich su dung";
            default -> cat;
        };
    }

    private String mapStatus(String status) {
        if (status == null) return "—";
        return switch (status) {
            case "SUBMITTED", "PENDING" -> "Cho duyet";
            case "VERIFIED" -> "Da xac minh";
            case "APPROVED" -> "Da duyet";
            case "REJECTED" -> "Tu choi";
            case "CANCELLED" -> "Da huy";
            default -> status;
        };
    }
}
