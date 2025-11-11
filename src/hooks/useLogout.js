import { useAuthContext } from './useAuthContext';

export const useLogout = () => {
  const { dispatch } = useAuthContext();

  const logout = () => {
    // 1. Remove user from local storage
    localStorage.removeItem('user');
    // 2. Dispatch a LOGOUT action to the AuthContext
    dispatch({ type: 'LOGOUT' });
  };

  return { logout };
};