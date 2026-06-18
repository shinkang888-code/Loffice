import { Router } from "express";
import { promises as fs } from "fs";
import path from "path";

export function createWopiRouter(docsDir) {
  const router = Router();

  async function getDocPath(id) {
    const dir = path.join(docsDir, id);
    const metaPath = path.join(dir, "meta.json");
    const meta = JSON.parse(await fs.readFile(metaPath, "utf-8"));
    const filePath = path.join(dir, meta.storedName || `original${meta.ext}`);
    return { dir, meta, filePath };
  }

  // WOPI CheckFileInfo
  router.get("/files/:id", async (req, res) => {
    try {
      const { meta, filePath } = await getDocPath(req.params.id);
      const stat = await fs.stat(filePath);
      res.json({
        BaseFileName: meta.name,
        Size: stat.size,
        UserId: "loffice-user",
        UserFriendlyName: "Loffice User",
        UserCanWrite: true,
        UserCanNotWriteRelative: false,
        SupportsUpdate: true,
        SupportsLocks: true,
        ReadOnly: false,
        Version: meta.version || "1",
      });
    } catch {
      res.status(404).json({ error: "File not found" });
    }
  });

  // WOPI GetFile
  router.get("/files/:id/contents", async (req, res) => {
    try {
      const { meta, filePath } = await getDocPath(req.params.id);
      const data = await fs.readFile(filePath);
      res.setHeader("Content-Type", meta.mime || "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${meta.name}"`);
      res.send(data);
    } catch {
      res.status(404).json({ error: "File not found" });
    }
  });

  // WOPI PutFile
  router.post("/files/:id/contents", async (req, res) => {
    try {
      const { meta, filePath, dir } = await getDocPath(req.params.id);
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);
      await fs.writeFile(filePath, buffer);
      meta.version = String(Number(meta.version || 1) + 1);
      meta.size = buffer.length;
      meta.modifiedAt = new Date().toISOString();
      await fs.writeFile(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2));
      res.setHeader("X-WOPI-ItemVersion", meta.version);
      res.status(200).end();
    } catch (err) {
      console.error("WOPI PutFile error:", err);
      res.status(500).json({ error: "Save failed" });
    }
  });

  // WOPI Lock operations
  router.post("/files/:id", async (req, res) => {
    const override = req.headers["x-wopi-override"];
    if (override === "LOCK" || override === "UNLOCK" || override === "REFRESH_LOCK") {
      return res.status(200).end();
    }
    if (override === "PUT") {
      // handled by contents endpoint in some implementations
      return res.status(200).end();
    }
    res.status(501).end();
  });

  return router;
}
