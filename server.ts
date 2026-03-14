import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import toolsRoutes from "./src/routes/toolsRoutes";
import taxRoutes from "./src/routes/taxRoutes";
import businessTaxRoutes from "./src/routes/businessTaxRoutes";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // CORS
  app.use(
    cors({
      origin: [
        "https://toolsng.com",
        "https://www.toolsng.com",
        "https://toolsng.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    })
  );

  // Middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Routes
  app.use("/api/tools", toolsRoutes);
  app.use("/api/tax", taxRoutes);
  app.use("/api/business-tax", businessTaxRoutes);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();