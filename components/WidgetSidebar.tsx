
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
    <div className="space-y-6">
        {/* This section is only shown in the simulator mode */}
        {widgetMode === 'simulator' && (
            <div className="bg-dark-800/30 backdrop-blur-lg rounded-lg shadow-lg p-6 border border-dark-700/50">
                <h2 className="text-2xl font-semibold mb-5 text-gray-200">Simulate Reading an Article</h2>
                <div className="space-y-3">
                    {links.map((link) => (
                    <button
                        key={link.text}
                        onClick={() => handleLinkClick(link)}
                        className={`group w-full text-left px-4 py-3 rounded-md transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 focus:ring-offset-dark-800
                        ${clickHistory.includes(link.context) ? 'bg-primary/80 text-white font-semibold shadow-lg' : 'bg-dark-700/50 text-gray-300 hover:bg-primary/50 hover:text-white hover:shadow-md hover:-translate-y-1'}`}
                    >
                        <p className="font-semibold">{link.text}</p>
                    </button>
                    ))}
                </div>
            </div>
        )}

        {/* This section is shown once a user action has been tracked */}
        {clickHistory.length > 0 && (
            <div className="bg-dark-800/30 backdrop-blur-lg rounded-lg shadow-lg p-6 border border-dark-700/50">
                <h3 className="flex items-center text-xl font-semibold mb-4 text-gray-200">
                    <UserIcon className="w-6 h-6 mr-3 text-primary-light" />
                    Detected Profile
                </h3>
                <div className="text-center bg-dark-900/50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-secondary animate-fadeIn">{dominantPersona}</p>
                </div>
            </div>
        )}
        
        {/* The suggestion widget appears after 2+ actions */}
        {clickHistory.length > 1 && (
        <div id="suggestion-widget" className="bg-gradient-to-br from-primary/30 to-secondary/30 backdrop-blur-lg rounded-lg shadow-2xl p-6 border border-primary/50 animate-fadeIn">
            <h3 className="text-xl font-bold mb-4 text-white">Your Personal AI Recommendation</h3>
            {isLoading && <p className="text-gray-300 animate-pulse">Generating your personal hook...</p>}
            {error && <p className="text-red-400">{error}</p>}
            {suggestion && !submissionMessage && (
                <div className="animate-fadeIn">
                    <h4 className="font-semibold text-lg text-gray-100">{suggestion.title}</h4>
                    <p className="mt-3 text-gray-200 text-sm italic border-l-2 border-secondary/50 pl-3">
                        "{suggestion.reason}"
                    </p>
                    <form onSubmit={handleSuggestionSubmit} className="mt-5 space-y-4">
                    <p className="text-xs text-gray-300">Get this article and subscribe for more insights from DigiGen.</p>
                    <div className="flex items-center gap-2">
                        <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="flex-grow w-full bg-dark-700/50 border border-dark-700 rounded-md px-4 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light transition-all duration-200"
                        />
                        <button 
                        type="submit"
                        disabled={isSubmittingSuggestion}
                        aria-label="Send to my Inbox"
                        className="flex-shrink-0 inline-flex items-center justify-center p-3 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                        >
                        {isSubmittingSuggestion ? (
                            <span className="w-5 h-5 block border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                        ) : (
                            <SendIcon className="w-5 h-5"/>
                        )}
                        </button>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="subscribe"
                            name="subscribe"
                            type="checkbox"
                            checked={isSubscribed}
                            onChange={(e) => setIsSubscribed(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary bg-dark-700/50"
                        />
                        <label htmlFor="subscribe" className="ml-2 block text-xs text-gray-300">
                            Yes, subscribe me to the weekly newsletter.
                        </label>
                        </div>
                    </form>
                </div>
            )}
            {submissionMessage && (
                <div className={`text-center p-3 rounded-lg animate-fadeIn ${submissionMessage.startsWith("Error") ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                    <p className="font-semibold text-sm">{submissionMessage}</p>
                </div>
            )}
        </div>
        )}
    </div>
  );
};
