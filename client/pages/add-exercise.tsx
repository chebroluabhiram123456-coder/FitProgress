import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/glass-card";

const muscleGroups = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"];

export default function AddExercise() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("");

  const { data: exercises, isLoading } = useQuery({
    queryKey: searchQuery || selectedMuscleGroup ? 
      ["/api/exercises", { search: searchQuery, muscleGroup: selectedMuscleGroup }] : 
      ["/api/exercises"],
  });

  const popularExercises = [
    {
      id: "bench-press",
      name: "Bench Press",
      muscleGroups: ["Chest", "Triceps"],
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
    },
    {
      id: "shoulder-press",
      name: "Shoulder Press", 
      muscleGroups: ["Shoulders", "Triceps"],
      imageUrl: "https://images.unsplash.com/photo-1594381898411-846e7d193883?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
    },
    {
      id: "deadlift",
      name: "Deadlift",
      muscleGroups: ["Back", "Legs"],
      imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 text-white"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black">Add Exercise</h1>
        <button 
          onClick={() => setLocation("/")}
          className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
          data-testid="button-close"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <GlassCard className="rounded-2xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white opacity-70" />
          <Input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent pl-10 pr-4 py-3 text-white placeholder:text-white/70 border-none focus:ring-0"
            data-testid="input-search-exercises"
          />
        </div>
      </GlassCard>

      {/* Exercise Categories */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-4">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {muscleGroups.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedMuscleGroup(group === selectedMuscleGroup ? "" : group)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedMuscleGroup === group
                  ? "bg-primary text-white"
                  : "bg-white bg-opacity-20 text-white hover:bg-white/30"
              }`}
              data-testid={`button-category-${group.toLowerCase()}`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Popular Exercises */}
      <div className="mb-8">
        <h3 className="font-bold text-lg mb-4">
          {searchQuery || selectedMuscleGroup ? 'Search Results' : 'Popular Exercises'}
        </h3>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-white/20 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {(exercises || popularExercises).map((exercise: any) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="exercise-card rounded-2xl p-4 flex items-center space-x-4"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden">
                  <img 
                    src={exercise.imageUrl || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold" data-testid={`text-exercise-${exercise.id}`}>
                    {exercise.name}
                  </h4>
                  <p className="text-sm opacity-80">
                    {Array.isArray(exercise.muscleGroups) ? 
                      exercise.muscleGroups.join(", ") : 
                      exercise.muscleGroups
                    }
                  </p>
                </div>
                <button 
                  className="w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                  data-testid={`button-add-${exercise.id}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Custom Exercise */}
      <Button
        onClick={() => setLocation("/create-exercise")}
        className="w-full glass-card rounded-2xl p-4 bg-transparent border-white/30 text-white hover:bg-white/10 flex items-center justify-center space-x-3"
        data-testid="button-create-custom"
      >
        <Plus className="w-6 h-6" />
        <span className="font-bold text-lg">Create Custom Exercise</span>
      </Button>
    </motion.div>
  );
}
