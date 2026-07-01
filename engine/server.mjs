import express from "express";
import cors from "cors";
import multer from "multer";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { createWopiRouter } from "./wopi.mjs";
import { syncToSupabase } from "./supabase.mjs";
import { getPublicBase, apiUrl, contentDisposition, fixFilename } from "./public-url.mjs";
import {
  uploadToStorage, downloadFromStorage, storageKey,
} from "./storage-backend.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CACHE = path.join(ROOT, ".loffice-cache");
const UPLOADS = path.join(CACHE, "uploads");
const OUTPUTS = path.join(CACHE, "outputs");

const PORT = Number(process.env.PORT || process.env.LOFFICE_ENGINE_PORT || 9982);
const WOPI_HOST = process.env.WOPI_HOST || `http://host.docker.internal:${PORT}`;
const COLLABORA_URL = process.env.COLLABORA_URL || "http://localhost:9980";
const LO_PATH =
  process.env.LIBREOFFICE_PATH ||
  (process.platform === "win32"
    ? "C:\\Program Files\\LibreOffice\\program\\soffice.exe"
    : "soffice");

const MIME = {
  ".odt": "application/vnd.oasis.opendocument.text",
  ".ods": "application/vnd.oasis.opendocument.spreadsheet",
  ".odp": "application/vnd.oasis.opendocument.presentation",
  ".odg": "application/vnd.oasis.opendocument.graphics",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".rtf": "application/rtf",
  ".txt": "text/plain",
  ".csv": "text/csv",
  ".html": "text/html",
  ".htm": "text/html",
  ".pdf": "application/pdf",
  ".epub": "application/epub+zip",
  ".xml": "application/xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".md": "text/markdown",
  ".json": "application/json",
  ".zip": "application/zip",
  ".7z": "application/x-7z-compressed",
  ".hwp": "application/x-hwp",
  ".hwpx": "application/hwp+zip",
};

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".ico", ".svg"]);
const TEXT_EXT = new Set([
  ".txt", ".csv", ".md", ".json", ".xml", ".log", ".js", ".ts", ".tsx", ".jsx",
  ".py", ".java", ".c", ".cpp", ".h", ".css", ".scss", ".yaml", ".yml", ".ini", ".bat", ".sh", ".rtf",
]);
const HTML_EXT = new Set([".html", ".htm"]);

function detectPreviewType(ext) {
  if (ext === ".pdf") return "pdf";
  if (IMAGE_EXT.has(ext)) return "image";
  if (TEXT_EXT.has(ext)) return "text";
  if (HTML_EXT.has(ext)) return "html";
  return "pdf";
}

const EDITABLE = new Set([
  ".odt", ".ods", ".odp", ".odg",
  ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".rtf", ".txt", ".csv",
]);

function getMime(ext) {
  return MIME[ext] || "application/octet-stream";
}

const SUPPORTED = new Set(Object.keys(MIME));

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS,
    filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
});

const FRONTEND_URL = process.env.FRONTEND_URL || "https://loffice-sigma.vercel.app";

const app = express();
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    const allowed = [FRONTEND_URL, "http://localhost:3001", "http://localhost:3000"];
    if (allowed.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
}));
app.use("/wopi", createWopiRouter(OUTPUTS));

async function loadMeta(docId) {
  const metaPath = path.join(OUTPUTS, docId, "meta.json");
  return JSON.parse(await fs.readFile(metaPath, "utf-8"));
}

async function ensureLocalFile(docId, fileName, storageName) {
  const localPath = path.join(OUTPUTS, docId, fileName);
  try {
    await fs.access(localPath);
    return localPath;
  } catch {
    const ok = await downloadFromStorage(storageKey(docId, storageName), localPath);
    if (ok) return localPath;
    throw new Error("파일 없음");
  }
}

async function ensureDirs() {
  await fs.mkdir(UPLOADS, { recursive: true });
  await fs.mkdir(OUTPUTS, { recursive: true });
}

function runLibreOffice(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(LO_PATH, args, {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    proc.stderr.on("data", (d) => { stderr += d.toString(); });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`LibreOffice exited ${code}: ${stderr}`));
    });
    proc.on("error", reject);
  });
}

async function convertToPdf(inputPath, outDir) {
  await runLibreOffice([
    "--headless", "--invisible", "--nologo", "--nofirststartwizard",
    "--convert-to", "pdf", "--outdir", outDir, inputPath,
  ]);
  const base = path.basename(inputPath, path.extname(inputPath));
  const expected = path.join(outDir, `${base}.pdf`);
  try {
    await fs.access(expected);
    return expected;
  } catch {
    const pdf = (await fs.readdir(outDir)).find((f) => f.endsWith(".pdf"));
    if (pdf) return path.join(outDir, pdf);
    throw new Error("PDF output not found after conversion");
  }
}

async function checkLibreOffice() {
  try {
    if (process.platform === "win32") {
      await fs.access(LO_PATH);
      return LO_PATH;
    }
    await new Promise((resolve, reject) => {
      const p = spawn(LO_PATH, ["--version"]);
      p.on("close", (code) => (code === 0 ? resolve() : reject()));
      p.on("error", reject);
    });
    return LO_PATH;
  } catch {
    return null;
  }
}
async function checkCollabora() {
  try {
    const res = await fetch(`${COLLABORA_URL}/hosting/discovery`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

function buildEditorUrl(docId) {
  const wopiSrc = encodeURIComponent(`${WOPI_HOST}/wopi/files/${docId}`);
  return `${COLLABORA_URL}/browser/dist/cool.html?WOPISrc=${wopiSrc}&lang=ko`;
}

app.get("/health", async (_req, res) => {
  const loPath = await checkLibreOffice();
  const collabora = await checkCollabora();
  res.json({
    status: "ok",
    engine: "loffice-libreoffice",
    libreOffice: loPath,
    collabora,
    collaboraUrl: COLLABORA_URL,
    wopiHost: WOPI_HOST,
    version: "1.2.0",
    locale: process.env.LANG || "ko_KR.UTF-8",
  });
});

/** Render cold start 예열 — LibreOffice 프로세스 워밍 */
app.get("/api/warmup", async (_req, res) => {
  try {
    await runLibreOffice(["--headless", "--version"]);
    res.json({ ok: true, warmed: true });
  } catch (e) {
    res.status(503).json({ ok: false, error: e.message });
  }
});

app.get("/api/formats", (_req, res) => {
  res.json({ formats: [...SUPPORTED].sort(), editable: [...EDITABLE].sort() });
});

app.post("/api/convert", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "파일이 없습니다." });

    const originalName = fixFilename(req.body?.filename || req.file.originalname);
    const ext = path.extname(originalName).toLowerCase() || ".bin";
    const previewType = detectPreviewType(ext);

    const docId = uuidv4();
    const outDir = path.join(OUTPUTS, docId);
    await fs.mkdir(outDir, { recursive: true });

    const storedName = `original${ext}`;
    const storedPath = path.join(outDir, storedName);
    await fs.copyFile(req.file.path, storedPath);

    let hasPdf = false;
    if (previewType === "pdf" && ext !== ".pdf") {
      try {
        const pdfPath = await convertToPdf(storedPath, outDir);
        await fs.rename(pdfPath, path.join(outDir, "document.pdf"));
        hasPdf = true;
      } catch (e) {
        console.warn("PDF preview failed:", e.message);
      }
    } else if (ext === ".pdf") {
      await fs.copyFile(storedPath, path.join(outDir, "document.pdf"));
      hasPdf = true;
    }

    await uploadToStorage(storageKey(docId, storedName), storedPath, getMime(ext));
    if (hasPdf) {
      await uploadToStorage(storageKey(docId, "document.pdf"), path.join(outDir, "document.pdf"), "application/pdf");
    }

    const editable = EDITABLE.has(ext);
    const meta = {
      id: docId,
      name: originalName,
      ext,
      storedName,
      mime: getMime(ext),
      size: req.file.size,
      version: "1",
      editable,
      previewType: hasPdf ? "pdf" : previewType,
      hasPdf,
      createdAt: new Date().toISOString(),
      engine: "libreoffice",
    };
    await fs.writeFile(path.join(outDir, "meta.json"), JSON.stringify(meta, null, 2));
    await syncToSupabase(meta);

    const collabora = await checkCollabora();
    const docBase = `/api/documents/${docId}`;
    res.json({
      ...meta,
      pdfUrl: hasPdf ? apiUrl(req, `${docBase}/pdf`) : null,
      previewUrl: apiUrl(req, `${docBase}/preview`),
      rawUrl: apiUrl(req, `${docBase}/raw`),
      editorUrl: editable && collabora ? buildEditorUrl(docId) : null,
      collabora,
    });
  } catch (err) {
    console.error("Convert error:", err);
    res.status(500).json({ error: err.message || "변환 실패" });
  }
});

app.get("/api/documents/:id/editor-url", async (req, res) => {
  try {
    const metaPath = path.join(OUTPUTS, req.params.id, "meta.json");
    const meta = JSON.parse(await fs.readFile(metaPath, "utf-8"));
    const collabora = await checkCollabora();
    if (!meta.editable) return res.status(400).json({ error: "편집 불가 형식" });
    if (!collabora) return res.status(503).json({ error: "Collabora 엔진이 실행되지 않았습니다. docker compose up -d" });
    res.json({ editorUrl: buildEditorUrl(req.params.id), collabora: true });
  } catch {
    res.status(404).json({ error: "문서 없음" });
  }
});

app.get("/api/documents/:id/raw", async (req, res) => {
  try {
    const meta = await loadMeta(req.params.id);
    const filePath = await ensureLocalFile(req.params.id, meta.storedName, meta.storedName);
    res.setHeader("Content-Type", meta.mime || "application/octet-stream");
    res.setHeader("Content-Disposition", contentDisposition(meta.name, true));
    res.setHeader("Access-Control-Allow-Origin", FRONTEND_URL);
    res.send(await fs.readFile(filePath));
  } catch {
    res.status(404).json({ error: "파일 없음" });
  }
});

app.get("/api/documents/:id/preview", async (req, res) => {
  try {
    const meta = await loadMeta(req.params.id);
    const type = meta.previewType || detectPreviewType(meta.ext);
    const docBase = `/api/documents/${req.params.id}`;
    const result = {
      type,
      fileName: fixFilename(meta.name),
      fileSize: meta.size,
      ext: meta.ext,
      url: apiUrl(req, `${docBase}/raw`),
    };
    if (type === "pdf" || meta.hasPdf) {
      try {
        await ensureLocalFile(req.params.id, "document.pdf", "document.pdf");
        result.type = "pdf";
        result.url = apiUrl(req, `${docBase}/pdf`);
      } catch {
        result.type = "info";
        result.message = "PDF 변환에 실패했습니다. 원본 파일 정보를 표시합니다.";
      }
    }
    if (type === "text" || type === "html") {
      const filePath = await ensureLocalFile(req.params.id, meta.storedName, meta.storedName);
      result.content = await fs.readFile(filePath, "utf-8");
    }
    res.json(result);
  } catch {
    res.status(404).json({ error: "미리보기 없음" });
  }
});

app.get("/api/documents/:id/pdf", async (req, res) => {
  try {
    const pdfPath = await ensureLocalFile(req.params.id, "document.pdf", "document.pdf");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", contentDisposition("document.pdf", true));
    res.setHeader("Access-Control-Allow-Origin", FRONTEND_URL);
    res.send(await fs.readFile(pdfPath));
  } catch {
    res.status(404).json({ error: "문서를 찾을 수 없습니다." });
  }
});

app.get("/api/documents/:id/meta", async (req, res) => {
  const metaPath = path.join(OUTPUTS, req.params.id, "meta.json");
  try {
    res.json(JSON.parse(await fs.readFile(metaPath, "utf-8")));
  } catch {
    res.status(404).json({ error: "메타데이터 없음" });
  }
});

app.delete("/api/documents/:id", async (req, res) => {
  try {
    await fs.rm(path.join(OUTPUTS, req.params.id), { recursive: true, force: true });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "문서 없음" });
  }
});

ensureDirs().then(() => {
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n  Loffice Engine  → http://localhost:${PORT}`);
    console.log(`  WOPI Host       → ${WOPI_HOST}`);
    console.log(`  Collabora       → ${COLLABORA_URL}`);
    console.log(`  LibreOffice     → ${LO_PATH}\n`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`\n  Loffice Engine already running on port ${PORT}\n`);
      process.exit(0);
    }
    throw err;
  });
});
