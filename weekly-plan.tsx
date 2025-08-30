import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Heart } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import GlassCard from "@/components/glass-card";

const daysOfWeek = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const defaultMuscleGroups = [
  ["Chest", "Triceps"],
  ["Back", "Biceps"],
  ["Legs", "Glutes"],
  ["Rest"],
  ["Shoulders", "Core"],
  ["Arms", "Abs"],
  ["Rest"],
];

export default function WeeklyPlan() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workoutPlans, isLoading } = useQuery({
    queryKey: ["/api/workout-plans/user", user?.id],
    enabled: !!user?.id,
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      return apiRequest("POST", "/api/workout-plans", planData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-plans"] });
      toast({
        title: "Plan Created!",
        description: "Your weekly workout plan has been saved.",
      });
    },
  });

  const createDefaultPlans = async () => {
    if (!user?.id) return;

    for (let i = 0; i < 7; i++) {
      const muscleGroups = defaultMuscleGroups[i];
      if (muscleGroups[0] === "Rest") continue;

      await createPlanMutation.mutateAsync({
        userId: user.id,
        name: `${daysOfWeek[i]} - ${muscleGroups.join(" & ")}`,
        dayOfWeek: i,
        muscleGroups,
        estimatedDuration: muscleGroups.length === 1 ? 45 : 60,
      });
    }
  };

  const getPlanForDay = (dayIndex: number) => {
    return workoutPlans?.find((plan: any) => plan.dayOfWeek === dayIndex);
  };

  if (isLoading) {
    return (
      <div className="p-6 text-white">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/20 rounded"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-white/20 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 text-white"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black">Weekly Plan</h1>
        <button 
          onClick={() => setLocation("/")}
          className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
          data-testid="button-close"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Week Overview */}
      <div className="space-y-4 mb-8">
        {daysOfWeek.map((day, index) => {
          const plan = getPlanForDay(index);
          const defaultMuscles = defaultMuscleGroups[index];
          
          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="rounded-2xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold" data-testid={`text-day-${index}`}>
                    {day} - {plan ? plan.muscleGroups.join(" & ") : defaultMuscles.join(" & ")}
                  </h3>
                  <button 
                    className={`text-sm px-3 py-1 rounded-full font-medium ${
                      plan ? 'bg-primary text-white' : 'bg-white bg-opacity-20 text-white'
                    }`}
                    data-testid={`button-edit-day-${index}`}
                  >
                    {plan ? 'Edit' : 'Create'}
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  {defaultMuscles[0] === "Rest" ? (
                    <>
                      <Heart className="w-6 h-6 text-pink-400" />
                      <span className="text-sm opacity-80">Recovery & Stretching</span>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-lg overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50" 
                          alt={`${defaultMuscles[0]} muscles`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm opacity-80">
                        {plan ? `${plan.estimatedDuration} min` : `${defaultMuscles.length === 1 ? 45 : 60} min`}
                      </span>
                    </>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {!workoutPlans?.length && (
        <Button
          onClick={createDefaultPlans}
          disabled={createPlanMutation.isPending}
          className="w-full bg-black text-white rounded-2xl py-4 font-bold text-lg hover:bg-black/90"
          data-testid="button-create-default-plan"
        >
          {createPlanMutation.isPending ? "Creating..." : "Create Default Weekly Plan"}
        </Button>
      )}
    </motion.div>
  );
}
