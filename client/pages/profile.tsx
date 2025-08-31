import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, User, LogOut, Save } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import GlassCard from "@/components/glass-card";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    heightFeet: user?.heightFeet || 5,
    heightInches: user?.heightInches || 10,
    currentWeight: user?.currentWeight || 75.0,
    goalWeight: user?.goalWeight || 70.0,
  });

  const [weightToAdd, setWeightToAdd] = useState("");

  const { data: weightLogs } = useQuery({
    queryKey: ["/api/weight-logs/user", user?.id],
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: typeof profileData) => {
      return apiRequest("PATCH", `/api/users/${user?.id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Profile Updated!",
        description: "Your profile has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addWeightLogMutation = useMutation({
    mutationFn: async (weight: number) => {
      return apiRequest("POST", "/api/weight-logs", {
        userId: user?.id,
        weight,
        date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weight-logs"] });
      setWeightToAdd("");
      toast({
        title: "Weight Logged!",
        description: "Your weight has been recorded.",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleAddWeight = () => {
    const weight = parseFloat(weightToAdd);
    if (weight && weight > 0) {
      addWeightLogMutation.mutate(weight);
    }
  };

  const calculateBMI = () => {
    const heightInMeters = ((profileData.heightFeet * 12) + profileData.heightInches) * 0.0254;
    return (profileData.currentWeight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 text-white"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black">Profile</h1>
        <button 
          onClick={() => setLocation("/")}
          className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
          data-testid="button-close"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Info */}
      <GlassCard className="rounded-2xl p-6 mb-6 text-center">
        <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full mx-auto mb-4 flex items-center justify-center">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-1" data-testid="text-user-name">
          {user?.name || "Fitness Enthusiast"}
        </h2>
        <p className="text-sm opacity-80" data-testid="text-user-email">
          {user?.email || "user@fittracker.com"}
        </p>
      </GlassCard>

      {/* Body Stats */}
      <GlassCard className="rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Body Stats</h3>
          <Button
            onClick={handleSaveProfile}
            disabled={updateProfileMutation.isPending}
            variant="ghost"
            className="text-primary font-bold text-sm hover:bg-white/10 p-2"
            data-testid="button-save-profile"
          >
            <Save className="w-4 h-4 mr-1" />
            {updateProfileMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="font-medium text-white">Height</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={profileData.heightFeet}
                onChange={(e) => setProfileData(prev => ({ ...prev, heightFeet: parseInt(e.target.value) || 0 }))}
                className="w-12 bg-white bg-opacity-20 rounded px-2 py-1 text-center text-sm border-white/30 text-white"
                min="4"
                max="8"
                data-testid="input-height-feet"
              />
              <span className="text-sm">ft</span>
              <Input
                type="number"
                value={profileData.heightInches}
                onChange={(e) => setProfileData(prev => ({ ...prev, heightInches: parseInt(e.target.value) || 0 }))}
                className="w-12 bg-white bg-opacity-20 rounded px-2 py-1 text-center text-sm border-white/30 text-white"
                min="0"
                max="11"
                data-testid="input-height-inches"
              />
              <span className="text-sm">in</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Label className="font-medium text-white">Current Weight</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                step="0.1"
                value={profileData.currentWeight}
                onChange={(e) => setProfileData(prev => ({ ...prev, currentWeight: parseFloat(e.target.value) || 0 }))}
                className="w-16 bg-white bg-opacity-20 rounded px-2 py-1 text-center text-sm border-white/30 text-white"
                data-testid="input-current-weight"
              />
              <span className="text-sm">kg</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Label className="font-medium text-white">Goal Weight</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                step="0.1"
                value={profileData.goalWeight}
                onChange={(e) => setProfileData(prev => ({ ...prev, goalWeight: parseFloat(e.target.value) || 0 }))}
                className="w-16 bg-white bg-opacity-20 rounded px-2 py-1 text-center text-sm border-white/30 text-white"
                data-testid="input-goal-weight"
              />
              <span className="text-sm">kg</span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-white/20">
            <span className="font-medium">BMI</span>
            <span className="text-lg font-bold" data-testid="text-calculated-bmi">
              {calculateBMI()}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Weight Logging */}
      <GlassCard className="rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-lg mb-4">Log Weight</h3>
        <div className="flex space-x-3">
          <Input
            type="number"
            step="0.1"
            placeholder="Enter weight..."
            value={weightToAdd}
            onChange={(e) => setWeightToAdd(e.target.value)}
            className="flex-1 bg-white bg-opacity-20 border-white/30 text-white placeholder:text-white/70"
            data-testid="input-weight-log"
          />
          <Button
            onClick={handleAddWeight}
            disabled={addWeightLogMutation.isPending || !weightToAdd}
            className="bg-primary hover:bg-primary/90 px-6"
            data-testid="button-log-weight"
          >
            {addWeightLogMutation.isPending ? "..." : "Log"}
          </Button>
        </div>
        
        {/* Recent Weight Logs */}
        {weightLogs && weightLogs.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-sm opacity-80">Recent Logs</h4>
            {weightLogs.slice(0, 3).map((log: any, index: number) => (
              <div key={log.id} className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-sm">{log.weight}kg</span>
                <span className="text-xs opacity-70">
                  {new Date(log.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Settings */}
      <GlassCard className="rounded-2xl p-4 mb-20">
        <h3 className="font-bold text-lg mb-4">Settings</h3>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between py-3 hover:bg-white/10 rounded-lg px-2 transition-colors">
            <span className="font-medium">Notifications</span>
            <ArrowLeft className="w-4 h-4 opacity-70 rotate-180" />
          </button>
          <button className="w-full flex items-center justify-between py-3 hover:bg-white/10 rounded-lg px-2 transition-colors">
            <span className="font-medium">Privacy</span>
            <ArrowLeft className="w-4 h-4 opacity-70 rotate-180" />
          </button>
          <button className="w-full flex items-center justify-between py-3 hover:bg-white/10 rounded-lg px-2 transition-colors">
            <span className="font-medium">Export Data</span>
            <ArrowLeft className="w-4 h-4 opacity-70 rotate-180" />
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-between py-3 hover:bg-red-500/20 rounded-lg px-2 transition-colors text-red-400"
            data-testid="button-logout"
          >
            <span className="font-medium">Logout</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
