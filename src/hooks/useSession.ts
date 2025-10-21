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
      // Try to fetch data - if we get 401, we're not authenticated
      const { error } = await supabase.from('country').select('id').limit(1);
      
      // If no error or error is not auth-related, we might be authenticated
      // The edge function will validate the session cookie
      setIsAuthenticated(!error || error.code !== 'PGRST301');
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (password: string) => {
    try {
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${projectUrl}/functions/v1/winecellar-api?path=session.login`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
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
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${projectUrl}/functions/v1/winecellar-api?path=session.logout`;
      
      await fetch(url, {
        method: 'POST',
        credentials: 'include',
      });

      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
