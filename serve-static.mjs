import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 8080;

const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".txt": "text/plain",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

const server = http.createServer((req, res) => {
  let p = req.url.split("?")[0];
  if (p === "/") p = "/index.html";
  const fp = path.join(__dirname, path.normalize(p).replace(/^(\.\.(\/|\\|$))+/, ""));
  if (!fp.startsWith(__dirname)) {
    res.writeHead(403);
    res.end();
    return;
  }
  fs.stat(fp, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(fp);
    let contentType = mime[ext] || "application/octet-stream";
    if (path.basename(fp) === "katana html.txt") contentType = "text/html";

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
      fs.createReadStream(fp, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": stats.size,
      "Accept-Ranges": "bytes",
    });
    fs.createReadStream(fp).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Serving at http://localhost:${PORT}/`);
});
