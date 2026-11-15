import os
import ssl
import logging
import asyncio
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

import resend
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("krishiconnect.email")

# --- Gmail / generic SMTP config ---------------------------------------
MAIL_USERNAME = os.getenv("MAIL_USERNAME") or os.getenv("SMTP_USER") or ""
MAIL_PASSWORD = (os.getenv("MAIL_PASSWORD") or os.getenv("SMTP_PASSWORD") or "").replace(" ", "")
MAIL_SERVER = os.getenv("MAIL_SERVER") or os.getenv("SMTP_HOST") or "smtp.gmail.com"
MAIL_PORT = int(os.getenv("MAIL_PORT") or os.getenv("SMTP_PORT") or "587")
MAIL_FROM = os.getenv("MAIL_FROM") or MAIL_USERNAME or "onboarding@resend.dev"

# --- Resend config (used only if SMTP isn't configured) -----------------
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
resend.api_key = RESEND_API_KEY

_PLACEHOLDER_MARKERS = ("CHANGE_ME", "your-", "re_egzWwiZF")


def _is_configured(value: str) -> bool:
    if not value:
        return False
    return not any(marker in value for marker in _PLACEHOLDER_MARKERS)


SMTP_CONFIGURED = _is_configured(MAIL_USERNAME) and _is_configured(MAIL_PASSWORD)
RESEND_CONFIGURED = _is_configured(RESEND_API_KEY)


class EmailSendError(Exception):
    """Raised when the invoice email genuinely fails to send."""


def _build_html(invoice_number: str, amount: float) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice #{invoice_number}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          <!-- Emerald Header Accent -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); height: 6px;"></td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <!-- Brand Header -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td>
                    <div style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a;">
                      Krishi<span style="color: #059669;">Connect</span>
                    </div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-top: 2px;">
                      Official Invoice Dispatch
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 12px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #047857;">
                      PDF Attached
                    </span>
                  </td>
                </tr>
              </table>

              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
                Dear Customer,
              </p>
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">
                Thank you for your business. Your invoice <strong>#{invoice_number}</strong> is ready and attached to this email as a PDF document.
              </p>

              <!-- Summary Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 14px; border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 4px 0;">
                    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">
                      Invoice Number
                    </div>
                    <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 4px; font-family: monospace;">
                      #{invoice_number}
                    </div>
                  </td>
                  <td align="right" style="padding: 4px 0;">
                    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">
                      Amount Due / Total
                    </div>
                    <div style="font-size: 20px; font-weight: 800; color: #059669; margin-top: 4px;">
                      &#8377;{amount:,.2f}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Attachment Note -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 16px;">
                <tr>
                  <td style="font-size: 13px; line-height: 1.5; color: #166534;">
                    📎 <strong>Attached:</strong> <code style="background-color: #dcfce7; padding: 2px 6px; border-radius: 4px; font-size: 12px;">{invoice_number}.pdf</code><br>
                    You can view, save, or print the attached tax invoice directly from this email.
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0 0 8px 0;">
                If you have any questions regarding this invoice, please reply directly to this email.
              </p>
              
              <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 20px; font-size: 12px; color: #94a3b8; text-align: center;">
                KrishiConnect &bull; Agricultural Invoicing &amp; Settlement System
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _send_via_gmail_smtp(email_to: str, invoice_number: str, amount: float, pdf_bytes: bytes = None) -> None:
    msg = MIMEMultipart("mixed")
    msg["Subject"] = f"Tax Invoice #{invoice_number} - KrishiConnect"
    
    # Format 'From' nicely
    from_name = "KrishiConnect Invoicing"
    if "<" in MAIL_FROM:
        msg["From"] = MAIL_FROM
    else:
        msg["From"] = f"{from_name} <{MAIL_FROM}>"
        
    msg["To"] = email_to

    # Alternative part for body (plain text + html)
    alt = MIMEMultipart("alternative")
    plain_text = (
        f"Dear Customer,\n\n"
        f"Thank you for your business. Please find attached tax invoice #{invoice_number} "
        f"for Rs. {amount:,.2f}.\n\n"
        f"The invoice PDF has been attached to this email.\n\n"
        f"Best regards,\nKrishiConnect Team"
    )
    alt.attach(MIMEText(plain_text, "plain", "utf-8"))
    alt.attach(MIMEText(_build_html(invoice_number, amount), "html", "utf-8"))
    msg.attach(alt)

    # Attach PDF if available
    if pdf_bytes:
        filename = f"{invoice_number}.pdf"
        part = MIMEBase("application", "pdf")
        part.set_payload(pdf_bytes)
        encoders.encode_base64(part)
        part.add_header("Content-Disposition", "attachment", filename=filename)
        part.add_header("Content-Type", "application/pdf", name=filename)
        msg.attach(part)
        logger.info("Attached PDF (%d bytes) as %s to email for %s", len(pdf_bytes), filename, email_to)

    def attempt_send(port, use_ssl):
        context = ssl.create_default_context()
        if use_ssl:
            with smtplib.SMTP_SSL(MAIL_SERVER, port, context=context, timeout=20) as server:
                server.login(MAIL_USERNAME, MAIL_PASSWORD)
                server.sendmail(MAIL_FROM, [email_to], msg.as_string())
        else:
            with smtplib.SMTP(MAIL_SERVER, port, timeout=20) as server:
                server.ehlo()
                server.starttls(context=context)
                server.ehlo()
                server.login(MAIL_USERNAME, MAIL_PASSWORD)
                server.sendmail(MAIL_FROM, [email_to], msg.as_string())

    try:
        attempt_send(MAIL_PORT, MAIL_PORT == 465)
    except ssl.SSLError as exc:
        if "UNEXPECTED_EOF_WHILE_READING" in str(exc) and MAIL_PORT == 465:
            logger.warning("Port 465 failed with SSL EOF. Auto-falling back to port 587 (STARTTLS)...")
            try:
                attempt_send(587, False)
            except Exception as fallback_exc:
                logger.error("Fallback to port 587 also failed: %s", fallback_exc)
                raise EmailSendError(str(fallback_exc)) from fallback_exc
        else:
            raise EmailSendError(str(exc)) from exc
    except smtplib.SMTPAuthenticationError as exc:
        logger.error("Gmail SMTP auth failed for %s: %s", MAIL_USERNAME, exc)
        raise EmailSendError(
            "Gmail rejected the login. Make sure MAIL_PASSWORD is a 16-character "
            "App Password (myaccount.google.com/apppasswords), not your normal Gmail password."
        ) from exc
    except Exception as exc:
        logger.error("Gmail SMTP send failed for invoice %s -> %s: %s", invoice_number, email_to, exc)
        raise EmailSendError(str(exc)) from exc

    logger.info("Invoice email with PDF sent via Gmail SMTP: invoice=%s to=%s", invoice_number, email_to)


def _send_via_resend(email_to: str, invoice_number: str, amount: float, pdf_bytes: bytes = None) -> None:
    resend_key = os.getenv("RESEND_API_KEY", RESEND_API_KEY)
    if resend_key:
        resend.api_key = resend_key

    from_addr = os.getenv("MAIL_FROM")
    if not from_addr or "vatsaai.com" in from_addr or "@gmail.com" in from_addr:
        from_addr = "KrishiConnect <onboarding@resend.dev>"

    payload = {
        "from": from_addr,
        "to": email_to,
        "subject": f"Tax Invoice #{invoice_number} - KrishiConnect",
        "html": _build_html(invoice_number, amount),
    }
    if pdf_bytes:
        # Resend Python SDK expects attachment content as list of integers for bytes (or base64 string)
        payload["attachments"] = [{
            "filename": f"{invoice_number}.pdf",
            "content": list(pdf_bytes),
        }]
        logger.info("Attached PDF (%d bytes) to Resend payload for invoice %s", len(pdf_bytes), invoice_number)

    try:
        result = resend.Emails.send(payload)
    except Exception as exc:
        logger.error("Resend send failed for invoice %s -> %s: %s", invoice_number, email_to, exc)
        raise EmailSendError(str(exc)) from exc

    if isinstance(result, dict) and result.get("id"):
        logger.info("Invoice email sent via Resend: invoice=%s to=%s id=%s", invoice_number, email_to, result["id"])
    else:
        logger.warning("Resend returned an unexpected response for invoice %s: %r", invoice_number, result)


def _send_sync(email_to: str, invoice_number: str, amount: float, pdf_bytes: bytes = None) -> None:
    mail_user = os.getenv("MAIL_USERNAME") or os.getenv("SMTP_USER") or MAIL_USERNAME
    mail_pass = (os.getenv("MAIL_PASSWORD") or os.getenv("SMTP_PASSWORD") or MAIL_PASSWORD).replace(" ", "")
    resend_key = os.getenv("RESEND_API_KEY", RESEND_API_KEY)

    # Prefer Gmail SMTP when configured, with Resend fallback
    if _is_configured(mail_user) and _is_configured(mail_pass):
        try:
            _send_via_gmail_smtp(email_to, invoice_number, amount, pdf_bytes)
            return
        except Exception as exc:
            logger.warning("Gmail SMTP attempt failed: %s. Trying Resend fallback...", exc)
            if _is_configured(resend_key):
                _send_via_resend(email_to, invoice_number, amount, pdf_bytes)
                return
            raise

    if _is_configured(resend_key):
        _send_via_resend(email_to, invoice_number, amount, pdf_bytes)
        return

    raise EmailSendError(
        "No email provider is configured. Set MAIL_USERNAME + MAIL_PASSWORD in environment."
    )


async def send_invoice_email(email_to: str, invoice_number: str, amount: float, pdf_bytes: bytes = None) -> None:
    """
    Send an invoice email with attached PDF.
    """
    await asyncio.to_thread(_send_sync, email_to, invoice_number, amount, pdf_bytes)


async def send_invoice_email_background(email_to: str, invoice_number: str, amount: float, pdf_bytes: bytes = None) -> None:
    """
    Safe wrapper for use with FastAPI BackgroundTasks.
    """
    try:
        await send_invoice_email(email_to, invoice_number, amount, pdf_bytes)
    except Exception as exc:
        logger.error("Background invoice email failed for %s (invoice %s): %s", email_to, invoice_number, exc, exc_info=True)
