import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { detectarAlertasDesercion } from "../workers/desercionWorker";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  // Registrar worker CRON para detección de alertas de deserción
  // Ejecutar cada domingo a las 2:00 AM
  const scheduleDesercionWorker = () => {
    const ahora = new Date();
    const proximoDomingo = new Date(ahora);
    proximoDomingo.setDate(
      proximoDomingo.getDate() + ((0 - proximoDomingo.getDay() + 7) % 7)
    );
    proximoDomingo.setHours(2, 0, 0, 0);

    const tiempoHastaProximoEjecutar = proximoDomingo.getTime() - ahora.getTime();

    console.log(
      `[Worker] Próxima ejecución de detección de deserción: ${proximoDomingo.toISOString()}`
    );

    setTimeout(() => {
      detectarAlertasDesercion();
      // Ejecutar cada 7 días (604800000 ms)
      setInterval(detectarAlertasDesercion, 7 * 24 * 60 * 60 * 1000);
    }, tiempoHastaProximoEjecutar);
  };

  scheduleDesercionWorker();
}

startServer().catch(console.error);
