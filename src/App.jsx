import React, { useEffect, useState } from 'react';
import H5PPlayer from './components/H5PPlayer';
import useXapiTracker from './hooks/useXapiTracker';
import './App.css';
import { H5P_ACTIVITIES, H5P_CONTENT_BASE } from './config/h5pActivities';


function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Toggle color theme"
      onClick={onToggle}
    >
      {theme === 'dark' ? '🌞 Light' : '🌙 Dark'}
    </button>
  );
}



export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('demo-theme') || 'dark');
  const [zoom, setZoom] = useState(1);

  // Initialize xAPI tracking
  const { getRecords, getProgressSummary, isListening } = useXapiTracker();

  useEffect(() => {
    document.body.classList.toggle('theme-light', theme === 'light');
    localStorage.setItem('demo-theme', theme);
  }, [theme]);

  // Log xAPI tracking status for debugging
  useEffect(() => {
    console.log('[App] xAPI Tracking Status:', { isListening });
    if (isListening) {
      console.log('[App] xAPI Records:', getRecords().length, 'statements');
      console.log('[App] Progress Summary:', getProgressSummary());
    }
  }, [isListening, getRecords, getProgressSummary]);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5));



  return (
    <>
  <a href="#main" className="skip-link">Skip to content</a>
      <nav className="site-nav" aria-label="Main navigation" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="brand">Entrepreneur Legacy Quick Awareness</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            aria-label="Zoom In"
            style={{ fontSize: 18, marginRight: 4 }}
            onClick={handleZoomIn}
          >+
          </button>
          <button
            type="button"
            aria-label="Zoom Out"
            style={{ fontSize: 18, marginRight: 12 }}
            onClick={handleZoomOut}
          >−
          </button>
          <ThemeToggle
            theme={theme}
            onToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          />
        </div>
      </nav>
  <main id="main" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
        


        {H5P_ACTIVITIES.map(activity => (
          <section key={activity.slug} id={activity.slug} className="h5p-wrapper full-bleed" aria-labelledby={`${activity.slug}-heading`}>
            <div className="h5p-header-row">
              <h2 id={`${activity.slug}-heading`}>{activity.title}</h2>
              <p className="activity-summary">{activity.summary}</p>
              
            </div>
            <H5PPlayer
              h5pPath={`${H5P_CONTENT_BASE}/${activity.slug}`}
              embedType={activity.embedType || 'iframe'}
              debug={activity.debug || false}
            />
          </section>
        ))}

       

        <footer className="footer">Koha Digital H5P Quiz</footer>
      </main>
    </>
  );
}
