import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import { API_BASE_URL } from '../config';
import { performAuthRequest } from '../utils/localDreamStore';

export const useSignup = () => {
  const [error, setError] = useState(null);
  const { dispatch } = useAuthContext();

  const signup = async (email, password) => {
    setError(null);
    try {
      const userData = await performAuthRequest('signup', email, password, API_BASE_URL);
      localStorage.setItem('user', JSON.stringify(userData));
      dispatch({ type: 'LOGIN', payload: userData });
    } catch (err) {
      setError(err.message || 'Signup failed');
    }
  };

  return { signup, error };
};
