import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useSession() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('winecellar-api', {
        body: {},
        method: 'GET',
      });

      if (error) {
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(data?.authenticated || false);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('winecellar-api', {
        body: { password, path: 'session.login' },
        method: 'POST',
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Login failed');
      }

      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await supabase.functions.invoke('winecellar-api', {
        body: { path: 'session.logout' },
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
