import type { Express } from "express";
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import { storage } from "./storage";
import { insertProjectSpecSchema, insertSavedPlanSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // prefix all routes with /api
  // use storage to perform CRUD operations on the storage interface
  // e.g. app.get("/api/items", async (_req, res) => { ... })

  app.get("/api/plans", async (_req, res) => {
    const plans = await storage.listSavedPlans();
    res.json(plans);
  });

  app.post("/api/plans", async (req, res) => {
    const parsed = insertSavedPlanSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid plan", errors: parsed.error.flatten() });
      return;
    }
    const plan = await storage.createSavedPlan(parsed.data);
    res.status(201).json(plan);
  });

  app.delete("/api/plans/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ message: "Invalid plan id" });
      return;
    }
    const deleted = await storage.deleteSavedPlan(id);
    if (!deleted) {
      res.status(404).json({ message: "Plan not found" });
      return;
    }
    res.status(204).end();
  });

  app.get("/api/project-specs", async (_req, res) => {
    const specs = await storage.listProjectSpecs();
    res.json(specs);
  });

  app.post("/api/project-specs", async (req, res) => {
    const parsed = insertProjectSpecSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid project spec", errors: parsed.error.flatten() });
      return;
    }
    const spec = await storage.createProjectSpec(parsed.data);
    res.status(201).json(spec);
  });

  app.delete("/api/project-specs/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ message: "Invalid project spec id" });
      return;
    }
    const deleted = await storage.deleteProjectSpec(id);
    if (!deleted) {
      res.status(404).json({ message: "Project spec not found" });
      return;
    }
    res.status(204).end();
  });

  return httpServer;
}
