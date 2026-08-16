import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number.parseInt(process.env.PORT || "8080", 10);
const WAITLIST_FILE = path.join(__dirname, "waitlist-signups.json");

const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".txt": "text/plain",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function readJsonFile(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 10_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function jsonResponse(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
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

async function notifyByEmail(email) {
  const notifyEmail = process.env.WAITLIST_NOTIFY_EMAIL;
  const transporter = getMailer();
  if (!notifyEmail || !transporter) {
    return false;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const when = new Date().toLocaleString("en-US", { timeZoneName: "short" });

  await transporter.sendMail({
    from,
    to: notifyEmail,
    subject: `New Katana waitlist signup: ${email}`,
    text: `New Katana waitlist signup\n\nEmail: ${email}\nTime: ${when}\n`,
    html: `
      <h2>New Katana waitlist signup</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Time:</strong> ${when}</p>
    `,
  });

  return true;
}

async function handleWaitlistSignup(req, res) {
  let body = "";
  try {
    body = await readRequestBody(req);
  } catch {
    jsonResponse(res, 413, { error: "Request too large." });
    return;
  }

  let payload;
  try {
    payload = JSON.parse(body || "{}");
  } catch {
    jsonResponse(res, 400, { error: "Invalid request." });
    return;
  }

  const email = String(payload.email || "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    jsonResponse(res, 400, { error: "Please enter a valid email address." });
    return;
  }

  const signups = readJsonFile(WAITLIST_FILE, []);
  const existing = signups.find((entry) => entry.email === email);
  if (existing) {
    jsonResponse(res, 200, {
      ok: true,
      duplicate: true,
      message: "You're already on the list. We'll be in touch.",
    });
    return;
  }

  const entry = {
    email,
    createdAt: new Date().toISOString(),
  };
  signups.push(entry);
  writeJsonFile(WAITLIST_FILE, signups);

  let emailSent = false;
  try {
    emailSent = await notifyByEmail(email);
  } catch (error) {
    console.error("Waitlist notification email failed:", error.message);
  }

  console.log(`Waitlist signup: ${email}${emailSent ? " (email sent)" : " (saved locally)"}`);

  jsonResponse(res, 200, {
    ok: true,
    message: "You're on the list. We'll be in touch soon.",
    emailSent,
  });
}

function serveStaticFile(req, res, filePath) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath);
    let contentType = mime[ext] || "application/octet-stream";
    if (path.basename(filePath) === "katana html.txt") contentType = "text/html";

    const range = req.headers.range;
    if (range) {
      const match = /bytes=(\d*)-(\d*)/.exec(range);
      if (!match) {
        res.writeHead(416, { "Content-Range": `bytes */${stats.size}` });
        res.end();
        return;
      }

      const start = match[1] ? Number.parseInt(match[1], 10) : 0;
      const end = match[2] ? Number.parseInt(match[2], 10) : stats.size - 1;

      if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || end >= stats.size) {
        res.writeHead(416, { "Content-Range": `bytes */${stats.size}` });
        res.end();
        return;
      }

      res.writeHead(206, {
        "Content-Type": contentType,
        "Content-Length": end - start + 1,
        "Content-Range": `bytes ${start}-${end}/${stats.size}`,
        "Accept-Ranges": "bytes",
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": stats.size,
      "Accept-Ranges": "bytes",
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

loadEnv();

const server = http.createServer((req, res) => {
  const urlPath = req.url?.split("?")[0] || "/";

  if (req.method === "POST" && urlPath === "/api/waitlist") {
    handleWaitlistSignup(req, res).catch((error) => {
      console.error("Waitlist handler failed:", error);
      jsonResponse(res, 500, { error: "Something went wrong. Please try again." });
    });
    return;
  }

  let staticPath = urlPath;
  if (staticPath === "/") staticPath = "/index.html";

  const filePath = path.join(
    __dirname,
    path.normalize(staticPath).replace(/^(\.\.(\/|\\|$))+/, "")
  );

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end();
    return;
  }

  serveStaticFile(req, res, filePath);
});

server.listen(PORT, "0.0.0.0", () => {
  const urls = [`http://localhost:${PORT}/`];
  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family === "IPv4" && !address.internal) {
        urls.push(`http://${address.address}:${PORT}/`);
      }
    }
  }

  console.log("Serving on the network:");
  for (const url of urls) console.log(`  ${url}`);

  if (process.env.WAITLIST_NOTIFY_EMAIL && getMailer()) {
    console.log(`Waitlist notifications -> ${process.env.WAITLIST_NOTIFY_EMAIL}`);
  } else {
    console.log("Waitlist signups save to waitlist-signups.json");
    console.log("Copy .env.example to .env to also email signups.");
  }
});
