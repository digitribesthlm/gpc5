
import React from 'react';
import { UserIcon } from './icons/UserIcon';
import { SendIcon } from './icons/SendIcon';

// Define types for props for better type safety and clarity
type PersonaDimension = 'Business' | 'Tech' | 'Basic' | 'Advanced' | 'Cost-Conscious' | 'Innovation' | 'Growth' | 'Risk' | 'Efficiency-Focused';
type PersonaScores = Partial<Record<PersonaDimension, number>>;
type Page = 'Home' | 'SEO' | 'PPC' | 'Content Marketing' | 'Social Media' | 'Email Marketing' | 'Web Design' | 'Contact Us';

interface SiteLink {
  text: string;
  page: Page;
  context: string;
  personaClues: PersonaScores;
}

interface Suggestion {
  title: string;
  reason: string;
}

interface WidgetSidebarProps {
  widgetMode: 'simulator' | 'embedded';
  links: SiteLink[];
  clickHistory: string[];
  handleLinkClick: (link: SiteLink) => void;
  dominantPersona: string;
  isLoading: boolean;
  error: string | null;
  suggestion: Suggestion | null;
  submissionMessage: string;
  email: string;
  setEmail: (email: string) => void;
  handleSuggestionSubmit: (e: React.FormEvent) => void;
  isSubmittingSuggestion: boolean;
  isSubscribed: boolean;
  setIsSubscribed: (isSubscribed: boolean) => void;
}


export const WidgetSidebar: React.FC<WidgetSidebarProps> = ({
  widgetMode,
  links,
  clickHistory,
  handleLinkClick,
  dominantPersona,
  isLoading,
  error,
  suggestion,
  submissionMessage,
  email,
  setEmail,
  handleSuggestionSubmit,
  isSubmittingSuggestion,
  isSubscribed,
  setIsSubscribed,
}) => {
  return (
    <div>
        {/* This section is only shown in the simulator mode */}
        {widgetMode === 'simulator' && (
            <div style={{
              background: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: '#212529'
                }}>Simulate Reading an Article</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {links.map((link) => (
                    <button
                        key={link.text}
                        onClick={() => handleLinkClick(link)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          fontWeight: clickHistory.includes(link.context) ? '600' : '400',
                          background: clickHistory.includes(link.context) ? '#0066cc' : '#e9ecef',
                          color: clickHistory.includes(link.context) ? 'white' : '#212529',
                          transition: 'all 0.2s'
                        }}
                    >
                        {link.text}
                    </button>
                    ))}
                </div>
            </div>
        )}

        {/* Profile detection removed for privacy */}
        
        {/* The suggestion widget appears after 2+ actions */}
        {clickHistory.length > 1 && (
        <div id="suggestion-widget">
            <h3>💡 AI Rekommenderar</h3>
            {isLoading && <p className="loading">Genererar din personliga rekommendation...</p>}
            {error && <div className="error-message">{error}</div>}
            {suggestion && !submissionMessage && (
                <div>
                    <h4>{suggestion.title}</h4>
                    <div className="recommendation-text">
                        {suggestion.reason}
                    </div>
                    <form onSubmit={handleSuggestionSubmit}>
                    <p style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Få artikeln direkt i din inkorg:</p>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Din e-postadress"
                        required
                    />
                    <button 
                        type="submit"
                        disabled={isSubmittingSuggestion}
                    >
                        {isSubmittingSuggestion ? 'Skickar...' : 'Skicka till min inkorg'}
                    </button>
                    <div className="checkbox-wrapper">
                        <input
                            id="subscribe"
                            name="subscribe"
                            type="checkbox"
                            checked={isSubscribed}
                            onChange={(e) => setIsSubscribed(e.target.checked)}
                        />
                        <label htmlFor="subscribe">
                            Ja, prenumerera på vårt veckovisa nyhetsbrev.
                        </label>
                        </div>
                    </form>
                </div>
            )}
            {submissionMessage && (
                <div className={submissionMessage.startsWith("Error") ? 'error-message' : 'success-message'}>
                    {submissionMessage}
                </div>
            )}
        </div>
        )}
    </div>
  );
};
