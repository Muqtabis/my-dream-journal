import { useState, useEffect } from 'react';
import { useAuthContext } from './useAuthContext';
import { API_BASE_URL } from '../config';

export const useDreamsData = () => {
    const { user } = useAuthContext();
    const [dreams, setDreams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDreams = async () => {
            if (!user) {
                setIsLoading(false);
                setDreams([]);
                return;
            }

            try {
                setIsLoading(true);
                const response = await fetch(`${API_BASE_URL}/api/dreams`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                const json = await response.json();

                if (!response.ok) {
                    setError(json.error || 'Failed to fetch data.');
                    setDreams([]);
                } else {
                    const cleanDreams = Array.isArray(json) ? json.filter(d => d.date) : [];
                    setDreams(cleanDreams);
                    setError(null);
                }
            } catch (err) {
                setError('Could not connect to server.');
                setDreams([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDreams();
    }, [user]);

    return { dreams, isLoading, error };
};
