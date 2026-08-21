/**
 * Generates a beautiful, responsive HTML email template for sending magic password reset links.
 *
 * @param reslink The password reset / login link to embed in the CTA button.
 * @param email The recipient's email address.
 * @returns The fully compiled HTML string.
 */
export const getMagicLinkEmailTemplate = (reslink: string, email: string): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Syncra AI Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; width: 100% !important;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(79, 70, 229, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Gradient Top bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #c084fc 100%); height: 8px;"></td>
          </tr>
          
          <!-- Logo & Brand Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 24px 40px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); width: 52px; height: 52px; border-radius: 16px; text-align: center; box-shadow: 0 8px 16px rgba(79, 70, 229, 0.2);">
                    <!-- Brand initial placeholder representing the modern logo -->
                    <span style="font-size: 26px; line-height: 52px; color: #ffffff; font-weight: 800;">S</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <span style="font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">Syncra AI</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 4px;">
                    <span style="font-size: 12px; font-weight: 500; color: #64748b; tracking-wide: 0.5px;">AI-Powered Meeting Summaries & Central Action Tracker</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 20px 40px 30px 40px; text-align: center;">
              <h2 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; letter-spacing: -0.5px;">Reset Your Password</h2>
              <p style="font-size: 15px; color: #475569; line-height: 24px; margin: 0 0 24px 0;">
                Hello,<br>
                We received a request to access your Syncra AI account associated with <strong style="color: #0f172a;">${email}</strong>. 
                Click the button below to sign in and choose a new password.
              </p>
              
              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${reslink}" target="_blank" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); background-color: #4f46e5; color: #ffffff; display: inline-block; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 16px; box-shadow: 0 6px 20px rgba(79, 70, 229, 0.25); transition: all 0.2s ease-in-out;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 13px; color: #94a3b8; line-height: 20px; margin: 24px 0 0 0;">
                This link will expire in <strong style="color: #64748b;">2 hours</strong> for security reasons.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 0;">
            </td>
          </tr>
          
          <!-- Link fallback section -->
          <tr>
            <td style="padding: 24px 40px; text-align: left;">
              <p style="font-size: 12px; color: #64748b; line-height: 18px; margin: 0;">
                If you're having trouble clicking the "Reset Password" button, copy and paste the URL below into your web browser:
              </p>
              <p style="font-size: 12px; color: #4f46e5; word-break: break-all; margin: 8px 0 0 0; line-height: 18px;">
                <a href="${reslink}" target="_blank" style="color: #4f46e5; text-decoration: none; font-weight: 500;">${reslink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 28px 40px; text-align: center; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; border-top: 1px solid #f1f5f9;">
              <p style="font-size: 12px; color: #64748b; line-height: 18px; margin: 0 0 10px 0;">
                If you did not request this, you can safely ignore this email. Your password will remain unchanged.
              </p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                &copy; 2026 Syncra AI. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
