import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { API_BASE_URL } from '../config';
import { updateLocalDream, isUnavailableBackendResponse } from '../utils/localDreamStore';

const EditDreamModal = ({ dream, onClose, onDreamUpdated }) => {
  const { user } = useAuthContext();
  const [formData, setFormData] = useState({ ...dream });
  const [tagsInput, setTagsInput] = useState(
    Array.isArray(dream?.tags) ? dream.tags.join(', ') : (dream?.tags || '')
  );

  useEffect(() => {
    setFormData({ ...dream });
    setTagsInput(Array.isArray(dream?.tags) ? dream.tags.join(', ') : (dream?.tags || ''));
  }, [dream]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsedTags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const { title, content, category, mood, isLucid, isRecurring } = formData;
    const updateData = { title, content, category, mood, tags: parsedTags, isLucid, isRecurring };

    const useLocalOnly = !user || user.isLocal || String(dream._id || '').startsWith('local_');

    if (useLocalOnly) {
      const updated = updateLocalDream(dream._id, updateData);
      if (updated) {
        onDreamUpdated(updated);
      }
      onClose();
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/dreams/${dream._id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (isUnavailableBackendResponse(response)) {
        const updated = updateLocalDream(dream._id, updateData);
        if (updated) onDreamUpdated(updated);
        onClose();
        return;
      }

      const json = await response.json();

      if (response.ok) {
        onDreamUpdated(json);
        onClose();
      } else {
        console.error('Failed to update dream:', json.error);
      }
    } catch (err) {
      const updated = updateLocalDream(dream._id, updateData);
      if (updated) onDreamUpdated(updated);
      onClose();
    }
  };

  const categories = {
    normal: { emoji: '😴', label: 'Normal Dream' },
    nightmare: { emoji: '😰', label: 'Nightmare' },
    lucid: { emoji: '🧠', label: 'Lucid Dream' },
    recurring: { emoji: '🔄', label: 'Recurring Dream' },
    prophetic: { emoji: '🔮', label: 'Prophetic Dream' },
    flying: { emoji: '🕊️', label: 'Flying Dream' }
  };
  const moodEmojis = ['😭', '😢', '😐', '🙂', '😊', '😍'];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Edit Your Dream</h2>
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title || ''}
            onChange={handleChange}
            required
          />

          {/* Category */}
          <label>Category:</label>
          <select name="category" value={formData.category || 'normal'} onChange={handleChange}>
            {Object.entries(categories).map(([key, cat]) => (
              <option key={key} value={key}>{cat.emoji} {cat.label}</option>
            ))}
          </select>

          {/* Mood */}
          <label>Mood:</label>
          <div className="mood-buttons">
            {moodEmojis.map((emoji, index) => (
              <button
                type="button"
                key={index}
                onClick={() => setFormData({ ...formData, mood: index })}
                className={formData.mood === index ? 'active' : ''}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Checkboxes */}
          <label>
            <input
              type="checkbox"
              name="isLucid"
              checked={!!formData.isLucid}
              onChange={handleChange}
            />
            ✨ Lucid Dream
          </label>
          <label>
            <input
              type="checkbox"
              name="isRecurring"
              checked={!!formData.isRecurring}
              onChange={handleChange}
            />
            🔄 Recurring Dream
          </label>

          {/* Content */}
          <label>Content:</label>
          <textarea
            name="content"
            rows="5"
            value={formData.content || ''}
            onChange={handleChange}
            required
          />

          {/* Tags */}
          <label>Tags (comma separated):</label>
          <input
            type="text"
            name="tags"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
          />

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDreamModal;
