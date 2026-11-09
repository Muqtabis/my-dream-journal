import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import { API_BASE_URL } from '../config';

export const useLogin = () => {
  const [error, setError] = useState(null);
  const { dispatch } = useAuthContext();

  const login = async (email, password) => {
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await response.json();

      if (!response.ok) {
        setError(json.error || 'Login failed');
      } else {
        localStorage.setItem('user', JSON.stringify(json));
        dispatch({ type: 'LOGIN', payload: json });
      }
    } catch (err) {
      setError('Unable to reach server. Please check your connection.');
    }
  };

  return { login, error };
};
