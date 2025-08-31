import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useWorkoutPlans } from "@/hooks/use-workouts";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Dumbbell, Plus, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/glass-card";

export default function Home() {
  const { user } = useAuth();
  const { data: workoutStats } = useQuery({
    queryKey: ["/api/analytics/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: todayPlan } = useQuery({
    queryKey: ["/api/workout-plans/user", user?.id],
    enabled: !!user?.id,
  });

  const today = new Date();
  const dayOfWeek = today.getDay();
  const currentPlan = todayPlan?.find((plan: any) => plan.dayOfWeek === dayOfWeek);

  const getDayName = (day: number) => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return days[day];
  };

  const getDateForDay = (offset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.getDate();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 text-white"
    >
      {/* Status Bar */}
      <div className="flex justify-between items-center mb-8 text-white text-sm font-medium">
        <span>9:15</span>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-1 h-3 bg-white rounded-full"></div>
          <div className="w-1 h-4 bg-white rounded-full"></div>
          <div className="w-1 h-3 bg-white rounded-full"></div>
          <span className="bg-white bg-opacity-30 px-2 py-1 rounded-full text-xs">100</span>
        </div>
      </div>

      {/* Week Calendar */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex space-x-4">
          {Array.from({ length: 5 }, (_, i) => {
            const dayOffset = i - 2;
            const isToday = dayOffset === 0;
            return (
              <div key={i} className={`text-center ${isToday ? 'bg-white bg-opacity-20 rounded-2xl px-4 py-2' : ''}`}>
                <div className="text-xs font-medium opacity-80">{getDayName((dayOfWeek + dayOffset + 7) % 7)}</div>
                <div className="text-lg font-bold">{getDateForDay(dayOffset)}</div>
                {!isToday && <div className="w-1 h-1 bg-white rounded-full mx-auto mt-1 opacity-60"></div>}
              </div>
            );
          })}
        </div>
        <button className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <div className="w-1 h-1 bg-white rounded-full mx-1"></div>
          <div className="w-1 h-1 bg-white rounded-full mx-1"></div>
          <div className="w-1 h-1 bg-white rounded-full mx-1"></div>
        </button>
      </div>

      {/* Greeting and Motivation */}
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" data-testid="text-greeting">
          Get ready, {user?.name?.split(' ')[0] || 'Athlete'}
        </h1>
        <p className="text-lg font-medium opacity-90">Let's smash today's workout!</p>
      </div>

      {/* Today's Workout Card */}
      {currentPlan ? (
        <Link href={`/workout/${currentPlan.id}`}>
          <GlassCard className="rounded-3xl p-6 mb-6 cursor-pointer hover:bg-white/20 transition-all duration-300">
            <div className="flex space-x-3 mb-4">
              <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                Special for {user?.name?.split(' ')[0]}
              </span>
              <span className="bg-white bg-opacity-30 px-3 py-1 rounded-full text-sm font-medium">Gym</span>
            </div>
            
            <div className="mb-4">
              <h2 className="text-4xl font-black mb-1" data-testid="text-workout-duration">
                {currentPlan.estimatedDuration} min
              </h2>
              <p className="text-lg font-semibold opacity-90" data-testid="text-muscle-groups">
                {currentPlan.muscleGroups.join(", ")}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {/* Exercise demonstration images */}
                <div className="w-12 h-12 rounded-xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                    alt="Chest exercise" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-12 h-12 rounded-xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1594381898411-846e7d193883?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                    alt="Shoulder exercise" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-12 h-12 rounded-xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                    alt="Core exercise" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-12 h-12 rounded-xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                    alt="Gym exercise" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </GlassCard>
        </Link>
      ) : (
        <GlassCard className="rounded-3xl p-6 mb-6">
          <div className="text-center py-8">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-60" />
            <h3 className="font-bold text-lg mb-2">No workout planned for today</h3>
            <p className="opacity-80 mb-4">Create a workout plan to get started</p>
            <Link href="/weekly-plan">
              <Button className="bg-primary hover:bg-primary/90" data-testid="button-create-plan">
                Create Plan
              </Button>
            </Link>
          </div>
        </GlassCard>
      )}

      {/* Custom Workout Button */}
      <Link href="/add-exercise">
        <GlassCard className="rounded-2xl p-4 flex items-center justify-between mb-8 cursor-pointer hover:bg-white/20 transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-6 h-6" />
            </div>
            <span className="text-lg font-bold">Custom Workout</span>
          </div>
          <svg className="w-6 h-6 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </GlassCard>
      </Link>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <GlassCard className="rounded-2xl p-4 text-center">
          <div className="text-2xl font-black mb-1" data-testid="text-weekly-workouts">
            {workoutStats?.weeklyWorkouts || 0}
          </div>
          <div className="text-sm opacity-80">This Week</div>
        </GlassCard>
        <GlassCard className="rounded-2xl p-4 text-center">
          <div className="text-2xl font-black mb-1" data-testid="text-current-weight">
            {user?.currentWeight || 75}kg
          </div>
          <div className="text-sm opacity-80">Current Weight</div>
        </GlassCard>
      </div>

      {/* Floating Action Button */}
      <Link href="/add-exercise">
        <button className="fixed bottom-24 right-6 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg z-10">
          <Plus className="w-6 h-6 text-white" />
        </button>
      </Link>
    </motion.div>
  );
}
