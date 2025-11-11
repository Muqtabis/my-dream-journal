import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';

// We'll pass in the dream to edit, a function to close the modal,
// and a function to update the dream in our main list.
const EditDreamModal = ({ dream, onClose, onDreamUpdated }) => {
  const { user } = useAuthContext();
  const [formData, setFormData] = useState({ ...dream });

  // Update state if the dream prop changes
  useEffect(() => {
    setFormData({ ...dream });
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
    if (!user) return;

    // Send only the data, not the full user object
    const { title, content, category, mood, tags, isLucid, isRecurring } = formData;
    const updateData = { title, content, category, mood, tags, isLucid, isRecurring };

    const response = await fetch(`http://localhost:8000/api/dreams/${dream._id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      }
    });

    const json = await response.json();

    if (response.ok) {
      onDreamUpdated(json); // Send the updated dream back to HomePage
      onClose(); // Close the modal
    } else {
      console.error('Failed to update dream:', json.error);
    }
  };

  // Your original form's categories and moods
  const categories = {
    normal: { emoji: '😴', label: 'Normal Dream' },
    nightmare: { emoji: '😰', label: 'Nightmare' },
    // ... add all your other categories
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
            value={formData.title}
            onChange={handleChange}
          />

          {/* Category */}
          <label>Category:</label>
          <select name="category" value={formData.category} onChange={handleChange}>
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
                onClick={() => setFormData({...formData, mood: index})}
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
              checked={formData.isLucid}
              onChange={handleChange}
            />
            Lucid Dream
          </label>
          <label>
            <input
              type="checkbox"
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={handleChange}
            />
            Recurring Dream
          </label>

          {/* Content */}
          <label>Content:</label>
          <textarea
            name="content"
            rows="5"
            value={formData.content}
            onChange={handleChange}
          />

          {/* Tags (assuming tags are stored as a string, like your form) */}
          <label>Tags (comma separated):</label>
          <input
            type="text"
            name="tags"
            value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
            onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim())})}
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