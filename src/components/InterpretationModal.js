import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';

const InterpretationModal = ({ dreamContent, onClose }) => {
  const [interpretation, setInterpretation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchInterpretation = async () => {
      if (!user) {
        setError('You must be logged in.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/api/ai/interpret', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ dreamContent })
        });

        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error);
        }

        setInterpretation(json.interpretation);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterpretation();
  }, [dreamContent, user]); // Re-run if these change

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>🤖 AI Dream Interpretation</h2>
        <div className="interpretation-content">
          {isLoading && (
            <div className="loading-spinner">
              <p>Interpreting your dream...</p>
            </div>
          )}
          {error && <div className="error">{error}</div>}
          {interpretation && <p>{interpretation}</p>}
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterpretationModal;