import { useContext, createContext } from 'react';

// Simple auth context hook
export const useAuth = () => {
  // This is a placeholder - in a real app, you'd use React Context
  // For now, we'll get user from localStorage or props
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return { user };
};

export default useAuth;





