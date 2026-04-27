import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, Loader2, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MODEL_OPTIONS = [
  { id: 'azure', label: 'GPT 5.4 Mini', provider: 'Azure OpenAI', color: 'from-emerald-500 to-teal-500', badge: 'bg-emerald-100 text-emerald-700' },
  { id: 'gemini', label: 'Gemini 3.1 Flash Lite Preview', provider: 'Google', color: 'from-blue-500 to-cyan-500', badge: 'bg-blue-100 text-blue-700' },
];

const Chatbot = () => {
  const { userInfo } = useAuth();

  const initializeMessages = () => {
    try {
      const saved = sessionStorage.getItem('chatbotMessages');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{ sender: 'bot', text: 'Halo! Saya MateBot, asisten virtual Anda. Ada yang bisa saya bantu?', model: 'azure' }];
  };

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initializeMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('azure');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const chatEndRef = useRef(null);
  const dropdownRef = useRef(null);

  const currentModel = MODEL_OPTIONS.find(m => m.id === selectedModel);

  useEffect(() => {
    if (!userInfo) {
      sessionStorage.removeItem('chatbotMessages');
      setMessages([{ sender: 'bot', text: 'Halo! Saya MateBot, asisten virtual Anda. Ada yang bisa saya bantu?', model: 'azure' }]);
    }
  }, [userInfo]);

  useEffect(() => {
    try { sessionStorage.setItem('chatbotMessages', JSON.stringify(messages)); } catch {}
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowModelDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !userInfo) return;
    const userMessage = { sender: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const historyForAPI = newMessages
        .filter(msg => msg.text !== 'Maaf, terjadi kesalahan. Coba lagi nanti.')
        .map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text }));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/chatbot`, { prompt: input, history: historyForAPI, model: selectedModel }, config);
      setMessages(prev => [...prev, { sender: 'bot', text: data.response, model: data.model || selectedModel }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Maaf, terjadi kesalahan. Coba lagi nanti.', model: selectedModel }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (!userInfo) return null;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 right-5 w-14 h-14 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl flex items-center justify-center z-50 transition-shadow"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 right-0 w-full h-[85vh] rounded-t-2xl md:bottom-24 md:right-5 md:w-[400px] md:h-[520px] md:rounded-2xl bg-white shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-4 py-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">MateBot</h3>
                    <p className="text-[10px] text-white/70">Asisten AI</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Model Selector */}
              <div className="mt-2 relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-lg text-xs text-white/90 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentModel.color}`} />
                    <span className="font-medium">{currentModel.label}</span>
                    <span className="text-[10px] text-white/60">({currentModel.provider})</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showModelDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-10"
                    >
                      {MODEL_OPTIONS.map(model => (
                        <button
                          key={model.id}
                          onClick={() => { setSelectedModel(model.id); setShowModelDropdown(false); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                            selectedModel === model.id ? 'bg-primary-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${model.color}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold ${selectedModel === model.id ? 'text-primary-700' : 'text-gray-700'}`}>
                              {model.label}
                            </p>
                            <p className="text-[10px] text-gray-400">{model.provider}</p>
                          </div>
                          {selectedModel === model.id && (
                            <div className="w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 space-y-3">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className="max-w-[75%]">
                    <div className={`px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-2xl rounded-br-md'
                        : 'bg-white border border-gray-100 text-gray-700 rounded-2xl rounded-bl-md shadow-sm'
                    }`}>
                      {msg.sender === 'bot' ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 mb-1.5">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 mb-1.5">{children}</ol>,
                            li: ({ children }) => <li className="text-sm">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            code: ({ inline, children }) =>
                              inline
                                ? <code className="bg-gray-100 text-primary-700 text-xs px-1.5 py-0.5 rounded font-mono">{children}</code>
                                : <pre className="bg-gray-100 text-xs p-2.5 rounded-lg overflow-x-auto my-1.5 font-mono"><code>{children}</code></pre>,
                            a: ({ href, children }) => (
                              <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline hover:text-primary-800">
                                {children}
                              </a>
                            ),
                            h1: ({ children }) => <p className="font-bold text-gray-900 mb-1">{children}</p>,
                            h2: ({ children }) => <p className="font-bold text-gray-900 mb-1">{children}</p>,
                            h3: ({ children }) => <p className="font-semibold text-gray-900 mb-0.5">{children}</p>,
                            blockquote: ({ children }) => <blockquote className="border-l-2 border-primary-300 pl-3 text-gray-500 italic my-1.5">{children}</blockquote>,
                            hr: () => <hr className="border-gray-200 my-2" />,
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      ) : (
                        msg.text
                      )}
                    </div>
                    {/* Model badge for bot messages */}
                    {msg.sender === 'bot' && msg.model && (
                      <div className="mt-1 ml-1">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                          msg.model === 'azure' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            msg.model === 'azure' ? 'bg-emerald-400' : 'bg-blue-400'
                          }`} />
                          {msg.model === 'azure' ? 'GPT 5.4 Mini' : 'Gemini'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center mr-2 flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md shadow-sm px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-100 bg-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={onKeyPress}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                  placeholder="Ketik pesan..."
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl flex items-center justify-center hover:shadow-lg disabled:opacity-50 transition-all flex-shrink-0"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
