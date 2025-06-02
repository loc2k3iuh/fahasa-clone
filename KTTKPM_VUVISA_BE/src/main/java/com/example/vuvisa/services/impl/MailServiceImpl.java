package com.example.vuvisa.services.impl;

import com.example.vuvisa.dtos.responses.OrderResponse;
import com.example.vuvisa.entities.Order;
import com.example.vuvisa.entities.Voucher;
import com.example.vuvisa.utils.PdfGeneratorUtils;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.io.File;
import com.lowagie.text.pdf.BaseFont;

@Service
@RequiredArgsConstructor
public class MailServiceImpl {
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;


    public void sendInvoiceEmail(Order order, String recipientEmail) throws Exception {

        Context context = new Context();
        context.setVariable("order", order);

        double discountAmount = 0.0;
        if (order.getVouchers() != null && !order.getVouchers().isEmpty()) {
            discountAmount = order.getVouchers().stream()
                    .mapToDouble(Voucher::getDiscountAmount)
                    .sum();
        }
        context.setVariable("discountAmount", discountAmount);

        double totalPrice = order.getOrderDetails().stream()
                .mapToDouble(orderDetail -> orderDetail.getProduct().getPrice() * orderDetail.getQuantity())
                .sum();

        context.setVariable("totalPrice", totalPrice);


        String htmlContent = templateEngine.process("invoice", context);
        byte[] pdfBytes = PdfGeneratorUtils.generatePdfFromHtml(htmlContent);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(recipientEmail);
        helper.setSubject("Hóa đơn mua hàng vuvisa của: " + order.getFullName());
        helper.setText("Vui lòng xem hóa đơn đính kèm.");
        helper.addAttachment("invoice.pdf", new ByteArrayResource(pdfBytes));

        mailSender.send(message);
    }
}
