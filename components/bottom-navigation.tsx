import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Dumbbell, BarChart3, Calendar, ClipboardList, User } from "lucide-react";

const navItems = [
  { id: "workout", icon: Dumbbell, label: "Workout", path: "/" },
  { id: "analytics", icon: BarChart3, label: "Analytics", path: "/progress" },
  { id: "calendar", icon: Calendar, label: "Calendar", path: "/calendar" },
  { id: "plan", icon: ClipboardList, label: "Plan", path: "/weekly-plan" },
  { id: "profile", icon: User, label: "Profile", path: "/profile" },
];

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto bg-black bg-opacity-80 backdrop-blur-lg border-t border-white border-opacity-20">
      <div className="flex justify-around py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center space-y-1 py-2 px-4 transition-opacity duration-200 ${
                active ? "opacity-100" : "opacity-60"
              }`}
              data-testid={`nav-${item.id}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="w-12 h-1 bg-primary rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
