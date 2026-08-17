import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { submitContact, submitWaitlist } from "./lib/inquiries.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number.parseInt(process.env.PORT || "8080", 10);

const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
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

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 20_000) {
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

async function parseJsonBody(req, res) {
  let body = "";
  try {
    body = await readRequestBody(req);
  } catch {
    jsonResponse(res, 413, { error: "Request too large." });
    return null;
  }

  try {
    return JSON.parse(body || "{}");
  } catch {
    jsonResponse(res, 400, { error: "Invalid request." });
    return null;
  }
}

async function handleApi(req, res, submit) {
  const payload = await parseJsonBody(req, res);
  if (!payload) return;
  const result = await submit(payload);
  jsonResponse(res, result.status, result.body);
}

function resolveStaticFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0] || "/");
  const normalized = path.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, "");
  const relative = (normalized === path.sep ? "/" : normalized).replace(/\\/g, "/");
  const trimmed = relative.replace(/\/+$/, "").replace(/^\//, "");

  const candidates = [];
  if (relative === "/" || trimmed === "") {
    candidates.push(path.join(__dirname, "index.html"));
  } else {
    candidates.push(
      path.join(__dirname, trimmed),
      path.join(__dirname, `${trimmed}.html`),
      path.join(__dirname, trimmed, "index.html")
    );
  }

  for (const filePath of candidates) {
    if (!filePath.startsWith(__dirname)) continue;
    try {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) return filePath;
    } catch {
      // ignore
    }
  }
  return null;
}

function serveStaticFile(req, res, filePath) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      const notFound = path.join(__dirname, "404.html");
      if (fs.existsSync(notFound)) {
        fs.createReadStream(notFound).pipe(res);
        return;
      }
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath);
    const contentType = mime[ext] || "application/octet-stream";
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
      "Content-Type": `${contentType}${ext === ".html" || ext === ".css" || ext === ".js" || ext === ".svg" ? "; charset=utf-8" : ""}`,
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
    handleApi(req, res, submitWaitlist).catch((error) => {
      console.error("Waitlist handler failed:", error);
      jsonResponse(res, 500, { error: "Something went wrong. Please try again." });
    });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/contact") {
    handleApi(req, res, submitContact).catch((error) => {
      console.error("Contact handler failed:", error);
      jsonResponse(res, 500, { error: "Something went wrong. Please try again." });
    });
    return;
  }

  const filePath = resolveStaticFile(urlPath);
  if (!filePath) {
    const notFound = path.join(__dirname, "404.html");
    if (fs.existsSync(notFound)) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      fs.createReadStream(notFound).pipe(res);
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
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

  if (process.env.WAITLIST_NOTIFY_EMAIL && process.env.SMTP_HOST) {
    console.log(`Notifications -> ${process.env.WAITLIST_NOTIFY_EMAIL}`);
  } else {
    console.log("Inquiries save locally to JSON files.");
    console.log("Copy .env.example to .env to also email signups.");
  }
});
