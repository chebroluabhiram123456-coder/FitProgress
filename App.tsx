import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Auth from "@/pages/auth";
import Home from "@/pages/home";
import WorkoutDetails from "@/pages/workout-details";
import WeeklyPlan from "@/pages/weekly-plan";
import Progress from "@/pages/progress";
import Calendar from "@/pages/calendar";
import AddExercise from "@/pages/add-exercise";
import CreateExercise from "@/pages/create-exercise";
import Profile from "@/pages/profile";
import BottomNavigation from "@/components/bottom-navigation";
import { useAuth } from "@/hooks/use-auth";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="glass-card rounded-3xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="text-white font-bold mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="max-w-sm mx-auto bg-transparent min-h-screen relative pb-20">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/workout/:id" component={WorkoutDetails} />
          <Route path="/weekly-plan" component={WeeklyPlan} />
          <Route path="/progress" component={Progress} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/add-exercise" component={AddExercise} />
          <Route path="/create-exercise" component={CreateExercise} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
        <BottomNavigation />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
