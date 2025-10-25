import { useLocation } from 'react-router-dom';

export const useViewMode = () => {
  const location = useLocation();
  const isReadOnly = location.pathname.includes('/guest');
  
  return { isReadOnly };
};
