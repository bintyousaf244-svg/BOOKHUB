import nodemailer from "nodemailer";

function getStoreUrl() {
  const domains = process.env.REPLIT_DOMAINS;
  if (domains) {
    return `https://${domains.split(",")[0].trim()}`;
  }
  const devDomain = process.env.REPLIT_DEV_DOMAIN;
  if (devDomain) {
    return `https://${devDomain}`;
  }
  return "https://learnersgrovebooks.com";
}

function createTransporter() {
  const user = process.env.EMAIL_FROM;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

interface OrderItem {
  bookId: number;
  title: string;
  price: number;
  quantity: number;
  coverImage: string;
}

interface SendDownloadEmailArgs {
  to: string;
  customerName: string;
  orderId: number;
  items: OrderItem[];
  total: number;
}

function buildEmailHtml(args: SendDownloadEmailArgs): string {
  const { customerName, orderId, items, total } = args;
  const storeUrl = getStoreUrl();
  const downloadUrl = `${storeUrl}/my-orders?id=${orderId}`;

  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0e8dc;font-family:Georgia,serif;font-size:14px;color:#3d2b1a;">
            ${item.title} <span style="color:#7a5c3a;font-size:12px;">× ${item.quantity}</span>
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0e8dc;font-family:Arial,sans-serif;font-size:14px;color:#3d2b1a;text-align:right;font-weight:bold;">
            Rs. ${(item.price * item.quantity).toLocaleString()}
          </td>
        </tr>
      `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Your Books Are Ready</title></head>
<body style="margin:0;padding:0;background-color:#f9f4ef;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f4ef;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#6b1f3e;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:28px;color:#ffffff;letter-spacing:1px;">Learner's Grove</h1>
              <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#f0c8d8;letter-spacing:2px;text-transform:uppercase;">Books for Every Learner</p>
            </td>
          </tr>

          <!-- Success Banner -->
          <tr>
            <td style="background-color:#f0faf4;border-bottom:2px solid #c6f0d4;padding:24px 40px;text-align:center;">
              <div style="font-size:40px;margin-bottom:8px;">✅</div>
              <h2 style="margin:0;font-family:Georgia,serif;font-size:22px;color:#1a6e3a;">Payment Verified!</h2>
              <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:14px;color:#4a7a58;">Your books are now ready to download</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 20px;font-family:Arial,sans-serif;font-size:15px;color:#3d2b1a;">
                Assalamu Alaikum <strong>${customerName}</strong>,
              </p>
              <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:14px;color:#6b5744;line-height:1.6;">
                Great news! We have confirmed your payment for Order <strong>#${orderId}</strong>. Your purchased books are now unlocked and ready for download.
              </p>

              <!-- Download Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${downloadUrl}" style="display:inline-block;background-color:#6b1f3e;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;padding:14px 40px;border-radius:50px;letter-spacing:0.5px;">
                      📥 Download My Books
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Instructions -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fdf6f0;border:1px solid #f0e0cc;border-radius:8px;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;color:#6b1f3e;text-transform:uppercase;letter-spacing:1px;">How to download</p>
                    <ol style="margin:0;padding-left:18px;font-family:Arial,sans-serif;font-size:13px;color:#6b5744;line-height:1.8;">
                      <li>Click the button above (or visit <a href="${downloadUrl}" style="color:#6b1f3e;">${storeUrl}/my-orders</a>)</li>
                      <li>Enter your Order Number: <strong>#${orderId}</strong></li>
                      <li>Enter your email: <strong>${args.to}</strong></li>
                      <li>Click the download button for each book</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <!-- Order Summary -->
              <p style="margin:0 0 12px;font-family:Georgia,serif;font-size:16px;font-weight:bold;color:#3d2b1a;">Order Summary — #${orderId}</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0e8dc;border-radius:8px;overflow:hidden;margin-bottom:16px;">
                <thead>
                  <tr style="background-color:#fdf6f0;">
                    <th style="padding:10px 12px;font-family:Arial,sans-serif;font-size:12px;color:#7a5c3a;text-align:left;text-transform:uppercase;letter-spacing:1px;">Book</th>
                    <th style="padding:10px 12px;font-family:Arial,sans-serif;font-size:12px;color:#7a5c3a;text-align:right;text-transform:uppercase;letter-spacing:1px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                  <tr style="background-color:#fdf6f0;">
                    <td style="padding:10px 12px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#3d2b1a;">Total Paid</td>
                    <td style="padding:10px 12px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#6b1f3e;text-align:right;">Rs. ${total.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#9b8674;line-height:1.6;">
                If you have any trouble downloading, reply to this email or contact us on WhatsApp. We're happy to help!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f4ef;padding:20px 40px;text-align:center;border-top:1px solid #f0e8dc;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#b39880;">
                © ${new Date().getFullYear()} Learner's Grove · Digital Learning Books
              </p>
              <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#b39880;">
                <a href="${storeUrl}/books" style="color:#6b1f3e;text-decoration:none;">Browse More Books</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendDownloadEmail(args: SendDownloadEmailArgs): Promise<{ sent: boolean; reason?: string }> {
  const transporter = createTransporter();
  if (!transporter) {
    return { sent: false, reason: "EMAIL_FROM or EMAIL_PASS not configured" };
  }

  const html = buildEmailHtml(args);

  try {
    await transporter.sendMail({
      from: `"Learner's Grove" <${process.env.EMAIL_FROM}>`,
      to: args.to,
      subject: `✅ Your Books Are Ready to Download — Order #${args.orderId}`,
      html,
    });
    return { sent: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { sent: false, reason: message };
  }
}
