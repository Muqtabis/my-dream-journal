import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { API_BASE_URL } from '../config';
import { analyzeDreamDirectly } from '../utils/dreamAnalyzer';
import { isUnavailableBackendResponse } from '../utils/localDreamStore';

const InterpretationModal = ({ dreamContent, onClose }) => {
  const [interpretation, setInterpretation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();

  useEffect(() => {
    const formatFallbackText = (analysis) => {
      const psy = analysis?.psychology;
      if (!psy) return 'Could not interpret dream.';
      const symbolLines = (psy.keySymbols || [])
        .map((s) => `• ${s.symbol}: ${s.meaning}`)
        .join('\n');
      const archetypeLines = (psy.archetypes || [])
        .map((a) => `• ${a.name}: ${a.explanation}`)
        .join('\n');
      return `${psy.overview}\n\nArchetypes:\n${archetypeLines}\n\nKey Symbols:\n${symbolLines}`;
    };

    const fetchInterpretation = async () => {
      try {
        if (user && !user.isLocal) {
          const response = await fetch(`${API_BASE_URL}/api/ai/interpret`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ dreamContent })
          });

          if (!isUnavailableBackendResponse(response)) {
            const json = await response.json();
            if (response.ok && json.interpretation) {
              setInterpretation(json.interpretation);
              setError(null);
              return;
            }
          }
        }

        const analysis = await analyzeDreamDirectly(dreamContent, 'Surrealism (Dalí)', 'Mysterious');
        setInterpretation(formatFallbackText(analysis));
        setError(null);
      } catch (err) {
        const analysis = await analyzeDreamDirectly(dreamContent, 'Surrealism (Dalí)', 'Mysterious');
        setInterpretation(formatFallbackText(analysis));
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterpretation();
  }, [dreamContent, user]);

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
          {interpretation && <p style={{ whiteSpace: 'pre-line' }}>{interpretation}</p>}
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
