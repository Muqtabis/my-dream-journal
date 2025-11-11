import { useState } from 'react';
import { useAuthContext } from './useAuthContext';

export const useSignup = () => {
  const [error, setError] = useState(null);
  const { dispatch } = useAuthContext();

  const signup = async (email, password) => {
    setError(null);

    const response = await fetch('http://localhost:8000/api/users/signup', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, password })
    });
    const json = await response.json();

    if (!response.ok) {
      setError(json.error);
    }
    if (response.ok) {
      // Save the user (email and token) to local storage
      localStorage.setItem('user', JSON.stringify(json));
      // Update the AuthContext
      dispatch({type: 'LOGIN', payload: json});
    }
  };

  return { signup, error };
};