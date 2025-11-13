
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ContentDisplay } from './components/ContentDisplay';
import { SparkIcon } from './components/icons/SparkIcon';
import { generateSuggestion, submitLead } from './services/geminiService';
import { ContactForm } from './components/ContactForm';
import { UserIcon } from './components/icons/UserIcon';
import { SendIcon } from './components/icons/SendIcon';

type Page = 'Home' | 'SEO' | 'PPC' | 'Content Marketing' | 'Social Media' | 'Email Marketing' | 'Web Design' | 'Contact Us';

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
    const growthScore = scores.Growth || 0;
    const riskScore = scores.Risk || 0;
    const efficiencyScore = scores['Efficiency-Focused'] || 0;
    
    let personaParts: string[] = [];

    // Part 1: Expertise Level
    if (advancedScore > basicScore) personaParts.push('Advanced');
    else if (basicScore > advancedScore) personaParts.push('Basic');
    else personaParts.push('Strategic');

    // Part 2: Focus Area
    if (techScore > businessScore) personaParts.push('Technical');
    else if (businessScore > techScore) personaParts.push('Professional');
    else personaParts.push('Generalist');
    
    // Part 3: Mindset - Pick the most dominant
    const mindsets = [
        { name: 'Cost-Conscious', score: costScore },
        { name: 'Innovation-Driven', score: innovationScore },
        { name: 'Efficiency-Focused', score: efficiencyScore },
    ].sort((a, b) => b.score - a.score);

    if (mindsets[0].score > 0) {
        personaParts.push(mindsets[0].name);
    }
    
    // Part 4: Priority
    if (growthScore > riskScore + 1) personaParts.push('Growth-Oriented');
    else if (riskScore > growthScore + 1) personaParts.push('Risk-Averse');

    return personaParts.join(' ');
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Home');
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

  // State for the new email form in the suggestion widget
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');


  useEffect(() => {
    try {
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString(); // 30-day expiry
      // Set path=/ and the parent domain to be accessible across the site.
      // This is CRITICAL for sharing state between www.digigrowth.se and reco.digigrowth.se
      const options = `domain=.digigrowth.se; path=/; expires=${expires}; SameSite=Lax; Secure`;

      document.cookie = `${CLICK_HISTORY_COOKIE}=${encodeURIComponent(JSON.stringify(clickHistory))}; ${options}`;
      document.cookie = `${PERSONA_SCORES_COOKIE}=${encodeURIComponent(JSON.stringify(personaScores))}; ${options}`;
    } catch (error) {
      console.error("Failed to save to cookie", error);
    }
  }, [clickHistory, personaScores]);
  
  const dominantPersona = useMemo(() => calculateDominantPersona(personaScores), [personaScores]);

  const pageTitles: Record<Page, string> = useMemo(() => ({
    'Home': 'Welcome to the DigiGen Widget Simulator',
    'SEO': 'Search Engine Optimization',
    'PPC': 'Pay-Per-Click Advertising',
    'Content Marketing': 'Content Marketing Strategy',
    'Social Media': 'Social Media Management',
    'Email Marketing': 'Email Marketing Automation',
    'Web Design': 'Modern Web Design & Development',
    'Contact Us': 'Get in Touch'
  }), []);

  const standardContent: Record<Page, string> = useMemo(() => ({
    'Home': '', // Home page has its own component
    'SEO': `## Mastering Search Engine Optimization\n\nSearch Engine Optimization (SEO) is the cornerstone of digital visibility. At DigiGen, we focus on a holistic approach that combines technical excellence, high-quality content, and strategic backlinking to elevate your website's ranking on search engines like Google. Our goal is to drive **organic traffic** that converts.\n\n* **Technical SEO:** We ensure your site is perfectly structured for search engine crawlers.\n* **Content Strategy:** We create content that not only ranks but also engages your target audience.\n* **Link Building:** We build authoritative and relevant links to boost your site's credibility.`,
    'PPC': `## Driving Results with Pay-Per-Click\n\nPay-Per-Click (PPC) advertising offers immediate visibility and highly targeted traffic. Our team at DigiGen designs and manages campaigns across platforms like Google Ads and Bing Ads to maximize your return on investment (ROI). We focus on **data-driven decisions** to continuously optimize your ad spend.\n\n* **Keyword Research:** We identify the most profitable keywords for your business.\n* **Ad Copywriting:** We craft compelling ads that grab attention and encourage clicks.\n* **Landing Page Optimization:** We ensure your landing pages are designed to convert visitors into customers.`,
    'Content Marketing': `## Engage and Convert with Content Marketing\n\nContent is king, and a well-executed strategy is its kingdom. We develop comprehensive content marketing strategies that attract, engage, and convert your target audience. From blog posts to whitepapers, we create valuable content that establishes you as an industry leader.\n\n* **SEO-Driven Content:** All our content is created with search engine visibility in mind.\n* **Multi-Format Content:** We produce blog articles, case studies, and infographics to engage your audience.\n* **Content Distribution:** We ensure your content reaches the right people through strategic promotion.`,
    'Social Media': `## Amplify Your Brand with Social Media\n\nSocial media is more than just posting updates; it's about building a community. Our experts at DigiGen create and manage impactful social media strategies that foster engagement, build brand loyalty, and drive business growth.\n\n* **Platform Strategy:** We select the right platforms for your brand, from Instagram to LinkedIn.\n* **Content Creation:** We design visually stunning and shareable content that resonates with your audience.\n* **Community Management:** We engage with your followers to build a loyal and active community.`,
    'Email Marketing': `## Nurture Leads with Email Marketing\n\nDirectly engage your audience with powerful email marketing campaigns. We specialize in creating automated workflows and personalized email content that nurtures leads through the sales funnel, turning subscribers into loyal customers.\n\n* **Automation Workflows:** We set up "drip" campaigns that deliver the right message at the right time.\n* **Personalization:** We segment your audience to deliver highly relevant and effective content.\n* **Performance Analytics:** We track open rates and conversions to constantly improve performance.`,
    'Web Design': `## Captivate Your Audience with Stunning Web Design\n\nA beautiful and functional website is your most important digital asset. At DigiGen, we design and develop user-centric websites that are not only visually appealing but also optimized for performance, mobile devices, and conversions.\n\n* **UI/UX Design:** We craft intuitive user interfaces and seamless user experiences.\n* **Responsive Development:** Your website will look perfect on any device, from desktops to smartphones.\n* **Conversion Rate Optimization (CRO):** We design with the end goal in mind: turning visitors into customers.`,
    'Contact Us': '' // This page will be rendered by the ContactForm component
  }), []);


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

  const handleLinkClick = useCallback(async (link: SiteLink) => {
    setCurrentPage(link.page);
    setContentKey(prev => prev + 1);

    const newHistory = [...clickHistory, link.context];
    setClickHistory(newHistory);

    const newScores = { ...personaScores };
    for (const [key, value] of Object.entries(link.personaClues)) {
        newScores[key as PersonaDimension] = (newScores[key as PersonaDimension] || 0) + value;
    }
    setPersonaScores(newScores);
    
    // Generate suggestion after the second click
    if (newHistory.length >= 2) {
      // **BUG FIX**: Calculate the new persona directly from `newScores` to avoid using stale state.
      const newDominantPersona = calculateDominantPersona(newScores);
      generateAndSetSuggestion(newHistory, newDominantPersona);
    }
    
  }, [clickHistory, personaScores, generateAndSetSuggestion]);

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    setContentKey(prev => prev + 1);
  };
  
  const handleSuggestionSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!suggestion || !email || isSubmittingSuggestion) return;

      setIsSubmittingSuggestion(true);
      setSubmissionMessage('');

      const payload = {
        email,
        suggestedArticle: suggestion.title,
        hook: suggestion.reason,
        subscribedToNewsletter: isSubscribed
      };

      try {
        await submitLead(payload);
        setSubmissionMessage(`Success! We've sent the article to ${email}.`);
        setEmail('');
      } catch (error) {
        console.error("Failed to submit lead:", error);
        const errorMessage = error instanceof Error ? error.message : "Could not send your request. Please try again.";
        setSubmissionMessage(`Error: ${errorMessage}`);
      } finally {
        setIsSubmittingSuggestion(false);
        // Hide the message after a few seconds
        setTimeout(() => setSubmissionMessage(''), 5000);
      }
  };


  const HomeContent = () => (
    <div className="text-center animate-fadeIn min-h-[60vh] flex flex-col justify-center items-center">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <h1 className="text-5xl md:text-7xl font-extrabold mb-4 text-gray-100 bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light animate-gradient">
        Personalized "Next Read" Widget
      </h1>
      <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
        This is a simulation of our intelligent widget. On a real website, this would be injected via GTM. As you click on articles in the sidebar, the widget will analyze your behavior and persona to suggest the most relevant next article for you to read.
      </p>
      <p className="text-gray-400 mb-6 font-semibold">Start by clicking an article on the right to simulate your reading journey.</p>
    </div>
  );

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