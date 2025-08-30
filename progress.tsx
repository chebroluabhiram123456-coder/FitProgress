import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import GlassCard from "@/components/glass-card";
import { Button } from "@/components/ui/button";

export default function Progress() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: workoutStats } = useQuery({
    queryKey: ["/api/analytics/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: weightLogs } = useQuery({
    queryKey: ["/api/weight-logs/user", user?.id],
    enabled: !!user?.id,
  });

  const getWeightChange = () => {
    if (!weightLogs || weightLogs.length < 2) return 0;
    const latest = weightLogs[0];
    const previous = weightLogs[weightLogs.length - 1];
    return latest.weight - previous.weight;
  };

  const completionPercentage = workoutStats ? Math.round((workoutStats.weeklyWorkouts / 7) * 100) : 0;
  const circumference = 2 * Math.PI * 56;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 text-white"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black">Progress</h1>
        <button 
          onClick={() => setLocation("/")}
          className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
          data-testid="button-close"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Weight Tracking */}
      <GlassCard className="rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-lg mb-4">Weight Progress</h3>
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="text-3xl font-black" data-testid="text-current-weight">
              {user?.currentWeight || 75}kg
            </div>
            <div className="text-sm opacity-80">Current Weight</div>
          </div>
          <div className="text-right">
            <div className={`font-bold ${getWeightChange() < 0 ? 'text-green-400' : 'text-orange-400'}`}>
              {getWeightChange() > 0 ? '+' : ''}{getWeightChange().toFixed(1)}kg
            </div>
            <div className="text-xs opacity-80">This month</div>
          </div>
        </div>
        {/* Simplified chart representation */}
        <div className="chart-container h-32 flex items-end space-x-2">
          {Array.from({ length: 7 }, (_, i) => (
            <div 
              key={i}
              className={`rounded-t w-4 ${i === 6 ? 'bg-primary h-28' : 'bg-white bg-opacity-30'}`}
              style={{ height: `${60 + Math.random() * 40}px` }}
            />
          ))}
        </div>
      </GlassCard>

      {/* Workout Frequency */}
      <GlassCard className="rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-lg mb-4">Workout Frequency</h3>
        <div className="flex justify-center mb-4">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full progress-circle">
              <circle 
                cx="64" 
                cy="64" 
                r="56" 
                stroke="rgba(255,255,255,0.2)" 
                strokeWidth="8" 
                fill="none"
              />
              <circle 
                cx="64" 
                cy="64" 
                r="56" 
                stroke="#EC4899" 
                strokeWidth="8" 
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-black" data-testid="text-weekly-completion">
                  {workoutStats?.weeklyWorkouts || 0}/7
                </div>
                <div className="text-xs opacity-80">This week</div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm opacity-80">{completionPercentage}% completion rate</div>
        </div>
      </GlassCard>

      {/* Body Measurements */}
      <GlassCard className="rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Body Measurements</h3>
          <Button 
            onClick={() => setLocation("/profile")}
            variant="ghost" 
            className="text-primary font-bold text-sm hover:bg-white/10"
            data-testid="button-update-measurements"
          >
            Update
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xl font-bold" data-testid="text-height">
              {user?.heightFeet || 5}'{user?.heightInches || 10}"
            </div>
            <div className="text-xs opacity-80">Height</div>
          </div>
          <div>
            <div className="text-xl font-bold" data-testid="text-weight">
              {user?.currentWeight || 75}kg
            </div>
            <div className="text-xs opacity-80">Weight</div>
          </div>
          <div>
            <div className="text-xl font-bold" data-testid="text-bmi">
              {user?.currentWeight && user?.heightFeet && user?.heightInches
                ? (user.currentWeight / Math.pow((user.heightFeet * 12 + user.heightInches) * 0.0254, 2)).toFixed(1)
                : "22.1"}
            </div>
            <div className="text-xs opacity-80">BMI</div>
          </div>
          <div>
            <div className="text-xl font-bold" data-testid="text-goal-weight">
              {user?.goalWeight || 70}kg
            </div>
            <div className="text-xs opacity-80">Goal Weight</div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
