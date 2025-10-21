import { Wine, LogOut, BarChart3, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/useSession';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { logout } = useSession();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wine className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Wine Cellar</h1>
                <p className="text-sm text-muted-foreground">Private Collection</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
