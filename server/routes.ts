import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { insertUserSchema, insertExerciseSchema, insertWorkoutPlanSchema, insertWorkoutPlanExerciseSchema, insertWorkoutSessionSchema, insertExerciseLogSchema, insertWeightLogSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";

// File upload configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = z.object({
        email: z.string().email(),
        password: z.string()
      }).parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Login failed" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updates = z.object({
        name: z.string().optional(),
        heightFeet: z.number().optional(),
        heightInches: z.number().optional(),
        currentWeight: z.number().optional(),
        goalWeight: z.number().optional(),
      }).parse(req.body);

      const user = await storage.updateUser(req.params.id, updates);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Update failed" });
    }
  });

  // Exercise routes
  app.get("/api/exercises", async (req, res) => {
    try {
      const { search, muscleGroup } = req.query;
      
      if (search || muscleGroup) {
        const exercises = await storage.searchExercises(
          search as string || "",
          muscleGroup as string
        );
        res.json(exercises);
      } else {
        const exercises = await storage.getExercises();
        res.json(exercises);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.get("/api/exercises/:id", async (req, res) => {
    try {
      const exercise = await storage.getExercise(req.params.id);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  app.post("/api/exercises", upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const exerciseData = insertExerciseSchema.parse({
        ...req.body,
        muscleGroups: JSON.parse(req.body.muscleGroups || '[]'),
        isCustom: true
      });

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (files?.image?.[0]) {
        exerciseData.imageUrl = `/uploads/${files.image[0].filename}`;
      }
      
      if (files?.video?.[0]) {
        exerciseData.videoUrl = `/uploads/${files.video[0].filename}`;
      }

      const exercise = await storage.createExercise(exerciseData);
      res.json(exercise);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create exercise" });
    }
  });

  // Workout plan routes
  app.get("/api/workout-plans/user/:userId", async (req, res) => {
    try {
      const plans = await storage.getUserWorkoutPlans(req.params.userId);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout plans" });
    }
  });

  app.get("/api/workout-plans/:id", async (req, res) => {
    try {
      const plan = await storage.getWorkoutPlan(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: "Workout plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout plan" });
    }
  });

  app.get("/api/workout-plans/:id/exercises", async (req, res) => {
    try {
      const exercises = await storage.getWorkoutPlanExercises(req.params.id);
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout plan exercises" });
    }
  });

  app.post("/api/workout-plans", async (req, res) => {
    try {
      const planData = insertWorkoutPlanSchema.parse({
        ...req.body,
        muscleGroups: req.body.muscleGroups || []
      });
      const plan = await storage.createWorkoutPlan(planData);
      res.json(plan);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create workout plan" });
    }
  });

  app.patch("/api/workout-plans/:id", async (req, res) => {
    try {
      const updates = z.object({
        name: z.string().optional(),
        muscleGroups: z.array(z.string()).optional(),
        estimatedDuration: z.number().optional(),
        isActive: z.boolean().optional(),
      }).parse(req.body);

      const plan = await storage.updateWorkoutPlan(req.params.id, updates);
      res.json(plan);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update workout plan" });
    }
  });

  app.post("/api/workout-plans/:id/exercises", async (req, res) => {
    try {
      const planExerciseData = insertWorkoutPlanExerciseSchema.parse({
        ...req.body,
        workoutPlanId: req.params.id
      });
      const planExercise = await storage.addExerciseToWorkoutPlan(planExerciseData);
      res.json(planExercise);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to add exercise to plan" });
    }
  });

  // Workout session routes
  app.get("/api/workout-sessions/user/:userId", async (req, res) => {
    try {
      const sessions = await storage.getUserWorkoutSessions(req.params.userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout sessions" });
    }
  });

  app.post("/api/workout-sessions", async (req, res) => {
    try {
      const sessionData = insertWorkoutSessionSchema.parse(req.body);
      const session = await storage.createWorkoutSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create workout session" });
    }
  });

  app.patch("/api/workout-sessions/:id", async (req, res) => {
    try {
      const updates = z.object({
        endTime: z.string().datetime().optional(),
        isCompleted: z.boolean().optional(),
        notes: z.string().optional(),
      }).parse(req.body);

      const session = await storage.updateWorkoutSession(req.params.id, {
        ...updates,
        endTime: updates.endTime ? new Date(updates.endTime) : undefined
      });
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update workout session" });
    }
  });

  app.get("/api/workout-sessions/:id/logs", async (req, res) => {
    try {
      const logs = await storage.getWorkoutSessionLogs(req.params.id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise logs" });
    }
  });

  app.post("/api/exercise-logs", async (req, res) => {
    try {
      const logData = insertExerciseLogSchema.parse(req.body);
      const log = await storage.createExerciseLog(logData);
      res.json(log);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create exercise log" });
    }
  });

  app.patch("/api/exercise-logs/:id", async (req, res) => {
    try {
      const updates = z.object({
        sets: z.number().optional(),
        reps: z.number().optional(),
        weight: z.number().optional(),
        isCompleted: z.boolean().optional(),
      }).parse(req.body);

      const log = await storage.updateExerciseLog(req.params.id, updates);
      res.json(log);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update exercise log" });
    }
  });

  // Weight tracking routes
  app.get("/api/weight-logs/user/:userId", async (req, res) => {
    try {
      const logs = await storage.getUserWeightLogs(req.params.userId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weight logs" });
    }
  });

  app.post("/api/weight-logs", async (req, res) => {
    try {
      const logData = insertWeightLogSchema.parse(req.body);
      const log = await storage.createWeightLog(logData);
      res.json(log);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create weight log" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/user/:userId", async (req, res) => {
    try {
      const stats = await storage.getUserWorkoutStats(req.params.userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
