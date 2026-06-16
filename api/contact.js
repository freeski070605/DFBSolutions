import { Resend } from "resend";

const FIELD_LIMITS = {
  name: 120,
  email: 200,
  need: 300,
  projectType: 100,
  budget: 100,
  timeline: 100,
  message: 3000,
};

const REQUIRED_FIELDS = ["name", "email", "projectType", "message"];
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
      message: "Invalid JSON payload.",
    });
  }

  if (typeof body?.companyWebsite === "string" && body.companyWebsite.trim()) {
    return sendJson(res, 200, {
      success: true,
      message: "Project request sent successfully.",
    });
  }

  const validation = validatePayload(body);

  if (!validation.valid) {
    return sendJson(res, 400, {
      success: false,
      message: validation.message,
    });
  }

  const { fields } = validation;
  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  if (!resendApiKey || !toEmail || !fromEmail) {
    console.error("Contact form email configuration is incomplete.", {
      hasResendApiKey: Boolean(resendApiKey),
      hasContactToEmail: Boolean(toEmail),
      hasContactFromEmail: Boolean(fromEmail),
    });

    return sendJson(res, 500, {
      success: false,
      message: "Email service is not configured. Please try again later.",
    });
  }

  const submittedAt = new Date().toISOString();
  const subject = `New DFB Solutions Project Request: ${fields.projectType}`;
  const emailPayload = {
    from: fromEmail,
    to: toEmail,
    replyTo: fields.email,
    subject,
    html: buildHtmlEmail(fields, submittedAt),
    text: buildTextEmail(fields, submittedAt),
  };

  try {
    const { data, error } = await new Resend(resendApiKey).emails.send(emailPayload);

    if (error) {
      console.error("Resend rejected contact email.", {
        message: error.message,
        name: fields.name,
        email: fields.email,
        projectType: fields.projectType,
      });

      return sendJson(res, 500, {
        success: false,
        message: "Email could not be sent. Please try again later.",
      });
    }

    console.info("Contact form email accepted by Resend.", {
      id: data?.id,
      projectType: fields.projectType,
    });

    return sendJson(res, 200, {
      success: true,
      message: "Project request sent successfully.",
    });
  } catch (error) {
    console.error("Contact form email send failed.", {
      message: error?.message,
      name: fields.name,
      email: fields.email,
      projectType: fields.projectType,
    });

    return sendJson(res, 500, {
      success: false,
      message: "Email could not be sent. Please try again later.",
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

      if (body.length > 20_000) {
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
    return {
      valid: false,
      message: "Please submit the project request form.",
    };
  }

  const fields = {};

  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    const value = body[field];

    if (value == null) {
      fields[field] = "";
      continue;
    }

    if (typeof value !== "string") {
      return {
        valid: false,
        message: `${formatFieldName(field)} must be text.`,
      };
    }

    if (value.length > limit) {
      return {
        valid: false,
        message: `${formatFieldName(field)} must be ${limit} characters or fewer.`,
      };
    }

    fields[field] = value.trim();
  }

  const hasAnySubmissionContent = Object.values(fields).some(Boolean);

  if (!hasAnySubmissionContent) {
    return {
      valid: false,
      message: "Please complete the form before submitting.",
    };
  }

  for (const field of REQUIRED_FIELDS) {
    if (!fields[field]) {
      return {
        valid: false,
        message: `${formatFieldName(field)} is required.`,
      };
    }
  }

  if (!EMAIL_PATTERN.test(fields.email)) {
    return {
      valid: false,
      message: "Please enter a valid email address.",
    };
  }

  return {
    valid: true,
    fields,
  };
}

function buildHtmlEmail(fields, submittedAt) {
  const rows = [
    ["Name", fields.name],
    ["Email", fields.email],
    ["What they need", fields.need || "Not provided"],
    ["Project type", fields.projectType],
    ["Budget", fields.budget || "Not provided"],
    ["Timeline", fields.timeline || "Not provided"],
    ["Message", fields.message],
    ["Submitted timestamp", submittedAt],
    ["Source", "DFB Solutions Website"],
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
            <h1 style="margin: 0; color: #ffffff; font: 700 20px Arial, sans-serif;">New DFB Solutions Project Request</h1>
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
    "New DFB Solutions Project Request",
    "",
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    `What they need: ${fields.need || "Not provided"}`,
    `Project type: ${fields.projectType}`,
    `Budget: ${fields.budget || "Not provided"}`,
    `Timeline: ${fields.timeline || "Not provided"}`,
    `Message: ${fields.message}`,
    `Submitted timestamp: ${submittedAt}`,
    "Source: DFB Solutions Website",
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

function formatFieldName(field) {
  const labels = {
    projectType: "Project type",
  };

  return labels[field] || `${field.charAt(0).toUpperCase()}${field.slice(1)}`;
}

function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload);
}
