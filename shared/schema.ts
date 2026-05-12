import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const savedPlans = sqliteTable("saved_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  checklistJson: text("checklist_json").notNull(),
  markdown: text("markdown").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const projectSpecs = sqliteTable("project_specs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  selectedModel: text("selected_model").notNull(),
  answersJson: text("answers_json").notNull(),
  projectMarkdown: text("project_markdown").notNull(),
  promptPackage: text("prompt_package").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertSavedPlanSchema = createInsertSchema(savedPlans)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    name: z.string().trim().min(1, "Plan name is required").max(80, "Plan name is too long"),
    checklistJson: z.string().min(2),
    markdown: z.string().min(10),
  });

export type InsertSavedPlan = z.infer<typeof insertSavedPlanSchema>;
export type SavedPlan = typeof savedPlans.$inferSelect;

export const insertProjectSpecSchema = createInsertSchema(projectSpecs)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    name: z.string().trim().min(1, "Project name is required").max(100, "Project name is too long"),
    selectedModel: z.string().trim().min(1).max(80),
    answersJson: z.string().min(2),
    projectMarkdown: z.string().min(20),
    promptPackage: z.string().min(20),
  });

export type InsertProjectSpec = z.infer<typeof insertProjectSpecSchema>;
export type ProjectSpec = typeof projectSpecs.$inferSelect;
