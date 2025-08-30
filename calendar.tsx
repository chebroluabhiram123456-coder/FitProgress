import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Check, Pause, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import GlassCard from "@/components/glass-card";

export default function Calendar() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: workoutSessions } = useQuery({
    queryKey: ["/api/workout-sessions/user", user?.id],
    enabled: !!user?.id,
  });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const hasWorkoutOnDate = (day: number) => {
    if (!workoutSessions) return false;
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return workoutSessions.some((session: any) => {
      const sessionDate = new Date(session.startTime);
      return sessionDate.toDateString() === dateToCheck.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const today = new Date().getDate();
  const isCurrentMonth = currentDate.getMonth() === new Date().getMonth() && 
                         currentDate.getFullYear() === new Date().getFullYear();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 text-white"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black">Workout History</h1>
        <button 
          onClick={() => setLocation("/")}
          className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
          data-testid="button-close"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigateMonth('prev')}
          className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
          data-testid="button-prev-month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold" data-testid="text-current-month">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button 
          onClick={() => navigateMonth('next')}
          className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
          data-testid="button-next-month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <GlassCard className="rounded-2xl p-4 mb-6">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-xs font-medium opacity-70 py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`empty-${i}`} className="text-center py-2 text-sm opacity-50"></div>
          ))}
          
          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const isToday = isCurrentMonth && day === today;
            const hasWorkout = hasWorkoutOnDate(day);
            
            return (
              <div 
                key={day}
                className={`text-center py-2 text-sm relative ${
                  isToday ? 'bg-white bg-opacity-20 rounded-lg font-bold' : ''
                }`}
                data-testid={`calendar-day-${day}`}
              >
                {day}
                {hasWorkout && (
                  <div className="w-1 h-1 bg-green-400 rounded-full mx-auto mt-1"></div>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Recent Workouts */}
      <h3 className="font-bold text-lg mb-4">Recent Workouts</h3>
      <div className="space-y-3">
        {workoutSessions?.slice(0, 3).map((session: any, index: number) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="rounded-2xl p-4 flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                session.isCompleted ? 'bg-green-500' : 'bg-orange-500'
              }`}>
                {session.isCompleted ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <Pause className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold" data-testid={`text-session-name-${session.id}`}>
                  {session.name}
                </h4>
                <p className="text-sm opacity-80">
                  {new Date(session.startTime).toLocaleDateString()} • 
                  {session.endTime ? 
                    Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000) + ' min' :
                    'In progress'
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">
                  {session.isCompleted ? 'Complete' : 'Partial'}
                </div>
                <div className="text-xs opacity-70">
                  Status
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )) || (
          <GlassCard className="rounded-2xl p-8 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-60" />
            <h3 className="font-bold text-lg mb-2">No workouts yet</h3>
            <p className="opacity-80">Start your first workout to see progress</p>
          </GlassCard>
        )}
      </div>
    </motion.div>
  );
}
