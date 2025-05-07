
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut, Settings } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const { preferences, updatePreferences } = usePreferences();

  const toggleDarkMode = () => {
    updatePreferences({ darkMode: !preferences.darkMode });
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-lg py-4 px-6 border-b border-border sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center glow-effect">
              <span className="text-white font-bold text-lg">HV</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-300 bg-clip-text text-transparent">
              HabitVault
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full hover:bg-primary/10"
            >
              {preferences.darkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-primary-800" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user && (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-800 dark:text-primary-200">
                      {user.name?.[0] || user.email?.[0] || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {user.email}
                  </span>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="gap-1.5 hover:border-primary"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Log out</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto py-8 px-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-lg py-4 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Settings className="h-3.5 w-3.5" />
            <span>Built with HabitVault</span>
          </div>
          &copy; {new Date().getFullYear()} HabitVault. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
