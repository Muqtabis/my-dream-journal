import { useState, useEffect } from 'react';
import { useAuthContext } from './useAuthContext';
import { API_BASE_URL } from '../config';
import { getLocalDreams, isUnavailableBackendResponse } from '../utils/localDreamStore';

export const useDreamsData = () => {
    const { user } = useAuthContext();
    const [dreams, setDreams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDreams = async () => {
            if (!user || user.isLocal) {
                const local = getLocalDreams().filter((d) => d.date);
                setDreams(local);
                setError(null);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const response = await fetch(`${API_BASE_URL}/api/dreams`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });

                if (isUnavailableBackendResponse(response)) {
                    setDreams(getLocalDreams().filter((d) => d.date));
                    setError(null);
                    return;
                }

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
                // Fall back to locally saved dreams if server is unreachable
                const local = getLocalDreams().filter((d) => d.date);
                if (local.length > 0 || !API_BASE_URL) {
                    setDreams(local);
                    setError(null);
                } else {
                    setError('Could not connect to server.');
                    setDreams([]);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchDreams();
    }, [user]);

    return { dreams, isLoading, error };
};
