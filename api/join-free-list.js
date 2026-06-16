import { Resend } from "resend";

const FIELD_LIMITS = {
  email: 200,
  phone: 50,
  favoritePlatform: 80,
  source: 100,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, {
      success: false,
      message: "Method not allowed. Please submit the form with POST.",
    });
  }

  let body;

  try {
    body = await readJsonBody(req);
  } catch (error) {
    return sendJson(res, 400, {
      success: false,
      message: "Please enter a valid email.",
    });
  }

  if (typeof body?.companyWebsite === "string" && body.companyWebsite.trim()) {
    return sendJson(res, 200, {
      success: true,
      message: "You're on The Free List.",
    });
  }

  const validation = validatePayload(body);

  if (!validation.valid) {
    return sendJson(res, 400, {
      success: false,
      message: "Please enter a valid email.",
    });
  }

  const { fields } = validation;
  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  if (!resendApiKey || !toEmail || !fromEmail) {
    console.error("Free List email configuration is incomplete.", {
      hasResendApiKey: Boolean(resendApiKey),
      hasContactToEmail: Boolean(toEmail),
      hasContactFromEmail: Boolean(fromEmail),
    });

    return sendJson(res, 500, {
      success: false,
      message: "Could not join The Free List. Please try again.",
    });
  }

  const submittedAt = new Date().toISOString();
  const emailPayload = {
    from: fromEmail,
    to: toEmail,
    replyTo: fields.email,
    subject: "New DFB Sound Free List Signup",
    html: buildHtmlEmail(fields, submittedAt),
    text: buildTextEmail(fields, submittedAt),
  };

  try {
    const { data, error } = await new Resend(resendApiKey).emails.send(emailPayload);

    if (error) {
      console.error("Resend rejected Free List email.", {
        message: error.message,
        email: fields.email,
      });

      return sendJson(res, 500, {
        success: false,
        message: "Could not join The Free List. Please try again.",
      });
    }

    console.info("Free List email accepted by Resend.", {
      id: data?.id,
      email: fields.email,
    });

    return sendJson(res, 200, {
      success: true,
      message: "You're on The Free List.",
    });
  } catch (error) {
    console.error("Free List email send failed.", {
      message: error?.message,
      email: fields.email,
    });

    return sendJson(res, 500, {
      success: false,
      message: "Could not join The Free List. Please try again.",
    });
  }
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }

  const rawBody = await readRequestStream(req);
  return rawBody ? JSON.parse(rawBody) : {};
}

function readRequestStream(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;

      if (body.length > 10_000) {
        req.destroy();
        reject(new Error("Request body is too large."));
      }
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function validatePayload(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { valid: false };
  }

  const fields = {};

  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    const value = body[field];

    if (value == null) {
      fields[field] = "";
      continue;
    }

    if (typeof value !== "string" || value.length > limit) {
      return { valid: false };
    }

    fields[field] = value.trim();
  }

  if (!fields.email || !EMAIL_PATTERN.test(fields.email)) {
    return { valid: false };
  }

  return {
    valid: true,
    fields: {
      ...fields,
      source: fields.source || "DFB Sound Page",
    },
  };
}

function buildHtmlEmail(fields, submittedAt) {
  const rows = [
    ["Email", fields.email],
    ["Phone", fields.phone || "Not provided"],
    ["Favorite platform", fields.favoritePlatform || "Not provided"],
    ["Source", fields.source || "DFB Sound Page"],
    ["Submitted timestamp", submittedAt],
    ["Source", "DFB Sound Page"],
  ];

  const tableRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <th style="width: 190px; padding: 12px; border-bottom: 1px solid #d9e2ec; color: #243b53; font: 700 14px Arial, sans-serif; text-align: left; vertical-align: top;">${escapeHtml(label)}</th>
          <td style="padding: 12px; border-bottom: 1px solid #d9e2ec; color: #102a43; font: 400 14px/1.6 Arial, sans-serif; white-space: pre-wrap;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  return `
    <!doctype html>
    <html lang="en">
      <body style="margin: 0; padding: 24px; background: #f7fafc;">
        <main style="max-width: 760px; margin: 0 auto; border: 1px solid #d9e2ec; background: #ffffff;">
          <header style="padding: 20px 24px; background: #04070d;">
            <h1 style="margin: 0; color: #ffffff; font: 700 20px Arial, sans-serif;">New DFB Sound Free List Signup</h1>
          </header>
          <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse;">
            ${tableRows}
          </table>
        </main>
      </body>
    </html>`;
}

function buildTextEmail(fields, submittedAt) {
  return [
    "New DFB Sound Free List Signup",
    "",
    `Email: ${fields.email}`,
    `Phone: ${fields.phone || "Not provided"}`,
    `Favorite platform: ${fields.favoritePlatform || "Not provided"}`,
    `Source: ${fields.source || "DFB Sound Page"}`,
    `Submitted timestamp: ${submittedAt}`,
    "Source: DFB Sound Page",
  ].join("\n");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload);
}
