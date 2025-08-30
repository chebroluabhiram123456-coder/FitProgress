import { 
  users, exercises, workoutPlans, workoutPlanExercises, workoutSessions, exerciseLogs, weightLogs,
  type User, type InsertUser, type Exercise, type InsertExercise,
  type WorkoutPlan, type InsertWorkoutPlan, type WorkoutPlanExercise, type InsertWorkoutPlanExercise,
  type WorkoutSession, type InsertWorkoutSession, type ExerciseLog, type InsertExerciseLog,
  type WeightLog, type InsertWeightLog
} from "@shared/schema";
import { db } from "./db";
import { eq, like, and, inArray, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Exercise methods
  getExercises(): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
  searchExercises(search: string, muscleGroup?: string): Promise<Exercise[]>;
  createExercise(insertExercise: InsertExercise): Promise<Exercise>;
  
  // Workout Plan methods
  getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[]>;
  getWorkoutPlan(id: string): Promise<WorkoutPlan | undefined>;
  getWorkoutPlanExercises(planId: string): Promise<any[]>;
  createWorkoutPlan(insertPlan: InsertWorkoutPlan): Promise<WorkoutPlan>;
  updateWorkoutPlan(id: string, updates: Partial<WorkoutPlan>): Promise<WorkoutPlan>;
  addExerciseToWorkoutPlan(planExercise: InsertWorkoutPlanExercise): Promise<WorkoutPlanExercise>;
  
  // Workout Session methods
  getUserWorkoutSessions(userId: string): Promise<WorkoutSession[]>;
  createWorkoutSession(insertSession: InsertWorkoutSession): Promise<WorkoutSession>;
  updateWorkoutSession(id: string, updates: Partial<WorkoutSession>): Promise<WorkoutSession>;
  getWorkoutSessionLogs(sessionId: string): Promise<ExerciseLog[]>;
  
  // Exercise Log methods
  createExerciseLog(insertLog: InsertExerciseLog): Promise<ExerciseLog>;
  updateExerciseLog(id: string, updates: Partial<ExerciseLog>): Promise<ExerciseLog>;
  
  // Weight Log methods
  getUserWeightLogs(userId: string): Promise<WeightLog[]>;
  createWeightLog(insertLog: InsertWeightLog): Promise<WeightLog>;
  
  // Analytics
  getUserWorkoutStats(userId: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Exercise methods
  async getExercises(): Promise<Exercise[]> {
    return await db.select().from(exercises).orderBy(exercises.name);
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    const [exercise] = await db.select().from(exercises).where(eq(exercises.id, id));
    return exercise || undefined;
  }

  async searchExercises(search: string, muscleGroup?: string): Promise<Exercise[]> {
    let query = db.select().from(exercises);
    
    if (search) {
      query = query.where(like(exercises.name, `%${search}%`));
    }
    
    // Note: muscleGroup filtering would need JSON operations for the array field
    return await query.orderBy(exercises.name);
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const [exercise] = await db
      .insert(exercises)
      .values(insertExercise)
      .returning();
    return exercise;
  }

  // Workout Plan methods
  async getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    return await db.select().from(workoutPlans)
      .where(eq(workoutPlans.userId, userId))
      .orderBy(workoutPlans.dayOfWeek);
  }

  async getWorkoutPlan(id: string): Promise<WorkoutPlan | undefined> {
    const [plan] = await db.select().from(workoutPlans).where(eq(workoutPlans.id, id));
    return plan || undefined;
  }

  async getWorkoutPlanExercises(planId: string): Promise<any[]> {
    return await db.select({
      id: workoutPlanExercises.id,
      sets: workoutPlanExercises.sets,
      reps: workoutPlanExercises.reps,
      weight: workoutPlanExercises.weight,
      restTime: workoutPlanExercises.restTime,
      order: workoutPlanExercises.order,
      exercise: exercises
    })
    .from(workoutPlanExercises)
    .leftJoin(exercises, eq(workoutPlanExercises.exerciseId, exercises.id))
    .where(eq(workoutPlanExercises.workoutPlanId, planId))
    .orderBy(workoutPlanExercises.order);
  }

  async createWorkoutPlan(insertPlan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const [plan] = await db
      .insert(workoutPlans)
      .values(insertPlan)
      .returning();
    return plan;
  }

  async updateWorkoutPlan(id: string, updates: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
    const [plan] = await db
      .update(workoutPlans)
      .set(updates)
      .where(eq(workoutPlans.id, id))
      .returning();
    return plan;
  }

  async addExerciseToWorkoutPlan(planExercise: InsertWorkoutPlanExercise): Promise<WorkoutPlanExercise> {
    const [result] = await db
      .insert(workoutPlanExercises)
      .values(planExercise)
      .returning();
    return result;
  }

  // Workout Session methods
  async getUserWorkoutSessions(userId: string): Promise<WorkoutSession[]> {
    return await db.select().from(workoutSessions)
      .where(eq(workoutSessions.userId, userId))
      .orderBy(desc(workoutSessions.startTime));
  }

  async createWorkoutSession(insertSession: InsertWorkoutSession): Promise<WorkoutSession> {
    const [session] = await db
      .insert(workoutSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async updateWorkoutSession(id: string, updates: Partial<WorkoutSession>): Promise<WorkoutSession> {
    const [session] = await db
      .update(workoutSessions)
      .set(updates)
      .where(eq(workoutSessions.id, id))
      .returning();
    return session;
  }

  async getWorkoutSessionLogs(sessionId: string): Promise<ExerciseLog[]> {
    return await db.select().from(exerciseLogs)
      .where(eq(exerciseLogs.workoutSessionId, sessionId))
      .orderBy(exerciseLogs.order);
  }

  // Exercise Log methods
  async createExerciseLog(insertLog: InsertExerciseLog): Promise<ExerciseLog> {
    const [log] = await db
      .insert(exerciseLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async updateExerciseLog(id: string, updates: Partial<ExerciseLog>): Promise<ExerciseLog> {
    const [log] = await db
      .update(exerciseLogs)
      .set(updates)
      .where(eq(exerciseLogs.id, id))
      .returning();
    return log;
  }

  // Weight Log methods
  async getUserWeightLogs(userId: string): Promise<WeightLog[]> {
    return await db.select().from(weightLogs)
      .where(eq(weightLogs.userId, userId))
      .orderBy(desc(weightLogs.date));
  }

  async createWeightLog(insertLog: InsertWeightLog): Promise<WeightLog> {
    const [log] = await db
      .insert(weightLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  // Analytics
  async getUserWorkoutStats(userId: string): Promise<any> {
    // Get workout count for current week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const sessions = await db.select().from(workoutSessions)
      .where(and(
        eq(workoutSessions.userId, userId),
        eq(workoutSessions.isCompleted, true)
      ));

    const weeklyWorkouts = sessions.filter(session => 
      new Date(session.startTime) >= weekStart
    ).length;

    return {
      weeklyWorkouts,
      totalWorkouts: sessions.length,
      completedWorkouts: sessions.filter(s => s.isCompleted).length
    };
  }
}

export const storage = new DatabaseStorage();