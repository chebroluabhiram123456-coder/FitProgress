import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Video, Upload } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import GlassCard from "@/components/glass-card";

const muscleGroups = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Triceps", "Biceps", "Glutes", "Abs"];

export default function CreateExercise() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    instructions: "",
    muscleGroups: [] as string[],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const createExerciseMutation = useMutation({
    mutationFn: async () => {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("instructions", formData.instructions);
      formDataToSend.append("muscleGroups", JSON.stringify(formData.muscleGroups));
      formDataToSend.append("createdBy", user?.id || "");
      
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }
      if (videoFile) {
        formDataToSend.append("video", videoFile);
      }

      const response = await fetch("/api/exercises", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to create exercise");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      toast({
        title: "Exercise Created!",
        description: "Your custom exercise has been added successfully.",
      });
      setLocation("/add-exercise");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create exercise. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMuscleGroupToggle = (group: string) => {
    setFormData(prev => ({
      ...prev,
      muscleGroups: prev.muscleGroups.includes(group)
        ? prev.muscleGroups.filter(g => g !== group)
        : [...prev.muscleGroups, group]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.muscleGroups.length > 0) {
      createExerciseMutation.mutate();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 text-white"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black">Create Exercise</h1>
        <button 
          onClick={() => setLocation("/add-exercise")}
          className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
          data-testid="button-close"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Exercise Name */}
        <GlassCard className="rounded-2xl p-4">
          <Label className="block text-sm font-medium mb-2 text-white">Exercise Name</Label>
          <Input
            type="text"
            placeholder="Enter exercise name..."
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full bg-transparent border-b border-white border-opacity-30 py-3 text-white placeholder:text-white/70 border-l-0 border-r-0 border-t-0 rounded-none focus:border-primary"
            required
            data-testid="input-exercise-name"
          />
        </GlassCard>

        {/* Muscle Groups */}
        <GlassCard className="rounded-2xl p-4">
          <Label className="block text-sm font-medium mb-3 text-white">Target Muscle Groups</Label>
          <div className="flex flex-wrap gap-2">
            {muscleGroups.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => handleMuscleGroupToggle(group)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  formData.muscleGroups.includes(group)
                    ? "bg-primary text-white"
                    : "bg-white bg-opacity-20 text-white hover:bg-white/30"
                }`}
                data-testid={`button-muscle-${group.toLowerCase()}`}
              >
                {group}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Media Upload */}
        <GlassCard className="rounded-2xl p-4">
          <Label className="block text-sm font-medium mb-3 text-white">Exercise Media</Label>
          <div className="space-y-3">
            <div className="border-2 border-dashed border-white border-opacity-30 rounded-xl p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                data-testid="input-image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Camera className="w-8 h-8 mb-2 opacity-70 mx-auto" />
                <p className="text-sm opacity-80">
                  {imageFile ? imageFile.name : "Tap to add demo image"}
                </p>
              </label>
            </div>
            <div className="border-2 border-dashed border-white border-opacity-30 rounded-xl p-6 text-center">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                id="video-upload"
                data-testid="input-video-upload"
              />
              <label htmlFor="video-upload" className="cursor-pointer">
                <Video className="w-8 h-8 mb-2 opacity-70 mx-auto" />
                <p className="text-sm opacity-80">
                  {videoFile ? videoFile.name : "Tap to add demo video"}
                </p>
              </label>
            </div>
          </div>
        </GlassCard>

        {/* Exercise Instructions */}
        <GlassCard className="rounded-2xl p-4">
          <Label className="block text-sm font-medium mb-2 text-white">Instructions</Label>
          <Textarea
            placeholder="Describe how to perform this exercise..."
            value={formData.instructions}
            onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
            className="w-full bg-transparent border border-white border-opacity-30 rounded-xl p-3 text-white placeholder:text-white/70 focus:border-primary h-24 resize-none"
            data-testid="textarea-instructions"
          />
        </GlassCard>

        {/* Description */}
        <GlassCard className="rounded-2xl p-4">
          <Label className="block text-sm font-medium mb-2 text-white">Description</Label>
          <Input
            type="text"
            placeholder="Brief description of the exercise..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full bg-transparent border-b border-white border-opacity-30 py-3 text-white placeholder:text-white/70 border-l-0 border-r-0 border-t-0 rounded-none focus:border-primary"
            data-testid="input-exercise-description"
          />
        </GlassCard>
      </form>

      {/* Save Button */}
      <div className="fixed bottom-20 left-4 right-4 max-w-sm mx-auto">
        <Button
          onClick={handleSubmit}
          disabled={createExerciseMutation.isPending || !formData.name || formData.muscleGroups.length === 0}
          className="w-full bg-black text-white rounded-2xl py-4 font-bold text-lg hover:bg-black/90 disabled:opacity-50"
          data-testid="button-save-exercise"
        >
          {createExerciseMutation.isPending ? "Saving..." : "Save Exercise"}
        </Button>
      </div>
    </motion.div>
  );
}
