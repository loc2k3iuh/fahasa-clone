package com.example.vuvisa.utils;

import com.example.vuvisa.services.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Utility class for storing PDFs and generating URLs to access them
 */
@Component
@RequiredArgsConstructor
public class PdfStorageUtils {

    private final S3Service s3Service;
    private static final String PDF_FOLDER = "pdfs/invoices";
    private static final String MERGED_PDF_FOLDER = "pdfs/invoices";
    private static final String PDF_CONTENT_TYPE = "application/pdf";

    /**
     * Store a PDF in S3 and return the URL to access it
     * @param pdfBytes The PDF as a byte array
     * @param orderId The order ID associated with the PDF
     * @return The URL to access the PDF
     * @throws IOException If an I/O error occurs
     */
    public String storePdf(byte[] pdfBytes, Long orderId) throws IOException {
        String fileName = "invoice_" + orderId + ".pdf";
        return s3Service.uploadBytes(pdfBytes, fileName, PDF_CONTENT_TYPE, PDF_FOLDER);
    }

    /**
     * Store multiple PDFs in S3 and return the URLs to access them
     * @param pdfBytesList List of PDFs as byte arrays
     * @param orderIds List of order IDs associated with the PDFs
     * @return List of URLs to access the PDFs
     * @throws IOException If an I/O error occurs
     */
    public List<String> storePdfs(List<byte[]> pdfBytesList, List<Long> orderIds) throws IOException {
        if (pdfBytesList.size() != orderIds.size()) {
            throw new IllegalArgumentException("Number of PDFs and order IDs must match");
        }

        List<String> urls = new ArrayList<>();
        for (int i = 0; i < pdfBytesList.size(); i++) {
            String url = storePdf(pdfBytesList.get(i), orderIds.get(i));
            urls.add(url);
        }
        return urls;
    }

    /**
     * Store a merged PDF in S3 and return the URL to access it
     * @param mergedPdfBytes The merged PDF as a byte array
     * @param orderIds List of order IDs included in the merged PDF
     * @return URL to access the merged PDF
     * @throws IOException If an I/O error occurs
     */
    public String storeMergedPdf(byte[] mergedPdfBytes, List<Long> orderIds) throws IOException {
        // Create a filename that includes all order IDs
        String orderIdsString = orderIds.stream()
                .map(Object::toString)
                .collect(Collectors.joining("_"));

        String fileName = "invoices_" + orderIdsString + ".pdf";

        // Store the merged PDF in a different folder
        return s3Service.uploadBytes(mergedPdfBytes, fileName, PDF_CONTENT_TYPE, MERGED_PDF_FOLDER);
    }
}
