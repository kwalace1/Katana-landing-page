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

export async function notifyByEmail({ subject, text, html, replyTo }) {
  const notifyEmail = process.env.WAITLIST_NOTIFY_EMAIL;
  const transporter = getMailer();
  if (!notifyEmail || !transporter) return false;

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  await transporter.sendMail({
    from,
    to: notifyEmail,
    replyTo: replyTo || undefined,
    subject,
    text,
    html,
  });
  return true;
}

function isSpamHoneypot(payload) {
  return Boolean(String(payload.website || "").trim());
}

export async function submitWaitlist(payload) {
  if (isSpamHoneypot(payload)) {
    return {
      status: 200,
      body: { ok: true, message: "You're on the list. We'll be in touch soon." },
    };
  }

  const email = String(payload.email || "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    return { status: 400, body: { error: "Please enter a valid email address." } };
  }

  const productLabels = {
    business: "Katana Business",
    personal: "Katana Personal",
    veyah: "Katana Switch",
  };
  const product = productLabels[payload.product] ? payload.product : "business";
  const productLabel = productLabels[product];
  const isDemo = product === "veyah";
  const successMessage = isDemo
    ? "Thanks — we'll reach out to book a demo."
    : "You're on the list. We'll be in touch soon.";
  const duplicateMessage = isDemo
    ? "You're already on the demo list. We'll be in touch."
    : "You're already on the list. We'll be in touch.";

  const signups = readJsonFile(WAITLIST_FILE, []);
  if (signups.find((entry) => entry.email === email && (entry.product || "business") === product)) {
    return {
      status: 200,
      body: {
        ok: true,
        duplicate: true,
        message: duplicateMessage,
      },
    };
  }

  signups.push({ email, product, createdAt: new Date().toISOString() });
  writeJsonFile(WAITLIST_FILE, signups);

  const when = new Date().toLocaleString("en-US", { timeZoneName: "short" });
  let emailSent = false;
  try {
    emailSent = await notifyByEmail({
      subject: `New ${productLabel} ${isDemo ? "demo request" : "waitlist signup"}: ${email}`,
      replyTo: email,
      text: `New ${productLabel} ${isDemo ? "demo request" : "waitlist signup"}\n\nEmail: ${email}\nProduct: ${productLabel}\nTime: ${when}\n`,
      html: `<h2>New ${escapeHtml(productLabel)} ${isDemo ? "demo request" : "waitlist signup"}</h2><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Product:</strong> ${escapeHtml(productLabel)}</p><p><strong>Time:</strong> ${when}</p>`,
    });
  } catch (error) {
    console.error("Waitlist notification email failed:", error.message);
  }

  return {
    status: 200,
    body: {
      ok: true,
      message: successMessage,
      emailSent,
    },
  };
}

export async function submitContact(payload) {
  if (isSpamHoneypot(payload)) {
    return {
      status: 200,
      body: { ok: true, message: "Thanks — we'll be in touch shortly." },
    };
  }

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
      replyTo: email,
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
