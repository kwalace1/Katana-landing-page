import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";

const persistDir = process.env.VERCEL ? "/tmp" : process.cwd();
const WAITLIST_FILE = path.join(persistDir, "waitlist-signups.json");
const CONTACT_FILE = path.join(persistDir, "contact-inquiries.json");

function readJsonFile(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  } catch (error) {
    console.error("Could not persist inquiry file:", error.message);
  }
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getMailer() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number.parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

export async function notifyByEmail({ subject, text, html }) {
  const notifyEmail = process.env.WAITLIST_NOTIFY_EMAIL;
  const transporter = getMailer();
  if (!notifyEmail || !transporter) return false;

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  await transporter.sendMail({ from, to: notifyEmail, subject, text, html });
  return true;
}

export async function submitWaitlist(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    return { status: 400, body: { error: "Please enter a valid email address." } };
  }

  const signups = readJsonFile(WAITLIST_FILE, []);
  if (signups.find((entry) => entry.email === email)) {
    return {
      status: 200,
      body: {
        ok: true,
        duplicate: true,
        message: "You're already on the list. We'll be in touch.",
      },
    };
  }

  signups.push({ email, createdAt: new Date().toISOString() });
  writeJsonFile(WAITLIST_FILE, signups);

  const when = new Date().toLocaleString("en-US", { timeZoneName: "short" });
  let emailSent = false;
  try {
    emailSent = await notifyByEmail({
      subject: `New Katana waitlist signup: ${email}`,
      text: `New Katana waitlist signup\n\nEmail: ${email}\nTime: ${when}\n`,
      html: `<h2>New Katana waitlist signup</h2><p><strong>Email:</strong> ${email}</p><p><strong>Time:</strong> ${when}</p>`,
    });
  } catch (error) {
    console.error("Waitlist notification email failed:", error.message);
  }

  return {
    status: 200,
    body: {
      ok: true,
      message: "You're on the list. We'll be in touch soon.",
      emailSent,
    },
  };
}

export async function submitContact(payload) {
  const name = String(payload.name || "").trim().slice(0, 200);
  const email = String(payload.email || "").trim().toLowerCase();
  const company = String(payload.company || "").trim().slice(0, 200);
  const product = String(payload.product || "").trim().slice(0, 80);
  const message = String(payload.message || "").trim().slice(0, 4000);
  const waitlist = Boolean(payload.waitlist);

  if (!name || !isValidEmail(email) || !message) {
    return {
      status: 400,
      body: { error: "Please include your name, a valid email, and a message." },
    };
  }

  const inquiries = readJsonFile(CONTACT_FILE, []);
  inquiries.push({
    name,
    email,
    company,
    product,
    message,
    waitlist,
    createdAt: new Date().toISOString(),
  });
  writeJsonFile(CONTACT_FILE, inquiries);

  if (waitlist) {
    const signups = readJsonFile(WAITLIST_FILE, []);
    if (!signups.find((entry) => entry.email === email)) {
      signups.push({ email, source: "contact", createdAt: new Date().toISOString() });
      writeJsonFile(WAITLIST_FILE, signups);
    }
  }

  const when = new Date().toLocaleString("en-US", { timeZoneName: "short" });
  let emailSent = false;
  try {
    emailSent = await notifyByEmail({
      subject: `New Katana inquiry from ${name}`,
      text: `New Katana inquiry\n\nName: ${name}\nEmail: ${email}\nCompany: ${company || "—"}\nProduct: ${product || "—"}\nWaitlist: ${waitlist ? "yes" : "no"}\nTime: ${when}\n\n${message}\n`,
      html: `
        <h2>New Katana inquiry</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Company:</strong> ${escapeHtml(company || "—")}</p>
        <p><strong>Product:</strong> ${escapeHtml(product || "—")}</p>
        <p><strong>Waitlist:</strong> ${waitlist ? "yes" : "no"}</p>
        <p><strong>Time:</strong> ${when}</p>
        <p>${escapeHtml(message).replaceAll("\n", "<br>")}</p>
      `,
    });
  } catch (error) {
    console.error("Contact notification email failed:", error.message);
  }

  return {
    status: 200,
    body: {
      ok: true,
      message: "Thanks — we'll be in touch shortly.",
      emailSent,
    },
  };
}
