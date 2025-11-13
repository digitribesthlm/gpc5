
import React, { useState } from 'react';

export const ContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitMessage('');

    // Log form data to the console as requested
    console.log({
      name,
      email,
      message,
    });
    
    // Simulate an API call for better UX
    setTimeout(() => {
        setIsSubmitting(false);
        setSubmitMessage('Your message has been sent! We will get back to you shortly.');
        setName('');
        setEmail('');
        setMessage('');
        // Hide the message after a few seconds
        setTimeout(() => setSubmitMessage(''), 4000);
    }, 1000);
  };

  return (
    <div className="bg-dark-800/30 backdrop-blur-lg rounded-lg shadow-lg p-6 md:p-8 min-h-[60vh] flex flex-col border border-dark-700/50 transition-all duration-300 animate-fadeIn">
      <h1 className="text-4xl font-bold text-gray-200 mb-6 pb-4 border-b border-dark-700/50">Get in Touch</h1>
      <p className="mb-8 text-gray-300">
        Have a project in mind or just want to say hello? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-dark-700/50 border border-dark-700 rounded-md px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light transition-all duration-200"
            placeholder="Your Name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-dark-700/50 border border-dark-700 rounded-md px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light transition-all duration-200"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Message</label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="w-full bg-dark-700/50 border border-dark-700 rounded-md px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light transition-all duration-200"
            placeholder="How can we help you?"
          />
        </div>
        <div className="flex items-center justify-between">
            <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-primary to-secondary hover:from-primary-light hover:to-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
                {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
            {submitMessage && (
                <p className="text-green-400 text-sm animate-fadeIn">{submitMessage}</p>
            )}
        </div>
      </form>
    </div>
  );
};