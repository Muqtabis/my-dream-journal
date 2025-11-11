import React, { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { useDreamsData } from '../hooks/useDreamsData';
import { useAuthContext } from '../hooks/useAuthContext';
import 'react-calendar-heatmap/dist/styles.css';
import MoodChart from '../components/MoodChart'; 

// Constants are defined OUTSIDE the component to prevent re-renders
const categories = {
    normal: { emoji: '😴', label: 'Normal Dream' },
    nightmare: { emoji: '😰', label: 'Nightmare' },
    lucid: { emoji: '🧠', label: 'Lucid Dream' },
    recurring: { emoji: '🔄', label: 'Recurring Dream' },
    prophetic: { emoji: '🔮', label: 'Prophetic Dream' },
    flying: { emoji: '🕊️', label: 'Flying Dream' }
};
const moodEmojis = ['😭', '😢', '😐', '🙂', '😊', '😍'];

const StatsPage = () => {
    const { dreams, isLoading, error } = useDreamsData();
    const { user } = useAuthContext();
    const [stats, setStats] = useState({
        totalDreams: 0,
        avgMood: 'N/A',
        lucidCount: 0,
        mostCommonCategory: 'N/A'
    });
    
    useEffect(() => {
        if (dreams.length > 0) {
            const totalDreams = dreams.length;
            const totalMood = dreams.reduce((sum, dream) => sum + (dream.mood || 0), 0);
            const avgMood = (totalMood / totalDreams).toFixed(1);
            const lucidCount = dreams.filter(dream => dream.isLucid).length;
            
            const categoryCounts = dreams.reduce((acc, dream) => {
                const category = dream.category || 'normal';
                acc[category] = (acc[category] || 0) + 1;
                return acc;
            }, {});
            const mostCommonCategoryKey = Object.keys(categoryCounts).length > 0 ? Object.keys(categoryCounts).reduce((a, b) => 
                categoryCounts[a] > categoryCounts[b] ? a : b, 'normal'
            ) : 'normal';

            setStats({
                totalDreams,
                avgMood,
                lucidCount,
                mostCommonCategory: categories[mostCommonCategoryKey]?.label || 'Unknown'
            });
        }
    }, [dreams]); 

    const getHeatmapData = () => {
        if (!dreams || dreams.length === 0) return [];
        
        return dreams.map(dream => {
            // Safety check for date
            if (!dream.date) return null;
            const parts = dream.date.split('/');
            if (parts.length !== 3) return null;
            
            const [month, day, year] = parts;
            const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            
            return {
                date: formattedDate,
                count: dream.mood + 1
            };
        }).filter(Boolean); // Remove any null entries
    };

    const getTagFrequencies = () => {
        if (!dreams || dreams.length === 0) return [];
        const tagCounts = {};
        dreams.forEach(dream => {
            if (Array.isArray(dream.tags)) {
                dream.tags.forEach(tag => {
                    const normalizedTag = tag.toLowerCase();
                    tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
                });
            }
        });
        return Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);
    };

    const heatmapValues = getHeatmapData();
    const tagFrequencies = getTagFrequencies();
    const today = new Date();
    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const maxTagCount = tagFrequencies.length > 0 ? tagFrequencies[0].count : 1;

    if (!user) {
        return <div className="error-state container">Please log in to view your statistics.</div>;
    }
    if (isLoading) {
        return <div className="loading-state container">Loading Dream Insights...</div>;
    }
    if (error) {
        return <div className="error-state container">Error: {error}</div>;
    }

    // Apply the theme to the root element for this page
    document.documentElement.setAttribute('data-theme', 'dark'); // Or use a theme state if you prefer

    return (
        <div className="stats-page-container container">
            <header className="page-header">
                <h1>📊 Deep Dream Insights</h1>
                <p>Analyzing your subconscious journey.</p>
            </header>

            <section className="stats-content">
                
                <div className="stats-grid">
                    <div className="stat-card">
                        <div>🌙</div>
                        <div>{stats.totalDreams}</div>
                        <div>Total Dreams</div>
                    </div>
                    <div className="stat-card">
                        <div>{moodEmojis[Math.round(stats.avgMood)] || '😐'}</div>
                        <div>{stats.avgMood}/5</div>
                        <div>Average Mood</div>
                    </div>
                    <div className="stat-card">
                        <div>{categories[stats.mostCommonCategory]?.emoji || '❓'}</div>
                        <div>{stats.mostCommonCategory}</div>
                        <div>Most Common Type</div>
                    </div>
                    <div className="stat-card">
                        <div>✨</div>
                        <div>{stats.lucidCount}</div>
                        <div>Lucid Dreams</div>
                    </div>
                </div>

                <div className="stats-card heatmap-card">
                    <h2>Dream Logging History</h2>
                    <p className="card-description">Mood score visualized over time (Brighter = Higher Mood).</p>
                    {dreams.length === 0 ? (
                        <p className="empty-chart-message">Log your first dream to see your history!</p>
                    ) : (
                        <CalendarHeatmap
                            startDate={lastYear}
                            endDate={today}
                            values={heatmapValues}
                            classForValue={(value) => {
                                if (!value) { return 'color-empty'; }
                                return `color-scale-${value.count}`; 
                            }}
                            tooltipDataAttrs={(value) => {
                                return {
                                    'data-tip': value.date ? `${value.date}: Mood ${value.count - 1}/5` : 'No dreams logged',
                                };
                            }}
                            showWeekdayLabels={true}
                        />
                    )}
                </div>

                <div className="stats-card tag-cloud-card">
                    <h2>Most Common Themes (Tag Cloud)</h2>
                    <div className="tag-cloud-display">
                        {tagFrequencies.map(({ tag, count }) => (
                            <span 
                                key={tag} 
                                className="tag-item"
                                style={{
                                    fontSize: `${1 + (count / maxTagCount) * 1.5}rem`,
                                    opacity: `${0.5 + (count / maxTagCount) * 0.5}`,
                                }}
                            >
                                {tag} ({count})
                            </span>
                        ))}
                    </div>
                    {tagFrequencies.length === 0 && (
                        <p className="empty-chart-message">Add tags to your dreams to build your cloud!</p>
                    )}
                </div>

                <div className="stats-card">
                    <h2>Recent Mood Trend</h2>
                    {dreams.length > 0 ? (
                        <MoodChart dreams={dreams} />
                    ) : (
                        <p className="empty-chart-message">Log some dreams to see your mood trend.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default StatsPage;