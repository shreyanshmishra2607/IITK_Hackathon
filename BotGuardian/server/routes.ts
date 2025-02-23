import type { Express } from "express";
import { createServer, type Server } from "http";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  return httpServer;
}
