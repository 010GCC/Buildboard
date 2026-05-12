import { projectSpecs, savedPlans, users } from '@shared/schema';
import type { InsertProjectSpec, ProjectSpec, InsertSavedPlan, SavedPlan, User, InsertUser } from '@shared/schema';
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { desc, eq } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS saved_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    checklist_json TEXT NOT NULL,
    markdown TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS project_specs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    selected_model TEXT NOT NULL,
    answers_json TEXT NOT NULL,
    project_markdown TEXT NOT NULL,
    prompt_package TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

export const db = drizzle(sqlite);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listSavedPlans(): Promise<SavedPlan[]>;
  getSavedPlan(id: number): Promise<SavedPlan | undefined>;
  createSavedPlan(plan: InsertSavedPlan): Promise<SavedPlan>;
  deleteSavedPlan(id: number): Promise<boolean>;
  listProjectSpecs(): Promise<ProjectSpec[]>;
  getProjectSpec(id: number): Promise<ProjectSpec | undefined>;
  createProjectSpec(spec: InsertProjectSpec): Promise<ProjectSpec>;
  deleteProjectSpec(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.username, username)).get();
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return db.insert(users).values(insertUser).returning().get();
  }

  async listSavedPlans(): Promise<SavedPlan[]> {
    return db.select().from(savedPlans).orderBy(desc(savedPlans.updatedAt)).all();
  }

  async getSavedPlan(id: number): Promise<SavedPlan | undefined> {
    return db.select().from(savedPlans).where(eq(savedPlans.id, id)).get();
  }

  async createSavedPlan(insertPlan: InsertSavedPlan): Promise<SavedPlan> {
    const now = new Date().toISOString();
    return db
      .insert(savedPlans)
      .values({ ...insertPlan, createdAt: now, updatedAt: now })
      .returning()
      .get();
  }

  async deleteSavedPlan(id: number): Promise<boolean> {
    const result = db.delete(savedPlans).where(eq(savedPlans.id, id)).run();
    return result.changes > 0;
  }

  async listProjectSpecs(): Promise<ProjectSpec[]> {
    return db.select().from(projectSpecs).orderBy(desc(projectSpecs.updatedAt)).all();
  }

  async getProjectSpec(id: number): Promise<ProjectSpec | undefined> {
    return db.select().from(projectSpecs).where(eq(projectSpecs.id, id)).get();
  }

  async createProjectSpec(insertSpec: InsertProjectSpec): Promise<ProjectSpec> {
    const now = new Date().toISOString();
    return db
      .insert(projectSpecs)
      .values({ ...insertSpec, createdAt: now, updatedAt: now })
      .returning()
      .get();
  }

  async deleteProjectSpec(id: number): Promise<boolean> {
    const result = db.delete(projectSpecs).where(eq(projectSpecs.id, id)).run();
    return result.changes > 0;
  }
}

export const storage = new DatabaseStorage();
