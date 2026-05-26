import crypto from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number.parseInt(process.env.PORT || "4173", 10);
const dbPath = path.join(root, "data", "mock-book-orders.json");

const books = {
  "niveau-1": {
    id: "niveau-1",
    title: "Arabische letters boekje niveau 1",
    priceCents: 500,
    pdfPath: "pdf/mijn-arabische-letters-boekje.pdf",
    fileName: "arabische-letters-boekje-niveau-1.pdf",
  },
  "niveau-2": {
    id: "niveau-2",
    title: "Arabische letters boekje niveau 2",
    priceCents: 500,
    pdfPath: "pdf/Arabic_Kids_Academy_28_niveau2.pdf",
    fileName: "arabische-letters-boekje-niveau-2.pdf",
  },
};

const protectedPdfPaths = new Set(Object.values(books).map((book) => `/${book.pdfPath}`));

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

const readOrders = async () => {
  try {
    const data = JSON.parse(await fs.readFile(dbPath, "utf8"));
    return Array.isArray(data.orders) ? data.orders : [];
  } catch {
    return [];
  }
};

const writeOrders = async (orders) => {
  await fs.writeFile(dbPath, `${JSON.stringify({ orders }, null, 2)}\n`, "utf8");
};

const sendJson = (response, status, data) => {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(data));
};

const sendText = (response, status, message) => {
  response.writeHead(status, {
    "content-type": "text/plain; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(message);
};

const readJsonBody = async (request) => {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const serializeOrder = (order) => ({
  id: order.id,
  bookId: order.bookId,
  email: order.email,
  status: order.status,
  downloadUsed: Boolean(order.downloadUsed),
  token: order.token,
  paidAt: order.paidAt,
  downloadedAt: order.downloadedAt || null,
});

const getLatestOrdersByBook = (orders, email) => {
  const result = {};

  orders
    .filter((order) => order.email === email)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .forEach((order) => {
      if (!result[order.bookId]) {
        result[order.bookId] = serializeOrder(order);
      }
    });

  return result;
};

const handleApi = async (request, response, url) => {
  if (request.method === "GET" && url.pathname === "/api/book-orders") {
    const email = normalizeEmail(url.searchParams.get("email"));

    if (!email) {
      return sendJson(response, 400, { error: "email_required" });
    }

    const orders = await readOrders();
    return sendJson(response, 200, { orders: getLatestOrdersByBook(orders, email) });
  }

  if (request.method === "POST" && url.pathname === "/api/test-pay") {
    const body = await readJsonBody(request);
    const email = normalizeEmail(body.email);
    const book = books[body.bookId];

    if (!email || !email.includes("@")) {
      return sendJson(response, 400, { error: "valid_email_required" });
    }

    if (!book) {
      return sendJson(response, 404, { error: "book_not_found" });
    }

    const orders = await readOrders();
    const now = new Date().toISOString();
    const order = {
      id: crypto.randomUUID(),
      bookId: book.id,
      email,
      status: "paid",
      priceCents: book.priceCents,
      token: crypto.randomBytes(24).toString("hex"),
      downloadUsed: false,
      createdAt: now,
      paidAt: now,
      downloadedAt: null,
    };

    orders.push(order);
    await writeOrders(orders);
    return sendJson(response, 201, { order: serializeOrder(order) });
  }

  const downloadMatch = url.pathname.match(/^\/api\/download\/([a-f0-9]{48})$/);

  if (request.method === "GET" && downloadMatch) {
    const token = downloadMatch[1];
    const orders = await readOrders();
    const order = orders.find((item) => item.token === token);

    if (!order || order.status !== "paid") {
      return sendText(response, 403, "Deze download is niet beschikbaar.");
    }

    if (order.downloadUsed) {
      return sendText(response, 410, "Deze downloadlink is al gebruikt.");
    }

    const book = books[order.bookId];

    if (!book) {
      return sendText(response, 404, "Boek niet gevonden.");
    }

    const absolutePdfPath = path.join(root, book.pdfPath);
    let pdf;

    try {
      pdf = await fs.readFile(absolutePdfPath);
    } catch {
      return sendText(response, 404, "PDF niet gevonden.");
    }

    order.downloadUsed = true;
    order.downloadedAt = new Date().toISOString();
    await writeOrders(orders);

    response.writeHead(200, {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${book.fileName}"`,
      "cache-control": "no-store",
      "content-length": pdf.length,
    });
    response.end(pdf);
    return;
  }

  sendJson(response, 404, { error: "api_not_found" });
};

const serveStatic = async (request, response, url) => {
  if (protectedPdfPaths.has(url.pathname)) {
    return sendText(response, 403, "Betaalde boeken zijn alleen beschikbaar via een geldige downloadlink.");
  }

  const requestedPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const absolutePath = path.normalize(path.join(root, requestedPath));

  if (!absolutePath.startsWith(root)) {
    return sendText(response, 403, "Verboden pad.");
  }

  try {
    const file = await fs.readFile(absolutePath);
    const extension = path.extname(absolutePath).toLowerCase();
    response.writeHead(200, {
      "content-type": mimeTypes[extension] || "application/octet-stream",
    });
    response.end(file);
  } catch {
    sendText(response, 404, "Niet gevonden.");
  }
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || `127.0.0.1:${port}`}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }

    await serveStatic(request, response, url);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: "server_error" });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Mock payment server running at http://127.0.0.1:${port}`);
});
