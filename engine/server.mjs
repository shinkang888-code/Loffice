import express from "express";
import cors from "cors";
import multer from "multer";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CACHE = path.join(ROOT, ".loffice-cache");
const UPLOADS = path.join(CACHE, "uploads");
const OUTPUTS = path.join(CACHE, "outputs");

const PORT = Number(process.env.LOFFICE_ENGINE_PORT || 9980);
const LO_PATH =
  process.env.LIBREOFFICE_PATH ||
  "C:\\Program Files\\LibreOffice\\program\\soffice.exe";

const SUPPORTED = new Set([
  ".odt", ".ods", ".odp", ".odg",
  ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".rtf", ".txt", ".csv", ".html", ".htm",
  ".pdf", ".epub", ".xml",
]);

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS,
    filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
});

const app = express();
app.use(cors());
app.use(express.json());

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
    "--headless",
    "--invisible",
    "--nologo",
    "--nofirststartwizard",
    "--convert-to", "pdf",
    "--outdir", outDir,
    inputPath,
  ]);
  const base = path.basename(inputPath, path.extname(inputPath));
  const expected = path.join(outDir, `${base}.pdf`);
  try {
    await fs.access(expected);
    return expected;
  } catch {
    const files = await fs.readdir(outDir);
    const pdf = files.find((f) => f.endsWith(".pdf"));
    if (pdf) return path.join(outDir, pdf);
    throw new Error("PDF output not found after conversion");
  }
}

async function getDocumentInfo(filePath) {
  const stat = await fs.stat(filePath);
  return { size: stat.size, modified: stat.mtime.toISOString() };
}

app.get("/health", async (_req, res) => {
  const loExists = await fs.access(LO_PATH).then(() => true).catch(() => false);
  res.json({
    status: "ok",
    engine: "loffice-libreoffice",
    libreOffice: loExists ? LO_PATH : null,
    version: "1.0.0",
  });
});

app.get("/api/formats", (_req, res) => {
  res.json({ formats: [...SUPPORTED].sort() });
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

    let pdfPath;
    if (ext === ".pdf") {
      pdfPath = path.join(outDir, "document.pdf");
      await fs.copyFile(req.file.path, pdfPath);
    } else {
      pdfPath = await convertToPdf(req.file.path, outDir);
      await fs.rename(pdfPath, path.join(outDir, "document.pdf"));
      pdfPath = path.join(outDir, "document.pdf");
    }

    const meta = {
      id: docId,
      name: req.file.originalname,
      ext,
      createdAt: new Date().toISOString(),
      engine: "libreoffice",
    };
    await fs.writeFile(path.join(outDir, "meta.json"), JSON.stringify(meta, null, 2));

    res.json({
      ...meta,
      pdfUrl: `http://localhost:${PORT}/api/documents/${docId}/pdf`,
      previewUrl: `http://localhost:${PORT}/api/documents/${docId}/pdf`,
    });
  } catch (err) {
    console.error("Convert error:", err);
    res.status(500).json({ error: err.message || "변환 실패" });
  }
});

app.get("/api/documents/:id/pdf", async (req, res) => {
  const pdfPath = path.join(OUTPUTS, req.params.id, "document.pdf");
  try {
    await fs.access(pdfPath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    const data = await fs.readFile(pdfPath);
    res.send(data);
  } catch {
    res.status(404).json({ error: "문서를 찾을 수 없습니다." });
  }
});

app.get("/api/documents/:id/meta", async (req, res) => {
  const metaPath = path.join(OUTPUTS, req.params.id, "meta.json");
  try {
    const raw = await fs.readFile(metaPath, "utf-8");
    res.json(JSON.parse(raw));
  } catch {
    res.status(404).json({ error: "메타데이터 없음" });
  }
});

app.delete("/api/documents/:id", async (req, res) => {
  const dir = path.join(OUTPUTS, req.params.id);
  try {
    await fs.rm(dir, { recursive: true, force: true });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "문서 없음" });
  }
});

ensureDirs().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`\n  Loffice Engine → http://localhost:${PORT}`);
    console.log(`  LibreOffice  → ${LO_PATH}\n`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`\n  Loffice Engine already running on port ${PORT}\n`);
      process.exit(0);
    }
    throw err;
  });
});
