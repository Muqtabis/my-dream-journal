import { useState } from 'react';
import { useAuthContext } from './useAuthContext'; // We'll create this next

export const useLogin = () => {
  const [error, setError] = useState(null);
  const { dispatch } = useAuthContext();

  const login = async (email, password) => {
    setError(null);

    const response = await fetch('http://localhost:8000/api/users/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, password })
    });
    const json = await response.json();

    if (!response.ok) {
      setError(json.error);
    }
    if (response.ok) {
      // Save the user to local storage (email and token)
      localStorage.setItem('user', JSON.stringify(json));
      // Update the auth context
      dispatch({type: 'LOGIN', payload: json});
    }
  };

  return { login, error };
};