import React, { useState, useEffect } from 'react';
import '../App.css';
import { useAuthContext } from '../hooks/useAuthContext';
// We no longer need MoodChart here, it's on the Stats Page
import EditDreamModal from '../components/EditDreamModal';
import InterpretationModal from '../components/InterpretationModal';

function HomePage() {
  const [dreams, setDreams] = useState([]);
  const [currentDream, setCurrentDream] = useState({
    title: '', content: '', category: 'normal', mood: 5,
    tags: '', isLucid: false, isRecurring: false
  });
  
  // States for all filters (sent to API)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMood, setFilterMood] = useState('');
  const [filterLucid, setFilterLucid] = useState(false);
  
  const [theme, setTheme] = useState('dark');
  const { user } = useAuthContext();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [dreamToEdit, setDreamToEdit] = useState(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [dreamToInterpret, setDreamToInterpret] = useState(null);

  const categories = {
    normal: { emoji: '😴', label: 'Normal Dream' },
    nightmare: { emoji: '😰', label: 'Nightmare' },
    lucid: { emoji: '🧠', label: 'Lucid Dream' },
    recurring: { emoji: '🔄', label: 'Recurring Dream' },
    prophetic: { emoji: '🔮', label: 'Prophetic Dream' },
    flying: { emoji: '🕊️', label: 'Flying Dream' }
  };

  const moodEmojis = ['😭', '😢', '😐', '🙂', '😊', '😍'];

  const dreamSymbols = {
    water: 'Emotions, subconscious, cleansing',
    flying: 'Freedom, ambition, breaking limitations',
    falling: 'Loss of control, insecurity, letting go',
    animals: 'Instincts, natural desires, wild aspects',
    death: 'Transformation, endings, new beginnings',
    house: 'Self, psyche, different aspects of personality',
    fire: 'Passion, destruction, purification, energy',
    snake: 'Transformation, healing, hidden knowledge',
    car: 'Life direction, control, personal drive',
    school: 'Learning, testing, past experiences'
  };

  // --- Data Fetching & Theme ---
  useEffect(() => {
    const fetchDreams = async () => {
      if (!user) return; 
      const params = new URLSearchParams();
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterMood) params.append('mood', filterMood);
      if (filterLucid) params.append('isLucid', filterLucid);
      if (searchTerm) params.append('q', searchTerm);
      const url = `http://localhost:8000/api/dreams?${params.toString()}`;
      try {
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const json = await response.json();
        if (response.ok) {
          setDreams(json); 
        }
      } catch (error) {
        console.error("Failed to fetch dreams:", error);
      }
    };
    fetchDreams();
    const savedTheme = localStorage.getItem('dreamTheme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [user, searchTerm, filterCategory, filterMood, filterLucid]);

  useEffect(() => {
    localStorage.setItem('dreamTheme', theme);
  }, [theme]);

  // --- CRUD Functions ---
  const addDream = async () => {
    if (!user) return; 
    if (currentDream.title.trim() && currentDream.content.trim()) {
      const newDreamData = {
        ...currentDream,
        date: new Date().toLocaleDateString(),
        tags: currentDream.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      const response = await fetch('http://localhost:8000/api/dreams', {
        method: 'POST',
        body: JSON.stringify(newDreamData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });
      const savedDream = await response.json();
      if (response.ok) {
        setDreams([savedDream, ...dreams]);
        setCurrentDream({
          title: '', content: '', category: 'normal', mood: 5,
          tags: '', isLucid: false, isRecurring: false
        });
      }
    }
  };
  const deleteDream = async (id) => {
    if (!user) return; 
    const response = await fetch(`http://localhost:8000/api/dreams/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
    if (response.ok) {
      setDreams(dreams.filter(dream => dream._id !== id));
    }
  };

  // --- Utility Functions ---
  const exportDreams = () => {
    const dreamText = dreams.map(dream => {
      const categoryInfo = categories[dream.category] || { emoji: '❓', label: 'Unknown' };
      const moodEmoji = moodEmojis[dream.mood] || '😐';
      return `📅 ${dream.date}\n🌙 ${dream.title}\n${categoryInfo.emoji} ${categoryInfo.label}\n${moodEmoji} Mood: ${dream.mood}/5\n\n${dream.content}\n\n${dream.tags && dream.tags.length ? `Tags: ${dream.tags.join(', ')}\n` : ''}${dream.isLucid ? '✨ Lucid Dream\n' : ''}${dream.isRecurring ? '🔄 Recurring Dream\n' : ''}\n${'='.repeat(50)}\n\n`;
    }).join('');
    
    const blob = new Blob([dreamText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dream-journal-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const findSymbols = (text) => {
    const foundSymbols = [];
    if (!text) return foundSymbols; 
    Object.keys(dreamSymbols).forEach(symbol => {
      if (text.toLowerCase().includes(symbol)) {
        foundSymbols.push({ symbol: symbol, meaning: dreamSymbols[symbol] });
      }
    });
    return foundSymbols;
  };

  // --- Modal Functions ---
  const handleOpenEditModal = (dream) => {
    setDreamToEdit(dream);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setDreamToEdit(null);
  };
  const handleDreamUpdated = (updatedDream) => {
    setDreams(prevDreams => 
      prevDreams.map(d => d._id === updatedDream._id ? updatedDream : d)
    );
  };
  const handleOpenAiModal = (dream) => {
    setDreamToInterpret(dream);
    setIsAiModalOpen(true);
  };
  const handleCloseAiModal = () => {
    setIsAiModalOpen(false);
    setDreamToInterpret(null);
  };

  const filteredDreams = dreams; // The array is already pre-filtered by the API

  document.documentElement.setAttribute('data-theme', theme);

  return (
    <div className="homepage-container">
      <header className="page-header">
        <h1>🌙 Dream Journal ✨</h1>
        <p>Capture your dreams, discover their meanings</p>
        <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      {/* Controls */}
      <section className="controls">
        <input
          type="text"
          placeholder="🔍 Search dreams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {Object.entries(categories).map(([key, cat]) => (
            <option key={key} value={key}>{cat.emoji} {cat.label}</option>
          ))}
        </select>
        <select value={filterMood} onChange={(e) => setFilterMood(e.target.value)}>
            <option value="">Min Mood (All)</option>
            <option value="3">Mood 3+</option>
            <option value="4">Mood 4+</option>
            <option value="5">Mood 5+</option>
        </select>
        <button 
            onClick={() => setFilterLucid(!filterLucid)}
            style={{
                background: filterLucid ? 'var(--color-accent)' : 'var(--color-input-bg)',
                color: filterLucid ? 'white' : 'var(--color-text)',
            }}
        >
            ✨ {filterLucid ? 'Showing Lucid' : 'Show Lucid Only'}
        </button>
        {/* ❌ REMOVED: The old "Show Stats" button is gone */}
        <button className="btn-export" onClick={exportDreams}>
          💾 Export
        </button>
      </section>

      {/* ❌ REMOVED: The old, collapsible stats panel is gone */}

      {/* Dream Input Form */}
      <section className="dream-form">
        <h2>✍️ Record a New Dream</h2>
        <div className="dream-form-grid">
          <input
            type="text"
            placeholder="Dream title..."
            value={currentDream.title}
            onChange={(e) => setCurrentDream({...currentDream, title: e.target.value})}
          />
          <select value={currentDream.category} onChange={(e) => setCurrentDream({...currentDream, category: e.target.value})}>
            {Object.entries(categories).map(([key, cat]) => (
              <option key={key} value={key}>{cat.emoji} {cat.label}</option>
            ))}
          </select>
        </div>
        <div className="mood-selector">
          <span>Mood:</span>
          {moodEmojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => setCurrentDream({...currentDream, mood: index})}
              className={currentDream.mood === index ? 'active' : ''}
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={currentDream.isLucid}
              onChange={(e) => setCurrentDream({...currentDream, isLucid: e.target.checked})}
            />
            ✨ Lucid Dream
          </label>
          <label>
            <input
              type="checkbox"
              checked={currentDream.isRecurring}
              onChange={(e) => setCurrentDream({...currentDream, isRecurring: e.target.checked})}
            />
            🔄 Recurring Dream
          </label>
        </div>
        <textarea
          placeholder="Describe your dream in detail..."
          value={currentDream.content}
          onChange={(e) => setCurrentDream({...currentDream, content: e.target.value})}
          rows="5"
        />
        <input
          type="text"
          placeholder="Tags (comma separated): flying, water, family..."
          value={currentDream.tags}
          onChange={(e) => setCurrentDream({...currentDream, tags: e.target.value})}
        />
        <button className="btn-submit" onClick={addDream}>
          💫 Save Dream
        </button>
      </section>

      {/* Dreams List */}
      <section className="dream-list">
        {filteredDreams.map((dream) => {
          const symbols = findSymbols(dream.content);
          return (
            <div className="dream-card" key={dream._id}>
              <button className="btn-ai" onClick={() => handleOpenAiModal(dream)}>
                🤖
              </button>
              <button className="btn-edit" onClick={() => handleOpenEditModal(dream)}>
                ✏️
              </button>
              <button className="btn-delete" onClick={() => deleteDream(dream._id)}>
                ×
              </button>
              
              <div className="dream-card-header">
                <h3>{categories[dream.category]?.emoji || '❓'} {dream.title}</h3>
                <div className="dream-meta">
                  📅 {dream.date} • {moodEmojis[dream.mood] || '😐'} Mood: {dream.mood}/5
                  {dream.isLucid && ' • ✨ Lucid'}
                  {dream.isRecurring && ' • 🔄 Recurring'}
                </div>
              </div>
              <p>{dream.content}</p>
              {dream.tags && dream.tags.length > 0 && (
                <div className="dream-tags">
                  {dream.tags.map((tag, index) => (
                    <span key={index}>#{tag}</span>
                  ))}
                </div>
              )}
              {symbols.length > 0 && (
                <div className="dream-symbols">
                  <h4>🔮 Dream Symbols Found:</h4>
                  {symbols.map((item, index) => (
                    <div key={index}>
                      <strong>{item.symbol}:</strong> {item.meaning}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Empty States */}
      {filteredDreams.length === 0 && dreams.length > 0 && (
        <div className="empty-state">
          <div>🔍</div>
          <p>No dreams match your search criteria</p>
        </div>
      )}
      {dreams.length === 0 && (
        <div className="empty-state">
          <div>🌙</div>
          <p>Your dream journal is empty. Log your first dream!</p>
        </div>
      )}

      {/* Modals */}
      {isEditModalOpen && (
        <EditDreamModal
          dream={dreamToEdit}
          onClose={handleCloseEditModal}
          onDreamUpdated={handleDreamUpdated}
        />
      )}
      {isAiModalOpen && (
        <InterpretationModal
          dreamContent={dreamToInterpret.content}
          onClose={handleCloseAiModal}
        />
      )}
    </div>
  );
};

export default HomePage;