
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ContentDisplay } from './components/ContentDisplay';
import { SparkIcon } from './components/icons/SparkIcon';
import { generateSuggestion, submitLead } from './services/geminiService';
import { ContactForm } from './components/ContactForm';
import { WidgetSidebar } from './components/WidgetSidebar';
import { EmbedInstructions } from './components/EmbedInstructions';

type Page = 'Home' | 'SEO' | 'PPC' | 'Content Marketing' | 'Social Media' | 'Email Marketing' | 'Web Design' | 'Contact Us';
type WidgetMode = 'simulator' | 'embedded';

type PersonaDimension = 'Business' | 'Tech' | 'Basic' | 'Advanced' | 'Cost-Conscious' | 'Innovation' | 'Growth' | 'Risk' | 'Efficiency-Focused';
type PersonaScores = Partial<Record<PersonaDimension, number>>;

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

// Helper function to read a cookie
const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            const value = c.substring(nameEQ.length, c.length);
            try {
                // The value is a URI encoded JSON string. We decode it here.
                return decodeURIComponent(value);
            } catch (e) {
                console.warn(`Could not decode cookie "${name}".`, value);
                return value; // Return raw value if decoding fails
            }
        }
    }
    return null;
};

// Helper to get the parent domain for sharing cookies across subdomains.
const getParentDomain = () => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost') {
        return 'localhost';
    }
    const parts = hostname.split('.');
    if (parts.length > 1) {
        return `.${parts.slice(-2).join('.')}`;
    }
    return hostname;
};


const CLICK_HISTORY_COOKIE = 'dg_hist';
const PERSONA_SCORES_COOKIE = 'dg_ps';

const calculateDominantPersona = (scores: PersonaScores): string => {
    if (Object.keys(scores).length === 0) return "New Visitor";

    const businessScore = scores.Business || 0;
    const techScore = scores.Tech || 0;
    const basicScore = scores.Basic || 0;
    const advancedScore = scores.Advanced || 0;
    const costScore = scores['Cost-Conscious'] || 0;
    const innovationScore = scores.Innovation || 0;
    
    let personaParts: string[] = [];

    if (advancedScore > basicScore) personaParts.push('Advanced');
    else if (basicScore > advancedScore) personaParts.push('Basic');
    else personaParts.push('Strategic');

    if (techScore > businessScore) personaParts.push('Technical');
    else if (businessScore > techScore) personaParts.push('Professional');
    else personaParts.push('Generalist');
    
    const mindsets = [
        { name: 'Cost-Conscious', score: costScore },
        { name: 'Innovation-Driven', score: innovationScore },
    ].sort((a, b) => b.score - a.score);

    if (mindsets[0].score > 0) {
        personaParts.push(mindsets[0].name);
    }
    
    return personaParts.join(' ');
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Home');
  const [widgetMode, setWidgetMode] = useState<WidgetMode>('simulator');
  const [clickHistory, setClickHistory] = useState<string[]>(() => {
    try {
      const saved = getCookie(CLICK_HISTORY_COOKIE);
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  const [personaScores, setPersonaScores] = useState<PersonaScores>(() => {
    try {
        const saved = getCookie(PERSONA_SCORES_COOKIE);
        return saved ? JSON.parse(saved) : {};
    } catch(e) { return {}; }
  });

  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [contentKey, setContentKey] = useState(0);

  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [apiHost, setApiHost] = useState('');

  const dominantPersona = useMemo(() => calculateDominantPersona(personaScores), [personaScores]);

  const links: SiteLink[] = useMemo(() => [
    { text: 'Calculating ROI on Content Marketing', page: 'Content Marketing', context: 'A guide on measuring the return on investment for content strategies.', personaClues: { Business: 2, Basic: 1, 'Cost-Conscious': 2, Risk: 2 } },
    { text: 'PPC Campaign Budgeting for SMBs', page: 'PPC', context: 'A framework for small-to-medium businesses to budget for PPC campaigns.', personaClues: { Business: 2, Basic: 1, 'Cost-Conscious': 3, Risk: 2 } },
    { text: 'Social Media Strategy for Brand Awareness', page: 'Social Media', context: 'How to leverage social platforms to increase brand visibility and recall.', personaClues: { Business: 1, Basic: 2, Growth: 2 } },
    { text: 'Technical SEO: Crawl Budget Optimization', page: 'SEO', context: 'Advanced techniques for optimizing how search engines crawl large websites.', personaClues: { Tech: 2, Advanced: 1, Innovation: 1, 'Efficiency-Focused': 3 } },
    { text: 'Web Design with Headless CMS', page: 'Web Design', context: 'Architecting modern websites using a headless CMS and JAMstack principles.', personaClues: { Tech: 2, Advanced: 2, Innovation: 3, Growth: 2 } },
    { text: 'Advanced Email Automation with APIs', page: 'Email Marketing', context: 'Using APIs to create highly dynamic and personalized email marketing workflows.', personaClues: { Tech: 1, Advanced: 2, Innovation: 2, 'Efficiency-Focused': 2 } },
  ], []);
  
  const generateAndSetSuggestion = useCallback(async (history: string[], persona: string) => {
    setIsLoading(true);
    setError(null);
    setSuggestion(null);
    setSubmissionMessage('');

    const availableArticleTitles = links
        .filter(l => !history.includes(l.context))
        .map(l => l.text);
    
    if (availableArticleTitles.length === 0) {
        setIsLoading(false);
        return;
    }

    try {
        const result = await generateSuggestion(history, persona, availableArticleTitles);
        if (result && result.suggestion) {
            setSuggestion(result.suggestion);
        } else {
            setError("Could not generate a suggestion at this time.");
        }
    } catch(err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(`Sorry, we couldn't generate a suggestion. Error: ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [links]);

  const trackUserInteraction = useCallback((context: string, personaClues: PersonaScores) => {
    // Prevent tracking the same article if it's already in the history from the cookie
    setClickHistory(prevHistory => {
      if (prevHistory.includes(context)) {
        console.log("DigiGen Widget: Context already tracked, skipping.", context);
        return prevHistory;
      }
      
      const newHistory = [...prevHistory, context];
  
      setPersonaScores(prevScores => {
        const newScores = { ...prevScores };
        for (const [key, value] of Object.entries(personaClues)) {
            newScores[key as PersonaDimension] = (newScores[key as PersonaDimension] || 0) + value;
        }
        
        // The dominant persona is calculated from the new scores.
        const newDominantPersona = calculateDominantPersona(newScores);
        
        // Generate suggestion if there's enough history.
        if (newHistory.length >= 2) {
          generateAndSetSuggestion(newHistory, newDominantPersona);
        }

        return newScores;
      });

      return newHistory;
    });

  }, [generateAndSetSuggestion]);

  // This hook runs once on mount to configure the widget.
  useEffect(() => {
    const rootElement = document.getElementById('root');
    if (!rootElement) return;

    // Step 1: Determine API Host for embed instructions and cross-domain check.
    const apiHostValue = rootElement.getAttribute('data-api-host') || `${window.location.protocol}//${window.location.host}`;
    setApiHost(apiHostValue);

    // Step 2: Determine Widget Mode.
    // The widget is only in "embedded" mode if the attribute is set AND the page host
    // is different from the API host. This prevents the simulator UI from breaking
    // when testing with embed attributes on the simulator domain.
    const isDifferentHost = new URL(apiHostValue).host !== window.location.host;
    const declaredModeIsEmbedded = rootElement.getAttribute('data-widget-mode') === 'embedded';

    if (declaredModeIsEmbedded && isDifferentHost) {
      setWidgetMode('embedded');
    } else {
      setWidgetMode('simulator');
    }

    // Step 3: Automatically track page view if data is present.
    // This now runs REGARDLESS of mode, allowing developers to test the auto-tracking
    // feature directly on the simulator by adding attributes to the HTML.
    const context = rootElement.getAttribute('data-page-context');
    const cluesString = rootElement.getAttribute('data-persona-clues');

    if (context && cluesString) {
      try {
        const personaClues = JSON.parse(cluesString);
        console.log('DigiGen Widget: Auto-tracking page view from data attributes.', { context, personaClues });
        trackUserInteraction(context, personaClues);
      } catch (e) {
        console.error("DigiGen Widget Error: Could not parse 'data-persona-clues' JSON.", e);
      }
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // This effect should only run once on mount.

  // Save state to cookies whenever it changes
  useEffect(() => {
    try {
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString(); // 30-day expiry
      const parentDomain = getParentDomain();
      const options = `domain=${parentDomain}; path=/; expires=${expires}; SameSite=Lax; Secure`;

      document.cookie = `${CLICK_HISTORY_COOKIE}=${encodeURIComponent(JSON.stringify(clickHistory))}; ${options}`;
      document.cookie = `${PERSONA_SCORES_COOKIE}=${encodeURIComponent(JSON.stringify(personaScores))}; ${options}`;
    } catch (error) {
      console.error("Failed to save to cookie", error);
    }
  }, [clickHistory, personaScores]);
  
  // For simulator UI only
  const handleLinkClick = useCallback(async (link: SiteLink) => {
    setCurrentPage(link.page);
    setContentKey(prev => prev + 1);
    trackUserInteraction(link.context, link.personaClues);
  }, [trackUserInteraction]);

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    setContentKey(prev => prev + 1);
  };
  
  const handleSuggestionSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!suggestion || !email || isSubmittingSuggestion) return;
      setIsSubmittingSuggestion(true);
      setSubmissionMessage('');
      const payload = { email, suggestedArticle: suggestion.title, hook: suggestion.reason, subscribedToNewsletter: isSubscribed };
      try {
        await submitLead(payload);
        setSubmissionMessage(`Tack! Vi har skickat artikeln till ${email}.`);
        setEmail('');
        // Save success state in cookie so form stays hidden
        document.cookie = `dg_submitted=true; path=/; max-age=${30 * 24 * 60 * 60}; domain=.${window.location.hostname.replace('www.', '')}; SameSite=Lax`;
      } catch (error) {
        console.error("Failed to submit lead:", error);
        const errorMessage = error instanceof Error ? error.message : "Could not send your request. Please try again.";
        setSubmissionMessage(`Error: ${errorMessage}`);
      } finally {
        setIsSubmittingSuggestion(false);
      }
  };

  const pageTitles: Record<Page, string> = useMemo(() => ({'Home': 'Welcome to the DigiGen Widget Simulator', 'SEO': 'Search Engine Optimization', 'PPC': 'Pay-Per-Click Advertising', 'Content Marketing': 'Content Marketing Strategy', 'Social Media': 'Social Media Management', 'Email Marketing': 'Email Marketing Automation', 'Web Design': 'Modern Web Design & Development', 'Contact Us': 'Get in Touch'}), []);
  const standardContent: Record<Page, string> = useMemo(() => ({'Home': '', 'SEO': `## Mastering Search Engine Optimization\n\nSEO is the cornerstone of digital visibility. We focus on a holistic approach that combines technical excellence, high-quality content, and strategic backlinking to elevate your website's ranking on search engines.`, 'PPC': `## Driving Results with Pay-Per-Click\n\nPPC advertising offers immediate visibility and highly targeted traffic. Our team designs and manages campaigns across platforms like Google Ads to maximize your return on investment (ROI).`, 'Content Marketing': `## Engage and Convert with Content Marketing\n\nContent is king. We develop comprehensive content marketing strategies that attract, engage, and convert your target audience, from blog posts to whitepapers.`, 'Social Media': `## Amplify Your Brand with Social Media\n\nSocial media is about building a community. We create and manage impactful strategies that foster engagement, build brand loyalty, and drive business growth.`, 'Email Marketing': `## Nurture Leads with Email Marketing\n\nDirectly engage your audience with powerful email marketing campaigns. We specialize in creating automated workflows and personalized content that turns subscribers into loyal customers.`, 'Web Design': `## Captivate Your Audience with Stunning Web Design\n\nA beautiful, functional website is your most important digital asset. We design and develop user-centric websites optimized for performance, mobile devices, and conversions.`, 'Contact Us': ''}), []);

  const HomeContent = () => (
    <div className="text-center animate-fadeIn min-h-[60vh] flex flex-col justify-center items-center">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <h1 className="text-5xl md:text-7xl font-extrabold mb-4 text-gray-100 bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light animate-gradient">
        Personalized "Next Read" Widget
      </h1>
      <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
        This is a simulation of our intelligent widget. On a real website, this would be injected via GTM or a script tag. As you click on articles in the sidebar, the widget will analyze your behavior and persona to suggest the most relevant next article for you to read.
      </p>
      <div className="w-full max-w-4xl mx-auto mt-8">
        <EmbedInstructions apiHost={apiHost} />
      </div>
      <p className="text-gray-400 mt-12 font-semibold">Or, continue the simulation by clicking an article on the right.</p>
    </div>
  );

  const sidebarProps = {
    widgetMode, links, clickHistory, handleLinkClick, dominantPersona, isLoading, error, suggestion, submissionMessage, email, setEmail, handleSuggestionSubmit, isSubmittingSuggestion, isSubscribed, setIsSubscribed
  };

  // EMBEDDED MODE: Render only the widget sidebar.
  if (widgetMode === 'embedded') {
    return (
      <div className="max-w-md mx-auto p-4">
          <WidgetSidebar {...sidebarProps} />
      </div>
    );
  }

  // SIMULATOR MODE: Render the full-featured demo page.
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 py-4 px-6 bg-dark-800/30 backdrop-blur-lg rounded-xl border border-dark-700/50 sticky top-4 z-50 animate-fadeIn">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('Home')}>
            <SparkIcon className="w-8 h-8 text-primary"/>
            <h1 className="text-3xl font-bold tracking-tighter">DigiGen Simulator</h1>
          </div>
          <p className="hidden md:block text-gray-400">Demonstrating AI-Powered Content Suggestion</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 animate-fadeIn" style={{ animationDelay: '200ms' }}>
            {currentPage === 'Contact Us' ? (
              <ContactForm />
            ) : (
              <ContentDisplay
                key={contentKey}
                title={pageTitles[currentPage]}
                content={standardContent[currentPage]}
                isHome={currentPage === 'Home'}
                homeContent={<HomeContent />}
              />
            )}
          </div>
          <aside className="lg:col-span-1 animate-fadeIn" style={{ animationDelay: '100ms' }}>
            <div className="sticky top-28 space-y-6">
              <WidgetSidebar {...sidebarProps} />
            </div>
          </aside>
        </main>

        <footer className="text-center mt-12 py-6 border-t border-dark-700/50 text-gray-500">
          <p>&copy; {new Date().getFullYear()} DigiGen. Personalized by Gemini.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
