import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { 
  WorkoutPlan, InsertWorkoutPlan, 
  WorkoutSession, InsertWorkoutSession,
  ExerciseLog, InsertExerciseLog,
  WeightLog, InsertWeightLog
} from "@shared/schema";

// Workout Plans
export function useWorkoutPlans(userId: string) {
  return useQuery({
    queryKey: ["/api/workout-plans/user", userId],
    enabled: !!userId,
  });
}

export function useWorkoutPlan(id: string) {
  return useQuery({
    queryKey: ["/api/workout-plans", id],
    enabled: !!id,
  });
}

export function useWorkoutPlanExercises(planId: string) {
  return useQuery({
    queryKey: ["/api/workout-plans", planId, "exercises"],
    enabled: !!planId,
  });
}

export function useCreateWorkoutPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (planData: InsertWorkoutPlan) => {
      return apiRequest("POST", "/api/workout-plans", planData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-plans"] });
      toast({
        title: "Workout Plan Created!",
        description: "Your workout plan has been saved successfully.",
      });
    },
  });
}

export function useUpdateWorkoutPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertWorkoutPlan> }) => {
      return apiRequest("PATCH", `/api/workout-plans/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-plans"] });
      toast({
        title: "Plan Updated!",
        description: "Your workout plan has been updated.",
      });
    },
  });
}

// Workout Sessions
export function useWorkoutSessions(userId: string) {
  return useQuery({
    queryKey: ["/api/workout-sessions/user", userId],
    enabled: !!userId,
  });
}

export function useCreateWorkoutSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sessionData: InsertWorkoutSession) => {
      return apiRequest("POST", "/api/workout-sessions", sessionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions"] });
      toast({
        title: "Workout Started!",
        description: "Your workout session has begun. Let's crush it!",
      });
    },
  });
}

export function useUpdateWorkoutSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: { endTime?: string; isCompleted?: boolean; notes?: string } 
    }) => {
      return apiRequest("PATCH", `/api/workout-sessions/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions"] });
    },
  });
}

// Exercise Logs
export function useWorkoutSessionLogs(sessionId: string) {
  return useQuery({
    queryKey: ["/api/workout-sessions", sessionId, "logs"],
    enabled: !!sessionId,
  });
}

export function useCreateExerciseLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logData: InsertExerciseLog) => {
      return apiRequest("POST", "/api/exercise-logs", logData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exercise-logs"] });
    },
  });
}

export function useUpdateExerciseLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: Partial<InsertExerciseLog> 
    }) => {
      return apiRequest("PATCH", `/api/exercise-logs/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercise-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions"] });
    },
  });
}

// Weight Logs
export function useWeightLogs(userId: string) {
  return useQuery({
    queryKey: ["/api/weight-logs/user", userId],
    enabled: !!userId,
  });
}

export function useCreateWeightLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (logData: InsertWeightLog) => {
      return apiRequest("POST", "/api/weight-logs", logData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weight-logs"] });
      toast({
        title: "Weight Logged!",
        description: "Your weight has been recorded successfully.",
      });
    },
  });
}

// Analytics
export function useWorkoutStats(userId: string) {
  return useQuery({
    queryKey: ["/api/analytics/user", userId],
    enabled: !!userId,
  });
}

// Add exercise to workout plan
export function useAddExerciseToWorkoutPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      workoutPlanId: string;
      exerciseId: string;
      sets: number;
      reps: number;
      weight?: number;
      restTime?: number;
      order: number;
    }) => {
      return apiRequest("POST", `/api/workout-plans/${data.workoutPlanId}/exercises`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-plans"] });
      toast({
        title: "Exercise Added!",
        description: "Exercise has been added to your workout plan.",
      });
    },
  });
}
