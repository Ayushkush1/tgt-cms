import nodemailer from "nodemailer";

interface EmailDetailRow {
  label: string;
  value: string;
  href?: string;
}

interface SubmissionTemplateInput {
  eyebrow: string;
  subject: string;
  headline: string;
  intro: string;
  rows: EmailDetailRow[];
  messageLabel: string;
  message: string;
  replyName: string;
  replyEmail: string;
  submittedAt: Date;
  cmsPath: string;
}

export interface MailResult {
  sent: boolean;
  skipped?: boolean;
  error?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeHref(rawUrl: string): string | undefined {
  const trimmed = rawUrl.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("mailto:")) return trimmed;
  try {
    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(candidate);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function formatMessageHtml(message: string): string {
  return escapeHtml(message).replace(/\r?\n/g, "<br />");
}

function formatSubmittedAt(date: Date): string {
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getMailConfig() {
  const host = process.env.SMTP_HOST?.trim() || "";
  const port = Number(process.env.SMTP_PORT || "465");
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
  const user = process.env.SMTP_USER?.trim() || "";
  const pass = process.env.SMTP_PASS?.trim() || "";
  const fromEmail = process.env.SMTP_FROM_EMAIL?.trim() || user;
  const fromName = process.env.SMTP_FROM_NAME?.trim() || "TGT Support";
  const notificationEmail = process.env.NOTIFICATION_EMAIL?.trim() || "";

  return {
    host,
    port: Number.isFinite(port) && port > 0 ? port : 465,
    secure,
    user,
    pass,
    fromEmail,
    fromName,
    notificationEmail,
  };
}

function buildSubmissionEmail(input: SubmissionTemplateInput): { html: string; text: string } {
  const timestamp = formatSubmittedAt(input.submittedAt);
  const cmsBase = (process.env.NEXTAUTH_URL?.trim() || "http://localhost:3001").replace(/\/$/, "");
  const cmsLink = `${cmsBase}${input.cmsPath}`;

  const rowsHtml = input.rows
    .map((row) => {
      const safeHref = row.href ? sanitizeHref(row.href) : undefined;
      const valueHtml = safeHref
        ? `<a href="${escapeHtml(safeHref)}" style="color:#0B0F29;font-weight:600;text-decoration:underline;text-decoration-color:#D4AF37;">${escapeHtml(row.value)}</a>`
        : `<span style="color:#0B0F29;font-weight:600;">${escapeHtml(row.value)}</span>`;

      return `
        <tr>
          <td style="padding:11px 16px;border-bottom:1px solid #ECEEF4;width:140px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#6B7280;vertical-align:top;">
            ${escapeHtml(row.label)}
          </td>
          <td style="padding:11px 16px;border-bottom:1px solid #ECEEF4;font-size:14px;line-height:1.45;color:#0B0F29;word-break:break-word;">
            ${valueHtml}
          </td>
        </tr>
      `;
    })
    .join("");

  const messageText = input.message.trim() || "No message provided.";

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(input.subject)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#F3F4F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F3F4F8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:20px;overflow:hidden;border:1px solid #E5E7EB;box-shadow:0 12px 32px rgba(11,15,41,0.08);">
            <!-- Gold Accent Top Bar -->
            <tr>
              <td style="height:5px;background:linear-gradient(90deg,#B68D18 0%,#D4AF37 50%,#F1D67A 100%);font-size:0;line-height:0;">&nbsp;</td>
            </tr>

            <!-- Navy Hero Header -->
            <tr>
              <td style="background-color:#0B0F29;padding:30px 32px 28px 32px;">
                <span style="display:inline-block;padding:5px 12px;border-radius:999px;background-color:rgba(212,175,55,0.16);border:1px solid rgba(212,175,55,0.35);color:#F3D878;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">
                  ${escapeHtml(input.eyebrow)}
                </span>
                <h1 style="margin:14px 0 8px 0;font-size:22px;line-height:1.3;font-weight:700;color:#FFFFFF;letter-spacing:-0.02em;">
                  ${escapeHtml(input.headline)}
                </h1>
                <p style="margin:0;font-size:14px;line-height:1.55;color:#CBD5E1;">
                  ${escapeHtml(input.intro)}
                </p>
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td style="padding:28px 32px 24px 32px;">
                <!-- Summary Card -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F9FAFC;border:1px solid #ECEEF4;border-radius:14px;overflow:hidden;border-collapse:separate;">
                  ${rowsHtml}
                </table>

                <!-- Message Block -->
                <div style="margin-top:24px;">
                  <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6B7280;">
                    ${escapeHtml(input.messageLabel)}
                  </p>
                  <div style="padding:16px 18px;border-radius:14px;background-color:#FFFDF7;border:1px solid #F3E6B8;border-left:4px solid #D4AF37;font-size:14px;line-height:1.65;color:#1F2937;">
                    ${formatMessageHtml(messageText)}
                  </div>
                </div>

                <!-- Actions -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px;">
                  <tr>
                    <td style="border-radius:999px;background-color:#0B0F29;">
                      <a href="mailto:${escapeHtml(input.replyEmail)}" style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:700;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">
                        Reply to ${escapeHtml(input.replyName)} &rarr;
                      </a>
                    </td>
                    <td style="width:12px;">&nbsp;</td>
                    <td style="border-radius:999px;border:1px solid #D1D5DB;background-color:#FFFFFF;">
                      <a href="${escapeHtml(cmsLink)}" style="display:inline-block;padding:11px 20px;font-size:13px;font-weight:600;color:#0B0F29;text-decoration:none;">
                        Open in CMS
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:18px 32px;background-color:#F9FAFC;border-top:1px solid #ECEEF4;">
                <p style="margin:0;font-size:12px;line-height:1.5;color:#6B7280;">
                  Received on <strong style="color:#374151;">${escapeHtml(timestamp)}</strong> via The Gold Technologies website.
                  <br />
                  Hitting reply will respond directly to <a href="mailto:${escapeHtml(input.replyEmail)}" style="color:#9A781E;text-decoration:none;font-weight:600;">${escapeHtml(input.replyEmail)}</a>.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const textLines = [
    `${input.eyebrow}: ${input.headline}`,
    `${input.intro}`,
    "",
    ...input.rows.map((row) => `${row.label}: ${row.value}`),
    "",
    `${input.messageLabel}:`,
    messageText,
    "",
    `Received on: ${timestamp}`,
    `View in CMS: ${cmsLink}`,
  ];

  return { html, text: textLines.join("\n") };
}

async function sendNotification(input: SubmissionTemplateInput): Promise<MailResult> {
  const cfg = getMailConfig();

  if (!cfg.notificationEmail) {
    console.warn("[mailer] NOTIFICATION_EMAIL is not configured; skipping email notification.");
    return { sent: false, skipped: true };
  }

  if (!cfg.host || !cfg.user || !cfg.pass) {
    console.warn("[mailer] SMTP credentials are incomplete; skipping email notification.");
    return { sent: false, skipped: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: {
        user: cfg.user,
        pass: cfg.pass,
      },
    });

    const { html, text } = buildSubmissionEmail(input);
    const cleanReplyEmail = input.replyEmail.replace(/[\r\n]/g, "").trim();
    const cleanReplyName = input.replyName.replace(/[\r\n]/g, " ").trim();

    await transporter.sendMail({
      from: {
        name: cfg.fromName,
        address: cfg.fromEmail || cfg.user,
      },
      to: cfg.notificationEmail,
      replyTo: cleanReplyEmail
        ? {
            name: cleanReplyName || cleanReplyEmail,
            address: cleanReplyEmail,
          }
        : undefined,
      subject: input.subject.replace(/[\r\n]+/g, " "),
      text,
      html,
    });

    return { sent: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown mail error";
    console.error("[mailer] Failed to send notification email:", error);
    return { sent: false, error: message };
  }
}

export async function sendEnquiryNotification(enquiry: {
  name: string;
  email: string;
  interestedIn?: string | null;
  budget?: string | null;
  projectGoals?: string | null;
  sourcePage?: string | null;
  createdAt?: Date;
}): Promise<MailResult> {
  const interest = enquiry.interestedIn?.trim() || "Not specified";
  const budget = enquiry.budget?.trim() || "Not specified";
  const sourcePage = enquiry.sourcePage?.trim() || "Not recorded";

  return sendNotification({
    eyebrow: "New Service Enquiry",
    subject: `New Enquiry from ${enquiry.name} (${interest})`,
    headline: `New Project Brief from ${enquiry.name}`,
    intro: "A visitor submitted a service enquiry on The Gold Technologies website.",
    rows: [
      { label: "Submitted By", value: enquiry.name },
      { label: "Email", value: enquiry.email, href: `mailto:${enquiry.email}` },
      { label: "Source Page", value: sourcePage },
      { label: "Interested In", value: interest },
      { label: "Budget", value: budget },
    ],
    messageLabel: "Project Goals & Message",
    message: enquiry.projectGoals?.trim() || "No project goals provided.",
    replyName: enquiry.name,
    replyEmail: enquiry.email,
    submittedAt: enquiry.createdAt || new Date(),
    cmsPath: "/submissions/enquiries",
  });
}

export async function sendAuditNotification(audit: {
  name: string;
  email: string;
  webUrl: string;
  improve?: string | null;
  createdAt?: Date;
}): Promise<MailResult> {
  return sendNotification({
    eyebrow: "Free Website Audit Request",
    subject: `New Audit Request from ${audit.name} — ${audit.webUrl}`,
    headline: `Website Audit Requested by ${audit.name}`,
    intro: "A visitor requested a free website audit on The Gold Technologies website.",
    rows: [
      { label: "Submitted By", value: audit.name },
      { label: "Email", value: audit.email, href: `mailto:${audit.email}` },
      { label: "Website URL", value: audit.webUrl, href: audit.webUrl },
    ],
    messageLabel: "What to Improve",
    message: audit.improve?.trim() || "No specific notes provided.",
    replyName: audit.name,
    replyEmail: audit.email,
    submittedAt: audit.createdAt || new Date(),
    cmsPath: "/submissions/audits",
  });
}
