import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="glass-card rounded-3xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2">FitTracker Pro</h1>
            <p className="text-white opacity-80">
              {isLogin ? "Welcome back!" : "Start your fitness journey"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="name" className="text-white font-medium">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                    placeholder="Enter your full name"
                    required={!isLogin}
                    data-testid="input-name"
                  />
                </div>

                <div>
                  <Label htmlFor="username" className="text-white font-medium">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                    placeholder="Choose a username"
                    required={!isLogin}
                    data-testid="input-username"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email" className="text-white font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                placeholder="Enter your email"
                required
                data-testid="input-email"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                placeholder="Enter your password"
                required
                data-testid="input-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-white font-bold py-3 rounded-2xl hover:bg-black/90"
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-white opacity-80 hover:opacity-100 transition-opacity"
              data-testid="button-toggle-auth"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
