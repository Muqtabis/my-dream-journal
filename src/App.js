import React, { useState, useEffect } from 'react';

const DreamJournal = () => {
  const [dreams, setDreams] = useState([]);
  const [currentDream, setCurrentDream] = useState({
    title: '',
    content: '',
    category: 'normal',
    mood: 5,
    tags: '',
    isLucid: false,
    isRecurring: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showStats, setShowStats] = useState(false);
  const [theme, setTheme] = useState('dark');

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

  useEffect(() => {
    const savedDreams = localStorage.getItem('dreamJournal');
    if (savedDreams) {
      setDreams(JSON.parse(savedDreams));
    }
    const savedTheme = localStorage.getItem('dreamTheme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dreamJournal', JSON.stringify(dreams));
  }, [dreams]);

  useEffect(() => {
    localStorage.setItem('dreamTheme', theme);
  }, [theme]);

  const addDream = () => {
    if (currentDream.title.trim() && currentDream.content.trim()) {
      const newDream = {
        ...currentDream,
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        timestamp: new Date().toISOString(),
        tags: currentDream.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      setDreams([newDream, ...dreams]);
      setCurrentDream({
        title: '',
        content: '',
        category: 'normal',
        mood: 5,
        tags: '',
        isLucid: false,
        isRecurring: false
      });
    }
  };

  const deleteDream = (id) => {
    setDreams(dreams.filter(dream => dream.id !== id));
  };

  const exportDreams = () => {
    const dreamText = dreams.map(dream => 
      `📅 ${dream.date}\n🌙 ${dream.title}\n${categories[dream.category].emoji} ${categories[dream.category].label}\n${moodEmojis[dream.mood]} Mood: ${dream.mood}/5\n\n${dream.content}\n\n${dream.tags.length ? `Tags: ${dream.tags.join(', ')}\n` : ''}${dream.isLucid ? '✨ Lucid Dream\n' : ''}${dream.isRecurring ? '🔄 Recurring Dream\n' : ''}\n${'='.repeat(50)}\n\n`
    ).join('');
    
    const blob = new Blob([dreamText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dream-journal-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFilteredDreams = () => {
    return dreams.filter(dream => {
      const matchesSearch = dream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dream.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dream.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || dream.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const getStats = () => {
    const totalDreams = dreams.length;
    const avgMood = dreams.length ? (dreams.reduce((sum, dream) => sum + dream.mood, 0) / dreams.length).toFixed(1) : 0;
    const categoryCounts = dreams.reduce((acc, dream) => {
      acc[dream.category] = (acc[dream.category] || 0) + 1;
      return acc;
    }, {});
    const mostCommonCategory = Object.keys(categoryCounts).reduce((a, b) => 
      categoryCounts[a] > categoryCounts[b] ? a : b, 'normal'
    );
    const lucidCount = dreams.filter(dream => dream.isLucid).length;
    const recurringCount = dreams.filter(dream => dream.isRecurring).length;

    return {
      totalDreams,
      avgMood,
      categoryCounts,
      mostCommonCategory,
      lucidCount,
      recurringCount
    };
  };

  const findSymbols = (text) => {
    const foundSymbols = [];
    Object.keys(dreamSymbols).forEach(symbol => {
      if (text.toLowerCase().includes(symbol)) {
        foundSymbols.push({ symbol, meaning: dreamSymbols[symbol] });
      }
    });
    return foundSymbols;
  };

  const stats = getStats();
  const filteredDreams = getFilteredDreams();

  const themeStyles = {
    dark: {
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      cardBg: 'rgba(255, 255, 255, 0.1)',
      text: '#ffffff',
      accent: '#4facfe'
    },
    light: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cardBg: 'rgba(255, 255, 255, 0.9)',
      text: '#333333',
      accent: '#667eea'
    }
  };

  const currentTheme = themeStyles[theme];

  return (
    <div style={{
      minHeight: '100vh',
      background: currentTheme.background,
      color: currentTheme.text,
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        background: currentTheme.cardBg,
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '30px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{
          fontSize: '3rem',
          margin: '0 0 10px 0',
          background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 30px rgba(79, 172, 254, 0.5)'
        }}>
          🌙 Dream Journal ✨
        </h1>
        <p style={{ margin: '0', opacity: '0.8' }}>Capture your dreams, discover their meanings</p>
        
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: currentTheme.accent,
            border: 'none',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      {/* Controls */}
      <div style={{
        background: currentTheme.cardBg,
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '20px',
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="🔍 Search dreams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: '1',
            minWidth: '200px',
            padding: '12px',
            borderRadius: '25px',
            border: 'none',
            background: 'rgba(255,255,255,0.2)',
            color: currentTheme.text,
            fontSize: '16px'
          }}
        />
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: '12px',
            borderRadius: '25px',
            border: 'none',
            background: 'rgba(255,255,255,0.2)',
            color: currentTheme.text,
            fontSize: '16px'
          }}
        >
          <option value="all">All Categories</option>
          {Object.entries(categories).map(([key, cat]) => (
            <option key={key} value={key}>{cat.emoji} {cat.label}</option>
          ))}
        </select>

        <button
          onClick={() => setShowStats(!showStats)}
          style={{
            padding: '12px 20px',
            borderRadius: '25px',
            border: 'none',
            background: currentTheme.accent,
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          📊 Stats
        </button>

        <button
          onClick={exportDreams}
          style={{
            padding: '12px 20px',
            borderRadius: '25px',
            border: 'none',
            background: '#28a745',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          💾 Export
        </button>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <div style={{
          background: currentTheme.cardBg,
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>📊 Dream Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
              <div style={{ fontSize: '2rem' }}>🌙</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalDreams}</div>
              <div>Total Dreams</div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
              <div style={{ fontSize: '2rem' }}>{moodEmojis[Math.round(stats.avgMood)]}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.avgMood}/5</div>
              <div>Average Mood</div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
              <div style={{ fontSize: '2rem' }}>{categories[stats.mostCommonCategory]?.emoji}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{categories[stats.mostCommonCategory]?.label}</div>
              <div>Most Common</div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
              <div style={{ fontSize: '2rem' }}>✨</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.lucidCount}</div>
              <div>Lucid Dreams</div>
            </div>
          </div>
        </div>
      )}

      {/* Dream Input Form */}
      <div style={{
        background: currentTheme.cardBg,
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>✍️ Record a New Dream</h2>
        
        <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          <input
            type="text"
            placeholder="Dream title..."
            value={currentDream.title}
            onChange={(e) => setCurrentDream({...currentDream, title: e.target.value})}
            style={{
              padding: '15px',
              borderRadius: '15px',
              border: 'none',
              background: 'rgba(255,255,255,0.2)',
              color: currentTheme.text,
              fontSize: '16px'
            }}
          />
          
          <select
            value={currentDream.category}
            onChange={(e) => setCurrentDream({...currentDream, category: e.target.value})}
            style={{
              padding: '15px',
              borderRadius: '15px',
              border: 'none',
              background: 'rgba(255,255,255,0.2)',
              color: currentTheme.text,
              fontSize: '16px'
            }}
          >
            {Object.entries(categories).map(([key, cat]) => (
              <option key={key} value={key}>{cat.emoji} {cat.label}</option>
            ))}
          </select>
        </div>

        <div style={{ margin: '15px 0', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>Mood:</span>
            {moodEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => setCurrentDream({...currentDream, mood: index})}
                style={{
                  background: currentDream.mood === index ? currentTheme.accent : 'transparent',
                  border: '2px solid ' + (currentDream.mood === index ? currentTheme.accent : 'rgba(255,255,255,0.3)'),
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  fontSize: '1.2rem',
                  cursor: 'pointer'
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div style={{ margin: '15px 0', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={currentDream.isLucid}
              onChange={(e) => setCurrentDream({...currentDream, isLucid: e.target.checked})}
            />
            ✨ Lucid Dream
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
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
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '15px',
            border: 'none',
            background: 'rgba(255,255,255,0.2)',
            color: currentTheme.text,
            fontSize: '16px',
            resize: 'vertical',
            marginBottom: '15px'
          }}
        />

        <input
          type="text"
          placeholder="Tags (comma separated): flying, water, family..."
          value={currentDream.tags}
          onChange={(e) => setCurrentDream({...currentDream, tags: e.target.value})}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '15px',
            border: 'none',
            background: 'rgba(255,255,255,0.2)',
            color: currentTheme.text,
            fontSize: '16px',
            marginBottom: '20px'
          }}
        />

        <button
          onClick={addDream}
          style={{
            width: '100%',
            padding: '15px',
            background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
            border: 'none',
            borderRadius: '15px',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 5px 15px rgba(79, 172, 254, 0.4)'
          }}
        >
          💫 Save Dream
        </button>
      </div>

      {/* Dreams List */}
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
        {filteredDreams.map((dream) => {
          const symbols = findSymbols(dream.content);
          return (
            <div
              key={dream.id}
              style={{
                background: currentTheme.cardBg,
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '25px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                position: 'relative'
              }}
            >
              <button
                onClick={() => deleteDream(dream.id)}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: '#ff4757',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ×
              </button>

              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.4rem' }}>
                  {categories[dream.category].emoji} {dream.title}
                </h3>
                <div style={{ fontSize: '0.9rem', opacity: '0.7', marginBottom: '10px' }}>
                  📅 {dream.date} • {moodEmojis[dream.mood]} Mood: {dream.mood}/5
                  {dream.isLucid && ' • ✨ Lucid'}
                  {dream.isRecurring && ' • 🔄 Recurring'}
                </div>
              </div>

              <p style={{ lineHeight: '1.6', marginBottom: '15px' }}>{dream.content}</p>

              {dream.tags.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  {dream.tags.map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        display: 'inline-block',
                        background: currentTheme.accent,
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '15px',
                        fontSize: '0.8rem',
                        margin: '2px 5px 2px 0'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {symbols.length > 0 && (
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '15px',
                  marginTop: '15px'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>🔮 Dream Symbols Found:</h4>
                  {symbols.map((item, index) => (
                    <div key={index} style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
                      <strong style={{ color: currentTheme.accent }}>{item.symbol}:</strong> {item.meaning}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredDreams.length === 0 && dreams.length > 0 && (
        <div style={{ textAlign: 'center', padding: '50px', opacity: '0.7' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔍</div>
          <p>No dreams match your search criteria</p>
        </div>
      )}

      {dreams.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px', opacity: '0.7' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🌙</div>
          <p>Start recording your dreams to build your personal dream journal!</p>
        </div>
      )}
    </div>
  );
};

export default DreamJournal;