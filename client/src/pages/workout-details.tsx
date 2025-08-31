import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark, Plus, RotateCcw, Menu, Dumbbell } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import GlassCard from "@/components/glass-card";
import ExerciseCard from "@/components/exercise-card";
import type { WorkoutPlan } from "@shared/schema";

export default function WorkoutDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workoutPlan, isLoading } = useQuery({
    queryKey: ["/api/workout-plans", id],
    enabled: !!id,
  });

  const { data: planExercises } = useQuery({
    queryKey: ["/api/workout-plans", id, "exercises"],
    enabled: !!id,
  });

  const startWorkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/workout-sessions", {
        userId: workoutPlan?.userId,
        workoutPlanId: id,
        name: workoutPlan?.name,
        startTime: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: (session) => {
      setCurrentSession(session.id);
      toast({
        title: "Workout Started!",
        description: "Let's crush this session!",
      });
    },
  });

  const updateExerciseCompletion = useMutation({
    mutationFn: async ({ exerciseLogId, isCompleted }: { exerciseLogId: string; isCompleted: boolean }) => {
      return apiRequest("PATCH", `/api/exercise-logs/${exerciseLogId}`, { isCompleted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions"] });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 text-white">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/20 rounded"></div>
          <div className="h-32 bg-white/20 rounded-3xl"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/20 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!workoutPlan) {
    return (
      <div className="p-6 text-white text-center">
        <h1 className="text-2xl font-black mb-4">Workout not found</h1>
        <Button onClick={() => setLocation("/")} variant="outline" className="border-white/30 text-white">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 text-white"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black" data-testid="text-workout-title">
            {workoutPlan.estimatedDuration} min
          </h1>
          <p className="opacity-80">{workoutPlan.muscleGroups.join(", ")}</p>
        </div>
        <div className="flex space-x-3">
          <button className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Bookmark className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setLocation("/")}
            className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
            data-testid="button-close"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Exercise Count */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold" data-testid="text-exercise-count">
          {planExercises?.length || 0} Exercises
        </h2>
        <button 
          onClick={() => setLocation("/add-exercise")}
          className="text-primary font-bold flex items-center space-x-2"
          data-testid="button-add-exercise"
        >
          <span>Add</span>
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Exercise List */}
      <div className="space-y-4 mb-24">
        {planExercises?.length > 0 ? (
          planExercises.map((planExercise: any, index: number) => (
            <ExerciseCard
              key={planExercise.id}
              exercise={planExercise.exercise}
              sets={planExercise.sets}
              reps={planExercise.reps}
              weight={planExercise.weight}
              isCompleted={false}
              onToggleComplete={(completed) => {
                // Handle exercise completion
                console.log(`Exercise ${planExercise.exercise.name} completed: ${completed}`);
              }}
            />
          ))
        ) : (
          <GlassCard className="rounded-2xl p-8 text-center">
            <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-60" />
            <h3 className="font-bold text-lg mb-2">No exercises added</h3>
            <p className="opacity-80 mb-4">Add exercises to this workout plan</p>
            <Button 
              onClick={() => setLocation("/add-exercise")}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-add-first-exercise"
            >
              Add Exercise
            </Button>
          </GlassCard>
        )}
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-20 left-4 right-4 max-w-sm mx-auto space-y-3">
        <Button
          onClick={() => startWorkoutMutation.mutate()}
          disabled={startWorkoutMutation.isPending}
          className="w-full bg-black text-white rounded-2xl py-4 font-bold text-lg hover:bg-black/90"
          data-testid="button-start-workout"
        >
          {startWorkoutMutation.isPending ? "Starting..." : "Start Workout"}
        </Button>
        <Button
          variant="outline"
          className="w-full bg-white bg-opacity-20 text-white border-white/30 rounded-2xl py-4 font-bold text-lg hover:bg-white/30"
          data-testid="button-adapt-workout"
        >
          Adapt Workout
        </Button>
      </div>
    </motion.div>
  );
}
