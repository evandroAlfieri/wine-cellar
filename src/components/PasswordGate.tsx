import { useState } from 'react';
import { Wine, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';

export function PasswordGate() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useSession();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(password);

    if (!result.success) {
      toast({
        title: 'Access Denied',
        description: result.error || 'Invalid password',
        variant: 'destructive',
      });
      setPassword('');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Wine className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Wine Cellar
          </h1>
          <p className="text-muted-foreground">
            Enter password to access your private collection
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-lg border shadow-lg">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !password}
          >
            {isLoading ? 'Unlocking...' : 'Unlock Cellar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
