import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Send,
  User,
  BrainCircuit,
  Terminal,
  Zap,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  Info,
  Activity,
} from 'lucide-react';

export default function AIAssistant() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: `Hello ${user?.full_name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Student'}! I'm UniHealth AI, your campus health companion. I'm here to help with symptoms, wellness advice, and health guidance. How are you feeling today?`
    }
  ]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [typingText, setTypingText] = useState('');
  const [suggestions, setSuggestions] = useState(['Check Symptoms', 'Headache Relief', 'Mental Wellness']);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingText]);

  const simulateTyping = (text) => {
    setLoading(false);
    let index = 0;
    setTypingText('');
    const interval = setInterval(() => {
      if (index < text.length) {
        setTypingText(prev => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
        setMessages(prev => [...prev, { role: 'bot', content: text }]);
        setTypingText('');
      }
    }, 15);
  };

  const handleSend = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const messageContent = textOverride || input;
    if (!messageContent.trim() || loading) return;

    const userMessage = { role: 'user', content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role:    m.role === 'bot' ? 'assistant' : 'user',
        content: m.content,
      }));
      history.push({ role: 'user', content: messageContent });

      const res = await axios.post('/ai/chat', { messages: history });
      simulateTyping(res.data.content);
      setSuggestions(res.data.suggestions || []);
    } catch (err) {
      console.error('AI Error:', err);
      setMessages(prev => [...prev, {
        role:    'bot',
        content: 'I encountered a synchronization error. Please ensure the backend server is active.'
      }]);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([messages[0]]);
    setSuggestions(['Check Symptoms', 'Headache Relief', 'Mental Wellness']);
  };

  return (
    <div
      className="flex flex-col bg-slate-900"
      style={{ height: '100dvh', paddingTop: 'var(--header-total)', paddingBottom: 'var(--nav-total)' }}
    >
      {/* Sub-header for AI info + reset */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-teal-500/20 rounded-lg flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white">UniHealth Pro AI</span>
              <span className="bg-teal-500/20 text-teal-400 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase">v4.0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Clinical Logic Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-emerald-400 text-[9px] font-black uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3" /> Secure
          </div>
          <button
            onClick={handleReset}
            className="p-2 bg-slate-800 border border-slate-700/60 text-slate-400 rounded-lg pressable"
            title="Reset conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Message list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`flex gap-2.5 max-w-[88%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>

              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                msg.role === 'bot'
                  ? 'bg-slate-800 border border-slate-700/60 text-teal-400'
                  : 'bg-teal-500 text-slate-950'
              }`}>
                {msg.role === 'bot'
                  ? <BrainCircuit className="w-4 h-4" />
                  : <User className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'bot'
                    ? 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700/60'
                    : 'bg-teal-500 text-slate-950 font-semibold rounded-tr-sm'
                }`}>
                  {msg.content.split('\n').map((line, idx) => (
                    <p key={idx} className={idx > 0 ? 'mt-2' : ''}>{line}</p>
                  ))}
                </div>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1 px-1">
                  {msg.role === 'bot' ? 'UniHealth AI' : 'You'} · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typingText && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex gap-2.5 max-w-[88%]">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/60 text-teal-400 flex items-center justify-center flex-shrink-0">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 bg-slate-800 border border-slate-700/60 rounded-2xl rounded-tl-sm text-sm leading-relaxed text-slate-200">
                {typingText}
                <span className="inline-block w-0.5 h-4 bg-teal-400 ml-0.5 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Loading dots */}
        {loading && !typingText && (
          <div className="flex justify-start">
            <div className="flex gap-2.5 items-center">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center">
                <Zap className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex gap-1.5 px-4 py-3 bg-slate-800 border border-slate-700/60 rounded-2xl rounded-tl-sm">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }} />
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }} />
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area — anchored above nav */}
      <div
        className="flex-shrink-0 border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-3"
      >
        {/* Suggestion chips */}
        {suggestions.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(null, s)}
                className="whitespace-nowrap px-3.5 py-2 bg-slate-800 border border-slate-700/60 rounded-full text-xs font-bold text-slate-300 hover:border-teal-500/50 hover:text-teal-400 transition-all pressable flex-shrink-0"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input row */}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1 bg-slate-800 border border-slate-700/60 rounded-2xl px-4 py-2.5 focus-within:border-teal-500 transition-colors">
            <Terminal className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your health concern..."
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none min-h-[28px]"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-11 h-11 bg-teal-500 text-slate-950 rounded-2xl flex items-center justify-center flex-shrink-0 pressable disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>

        {/* Disclaimer row */}
        <div className="flex items-center justify-center gap-4 mt-2.5 text-[9px] font-black text-slate-600 uppercase tracking-[0.15em]">
          <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-500" /> Neural v4.0</span>
          <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3 text-teal-500" /> Clinical AI</span>
          <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Educational Use</span>
        </div>
      </div>
    </div>
  );
}
