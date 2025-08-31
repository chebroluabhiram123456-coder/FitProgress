import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-8 text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-4"
        >
          <Dumbbell className="w-12 h-12 text-white mx-auto" />
        </motion.div>
        <h2 className="text-xl font-bold text-white mb-2">FitTracker Pro</h2>
        <p className="text-white opacity-80">Loading your fitness journey...</p>
        
        <motion.div 
          className="w-full bg-white/20 rounded-full h-2 mt-4"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <motion.div 
            className="bg-primary h-full rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
