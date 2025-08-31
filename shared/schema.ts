import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  heightFeet: integer("height_feet").default(5),
  heightInches: integer("height_inches").default(10),
  currentWeight: real("current_weight").default(75.0),
  goalWeight: real("goal_weight").default(70.0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  muscleGroups: jsonb("muscle_groups").$type<string[]>().notNull(),
  instructions: text("instructions"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  isCustom: boolean("is_custom").default(false),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workoutPlans = pgTable("workout_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 for Sunday-Saturday
  muscleGroups: jsonb("muscle_groups").$type<string[]>().notNull(),
  estimatedDuration: integer("estimated_duration").notNull(), // in minutes
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workoutPlanExercises = pgTable("workout_plan_exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutPlanId: varchar("workout_plan_id").notNull().references(() => workoutPlans.id),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id),
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  weight: real("weight"), // in kg
  restTime: integer("rest_time"), // in seconds
  order: integer("order").notNull(),
});

export const workoutSessions = pgTable("workout_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  workoutPlanId: varchar("workout_plan_id").references(() => workoutPlans.id),
  name: text("name").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  isCompleted: boolean("is_completed").default(false),
  notes: text("notes"),
});

export const exerciseLogs = pgTable("exercise_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutSessionId: varchar("workout_session_id").notNull().references(() => workoutSessions.id),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id),
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  weight: real("weight"), // in kg
  isCompleted: boolean("is_completed").default(false),
  order: integer("order").notNull(),
});

export const weightLogs = pgTable("weight_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  weight: real("weight").notNull(), // in kg
  date: timestamp("date").notNull().defaultNow(),
  notes: text("notes"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  exercises: many(exercises),
  workoutPlans: many(workoutPlans),
  workoutSessions: many(workoutSessions),
  weightLogs: many(weightLogs),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [exercises.createdBy],
    references: [users.id],
  }),
  workoutPlanExercises: many(workoutPlanExercises),
  exerciseLogs: many(exerciseLogs),
}));

export const workoutPlansRelations = relations(workoutPlans, ({ one, many }) => ({
  user: one(users, {
    fields: [workoutPlans.userId],
    references: [users.id],
  }),
  exercises: many(workoutPlanExercises),
  sessions: many(workoutSessions),
}));

export const workoutPlanExercisesRelations = relations(workoutPlanExercises, ({ one }) => ({
  workoutPlan: one(workoutPlans, {
    fields: [workoutPlanExercises.workoutPlanId],
    references: [workoutPlans.id],
  }),
  exercise: one(exercises, {
    fields: [workoutPlanExercises.exerciseId],
    references: [exercises.id],
  }),
}));

export const workoutSessionsRelations = relations(workoutSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [workoutSessions.userId],
    references: [users.id],
  }),
  workoutPlan: one(workoutPlans, {
    fields: [workoutSessions.workoutPlanId],
    references: [workoutPlans.id],
  }),
  exerciseLogs: many(exerciseLogs),
}));

export const exerciseLogsRelations = relations(exerciseLogs, ({ one }) => ({
  workoutSession: one(workoutSessions, {
    fields: [exerciseLogs.workoutSessionId],
    references: [workoutSessions.id],
  }),
  exercise: one(exercises, {
    fields: [exerciseLogs.exerciseId],
    references: [exercises.id],
  }),
}));

export const weightLogsRelations = relations(weightLogs, ({ one }) => ({
  user: one(users, {
    fields: [weightLogs.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutPlanExerciseSchema = createInsertSchema(workoutPlanExercises).omit({
  id: true,
});

export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions).omit({
  id: true,
});

export const insertExerciseLogSchema = createInsertSchema(exerciseLogs).omit({
  id: true,
});

export const insertWeightLogSchema = createInsertSchema(weightLogs).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;

export type WorkoutPlanExercise = typeof workoutPlanExercises.$inferSelect;
export type InsertWorkoutPlanExercise = z.infer<typeof insertWorkoutPlanExerciseSchema>;

export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type InsertWorkoutSession = z.infer<typeof insertWorkoutSessionSchema>;

export type ExerciseLog = typeof exerciseLogs.$inferSelect;
export type InsertExerciseLog = z.infer<typeof insertExerciseLogSchema>;

export type WeightLog = typeof weightLogs.$inferSelect;
export type InsertWeightLog = z.infer<typeof insertWeightLogSchema>;
