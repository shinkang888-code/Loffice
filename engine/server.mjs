import express from "express";
import cors from "cors";
import multer from "multer";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { createWopiRouter } from "./wopi.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CACHE = path.join(ROOT, ".loffice-cache");
const UPLOADS = path.join(CACHE, "uploads");
const OUTPUTS = path.join(CACHE, "outputs");

const PORT = Number(process.env.LOFFICE_ENGINE_PORT || 9982);
const WOPI_HOST = process.env.WOPI_HOST || `http://host.docker.internal:${PORT}`;
const COLLABORA_URL = process.env.COLLABORA_URL || "http://localhost:9980";
const LO_PATH =
  process.env.LIBREOFFICE_PATH ||
  "C:\\Program Files\\LibreOffice\\program\\soffice.exe";

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
};

const EDITABLE = new Set([
  ".odt", ".ods", ".odp", ".odg",
  ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".rtf", ".txt", ".csv",
]);

const SUPPORTED = new Set(Object.keys(MIME));

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS,
    filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
});

const app = express();
app.use(cors());
app.use("/wopi", createWopiRouter(OUTPUTS));

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
  const loExists = await fs.access(LO_PATH).then(() => true).catch(() => false);
  const collabora = await checkCollabora();
  res.json({
    status: "ok",
    engine: "loffice-libreoffice",
    libreOffice: loExists ? LO_PATH : null,
    collabora,
    collaboraUrl: COLLABORA_URL,
    wopiHost: WOPI_HOST,
    version: "1.1.0",
  });
});

app.get("/api/formats", (_req, res) => {
  res.json({ formats: [...SUPPORTED].sort(), editable: [...EDITABLE].sort() });
});

app.post("/api/convert", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "파일이 없습니다." });

    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!SUPPORTED.has(ext)) {
      return res.status(400).json({ error: `지원하지 않는 형식: ${ext}` });
    }

    const docId = uuidv4();
    const outDir = path.join(OUTPUTS, docId);
    await fs.mkdir(outDir, { recursive: true });

    const storedName = `original${ext}`;
    await fs.copyFile(req.file.path, path.join(outDir, storedName));

    if (ext !== ".pdf") {
      try {
        const pdfPath = await convertToPdf(path.join(outDir, storedName), outDir);
        await fs.rename(pdfPath, path.join(outDir, "document.pdf"));
      } catch (e) {
        console.warn("PDF preview failed:", e.message);
      }
    } else {
      await fs.copyFile(path.join(outDir, storedName), path.join(outDir, "document.pdf"));
    }

    const editable = EDITABLE.has(ext);
    const meta = {
      id: docId,
      name: req.file.originalname,
      ext,
      storedName,
      mime: MIME[ext],
      size: req.file.size,
      version: "1",
      editable,
      createdAt: new Date().toISOString(),
      engine: "libreoffice",
    };
    await fs.writeFile(path.join(outDir, "meta.json"), JSON.stringify(meta, null, 2));

    const collabora = await checkCollabora();
    res.json({
      ...meta,
      pdfUrl: `http://localhost:${PORT}/api/documents/${docId}/pdf`,
      previewUrl: `http://localhost:${PORT}/api/documents/${docId}/pdf`,
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

app.get("/api/documents/:id/pdf", async (req, res) => {
  const pdfPath = path.join(OUTPUTS, req.params.id, "document.pdf");
  try {
    await fs.access(pdfPath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
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
