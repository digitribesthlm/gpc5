
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

        {/* Profile detection removed for privacy */}
        
        {/* The suggestion widget appears after 2+ actions */}
        {clickHistory.length > 1 && (
        <div id="suggestion-widget" className="relative bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl shadow-2xl p-8 border-4 border-white/20 animate-fadeIn overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">AI Rekommenderar</h3>
            </div>
            {isLoading && <p className="text-white/90 animate-pulse">Genererar din personliga rekommendation...</p>}
            {error && <p className="text-red-200 bg-red-500/20 p-3 rounded-lg">{error}</p>}
            {suggestion && !submissionMessage && (
                <div className="animate-fadeIn">
                    <h4 className="font-bold text-xl text-white mb-4">{suggestion.title}</h4>
                    <p className="mt-3 text-white/90 text-base italic border-l-4 border-white/50 pl-4 py-2 bg-white/10 rounded-r-lg">
                        "{suggestion.reason}"
                    </p>
                    <form onSubmit={handleSuggestionSubmit} className="mt-6 space-y-4">
                    <p className="text-sm text-white/90 font-medium">Få artikeln direkt i din inkorg:</p>
                    <div className="flex items-center gap-2">
                        <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Din e-postadress"
                        required
                        className="flex-grow w-full bg-white/95 border-2 border-white rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-200 font-medium"
                        />
                        <button 
                        type="submit"
                        disabled={isSubmittingSuggestion}
                        aria-label="Skicka till min inkorg"
                        className="flex-shrink-0 inline-flex items-center justify-center p-3 border-2 border-white rounded-lg shadow-lg text-purple-600 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                        >
                        {isSubmittingSuggestion ? (
                            <span className="w-5 h-5 block border-2 border-t-transparent border-purple-600 rounded-full animate-spin"></span>
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
                            className="h-4 w-4 rounded border-white text-purple-600 focus:ring-white bg-white/90"
                        />
                        <label htmlFor="subscribe" className="ml-2 block text-sm text-white/90">
                            Ja, prenumerera på vårt veckovisa nyhetsbrev.
                        </label>
                        </div>
                    </form>
                </div>
            )}
            {submissionMessage && (
                <div className={`text-center p-4 rounded-lg animate-fadeIn ${submissionMessage.startsWith("Error") ? 'bg-red-500/20 text-red-100 border-2 border-red-300' : 'bg-green-500/20 text-green-100 border-2 border-green-300'}`}>
                    <p className="font-semibold">{submissionMessage}</p>
                </div>
            )}
            </div>
        </div>
        )}
    </div>
  );
};
