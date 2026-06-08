package com.thanglong.vneid.infrastructure.adapter.external;

/**
 * Template HTML cho email giao dịch (OTP, kích hoạt, đặt lại mật khẩu).
 * Dùng inline CSS để tương thích Gmail / Outlook.
 */
final class EmailTemplateBuilder {

    private static final String BRAND_RED = "#a30d11";
    private static final String BRAND_DARK = "#1e293b";
    private static final String MUTED = "#64748b";
    private static final String BORDER = "#e2e8f0";
    private static final String BG = "#f8fafc";

    private EmailTemplateBuilder() {
    }

    static String buildOtpEmail(String otpCode) {
        String body = """
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:%s;">
                  Xin chào,
                </p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:%s;">
                  Bạn đang thực hiện xác thực đăng nhập trên <strong>Hệ thống quản lý địa chính số</strong>.
                  Vui lòng nhập mã OTP bên dưới để tiếp tục:
                </p>
                <div style="text-align:center;margin:28px 0;">
                  <div style="display:inline-block;background:#fff7ed;border:2px dashed #f59e0b;border-radius:12px;padding:20px 36px;">
                    <div style="font-size:12px;font-weight:700;letter-spacing:1px;color:#b45309;text-transform:uppercase;margin-bottom:8px;">
                      Mã xác thực OTP
                    </div>
                    <div style="font-size:36px;font-weight:800;letter-spacing:8px;color:%s;font-family:'Segoe UI',Arial,sans-serif;">
                      %s
                    </div>
                  </div>
                </div>
                <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:%s;">
                  <strong>Lưu ý bảo mật:</strong>
                </p>
                <ul style="margin:0 0 20px;padding-left:20px;font-size:14px;line-height:1.7;color:%s;">
                  <li>Mã có hiệu lực trong <strong>5 phút</strong>.</li>
                  <li>Không chia sẻ mã OTP cho bất kỳ ai, kể cả cán bộ hỗ trợ.</li>
                  <li>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</li>
                </ul>
                """.formatted(BRAND_DARK, BRAND_DARK, BRAND_RED, escapeHtml(otpCode), BRAND_DARK, MUTED);

        return wrapLayout("Mã xác thực OTP", body);
    }

    static String buildActivationEmail(String activationLink) {
        String safeLink = escapeHtml(activationLink);
        String body = """
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:%s;">
                  Xin chào,
                </p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:%s;">
                  Cảm ơn bạn đã đăng ký tài khoản <strong>VNeID</strong>. Nhấn nút bên dưới để kích hoạt tài khoản:
                </p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="%s" style="display:inline-block;background:%s;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;">
                    Kích hoạt tài khoản
                  </a>
                </div>
                <p style="margin:0;font-size:13px;line-height:1.6;color:%s;word-break:break-all;">
                  Hoặc sao chép liên kết: <a href="%s" style="color:%s;">%s</a>
                </p>
                """.formatted(BRAND_DARK, BRAND_DARK, safeLink, BRAND_RED, MUTED, safeLink, BRAND_RED, safeLink);

        return wrapLayout("Kích hoạt tài khoản", body);
    }

    static String buildPasswordResetEmail(String resetLink) {
        String safeLink = escapeHtml(resetLink);
        String body = """
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:%s;">
                  Xin chào,
                </p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:%s;">
                  Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản VNeID của bạn.
                </p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="%s" style="display:inline-block;background:%s;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;">
                    Đặt lại mật khẩu
                  </a>
                </div>
                <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:%s;">
                  Liên kết có hiệu lực trong thời gian giới hạn. Nếu bạn không yêu cầu, hãy bỏ qua email này.
                </p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:%s;word-break:break-all;">
                  Liên kết dự phòng: <a href="%s" style="color:%s;">%s</a>
                </p>
                """.formatted(BRAND_DARK, BRAND_DARK, safeLink, BRAND_RED, MUTED, MUTED, safeLink, BRAND_RED, safeLink);

        return wrapLayout("Đặt lại mật khẩu", body);
    }

    private static String wrapLayout(String title, String innerBody) {
        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                  <meta charset="UTF-8"/>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                  <title>%s</title>
                </head>
                <body style="margin:0;padding:0;background:%s;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:%s;padding:32px 16px;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid %s;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
                          <tr>
                            <td style="background:%s;padding:24px 28px;text-align:center;">
                              <div style="font-size:11px;font-weight:700;letter-spacing:1.2px;color:#fecaca;text-transform:uppercase;margin-bottom:6px;">
                                Bộ Tài nguyên &amp; Môi trường
                              </div>
                              <div style="font-size:18px;font-weight:800;color:#ffffff;line-height:1.3;">
                                Hệ thống quản lý địa chính số
                              </div>
                              <div style="font-size:12px;color:#fecaca;margin-top:6px;">
                                VNeID — Định danh điện tử
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:32px 28px;">
                              <h1 style="margin:0 0 20px;font-size:20px;font-weight:800;color:%s;">%s</h1>
                              %s
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:20px 28px;background:#f1f5f9;border-top:1px solid %s;">
                              <p style="margin:0;font-size:12px;line-height:1.6;color:%s;text-align:center;">
                                Email tự động từ hệ thống VNeID. Vui lòng không trả lời email này.<br/>
                                © Bộ Tài nguyên &amp; Môi trường
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(title, BG, BG, BORDER, BRAND_RED, BRAND_DARK, title, innerBody, BORDER, MUTED);
    }

    private static String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
