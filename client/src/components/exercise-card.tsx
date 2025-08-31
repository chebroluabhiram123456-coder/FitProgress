import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Menu } from "lucide-react";
import type { Exercise } from "@shared/schema";

interface ExerciseCardProps {
  exercise: Exercise;
  sets: number;
  reps: number;
  weight?: number | null;
  isCompleted: boolean;
  onToggleComplete: (completed: boolean) => void;
}

export default function ExerciseCard({
  exercise,
  sets,
  reps,
  weight,
  isCompleted,
  onToggleComplete,
}: ExerciseCardProps) {
  const [checked, setChecked] = useState(isCompleted);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    setChecked(newChecked);
    onToggleComplete(newChecked);
  };

  return (
    <motion.div 
      className={`exercise-card rounded-2xl p-4 flex items-center space-x-4 transition-all duration-300 ${checked ? 'opacity-70 scale-98' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      data-testid={`card-exercise-${exercise.id}`}
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
        <img 
          src={exercise.imageUrl || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"} 
          alt={exercise.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg mb-1" data-testid={`text-exercise-name-${exercise.id}`}>
          {exercise.name}
        </h3>
        <p className="text-sm opacity-80 mb-2" data-testid={`text-exercise-details-${exercise.id}`}>
          {sets} sets x {reps} reps{weight ? ` x ${weight} kg` : ''}
        </p>
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            className="checkbox-custom" 
            checked={checked}
            onChange={handleCheckboxChange}
            data-testid={`checkbox-exercise-${exercise.id}`}
          />
          <span className="text-xs opacity-70">Mark as completed</span>
        </div>
      </div>
      <div className="flex flex-col space-y-2">
        <button className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
          <RotateCcw className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
          <Menu className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
