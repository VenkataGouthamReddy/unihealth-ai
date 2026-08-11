import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Activity, 
  ArrowLeft, 
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  Info,
  ChevronRight,
  BrainCircuit,
  Terminal,
  Zap
} from 'lucide-react';

export default function AIAssistant() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'bot', content: `Hello ${user?.full_name?.split(' ')[0] || 'Student'}! I'm UniHealth AI, your specialized campus health companion. I'm powered by advanced medical datasets to help you with symptoms, wellness advice, and treatment guidance. How are you feeling today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [suggestions, setSuggestions] = useState(["Check Symptoms", "Headache Relief", "Mental Wellness"]);
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
        setTypingText((prev) => prev + text.charAt(index));
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
      // Create message history for backend
      const history = messages.map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.content
      }));
      history.push({ role: 'user', content: messageContent });

      const res = await axios.post('/ai/chat', { messages: history });
      simulateTyping(res.data.content);
      setSuggestions(res.data.suggestions || []);
    } catch (err) {
      console.error("AI Error:", err);
      setMessages(prev => [...prev, { role: 'bot', content: "I encountered a synchronization error. Please ensure the backend server is active." }]);
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#FDFDFF] flex flex-col overflow-hidden font-sans">
      {/* Professional AI Header */}
      <header className="glass px-8 py-5 flex justify-between items-center z-50 border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-5">
           <button 
              onClick={() => navigate('/student')}
              className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all active:scale-90"
           >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
           </button>
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-slate-900/10">
                 <BrainCircuit className="text-primary w-7 h-7" />
              </div>
              <div>
                 <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    UniHealth <span className="text-primary">Pro AI</span>
                    <span className="bg-primary/10 text-primary text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">v4.0</span>
                 </h1>
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinical Logic Online</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="hidden lg:flex items-center gap-4">
           <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Neural Link
           </div>
           <button 
              onClick={() => { setMessages([messages[0]]); setSuggestions(["Check Symptoms", "Headache Relief", "Mental Wellness"]); }}
              className="p-3 text-slate-400 hover:text-primary transition-all hover:bg-slate-50 rounded-xl"
              title="Reset Conversation"
           >
              <RefreshCw className="w-5 h-5" />
           </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full relative overflow-hidden">
        {/* Chat Interface */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-8 py-10 space-y-10 no-scrollbar"
        >
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className={`flex gap-5 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'bot' ? 'bg-slate-900 text-primary' : 'bg-primary text-white'}`}>
                  {msg.role === 'bot' ? <BrainCircuit className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>
                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                   <div className={`p-6 rounded-[2rem] text-sm leading-relaxed shadow-sm border ${
                     msg.role === 'bot' 
                     ? 'bg-white text-slate-700 rounded-tl-none border-slate-100' 
                     : 'bg-primary text-white rounded-tr-none border-primary/20'
                   }`}>
                     {msg.content.split('\n').map((line, idx) => (
                       <p key={idx} className={idx > 0 ? "mt-3" : ""}>{line}</p>
                     ))}
                   </div>
                   <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2 px-2">
                      {msg.role === 'bot' ? 'UniHealth Intelligence' : 'Authorized Student'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator / Text Simulation */}
          {typingText && (
            <div className="flex justify-start animate-in fade-in duration-300">
               <div className="flex gap-5 max-w-[85%]">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-primary flex items-center justify-center shrink-0 shadow-lg">
                     <BrainCircuit className="w-6 h-6" />
                  </div>
                  <div className="p-6 rounded-[2rem] rounded-tl-none bg-white text-slate-700 text-sm leading-relaxed border border-slate-100 shadow-sm">
                     {typingText}
                     <span className="inline-block w-1 h-4 bg-primary ml-1 animate-pulse"></span>
                  </div>
               </div>
            </div>
          )}

          {loading && !typingText && (
            <div className="flex justify-start animate-pulse">
               <div className="flex gap-5 items-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
                     <Zap className="w-5 h-5 text-slate-300" />
                  </div>
                  <div className="flex gap-2">
                     <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                     <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                     <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Input Area & Controls */}
        <div className="p-8 bg-gradient-to-t from-white via-white to-transparent">
          {/* Quick Suggestions */}
          <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar pb-2">
             {suggestions.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(null, s)}
                  className="whitespace-nowrap px-5 py-2.5 bg-slate-50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-slate-100 rounded-full text-xs font-bold text-slate-500 transition-all active:scale-95"
                >
                   {s}
                </button>
             ))}
          </div>

          <div className="bg-white p-2.5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center focus-within:ring-4 focus-within:ring-primary/5 transition-all group">
            <form onSubmit={handleSend} className="flex-1 flex items-center px-4">
              <div className="text-slate-300 mr-4 group-focus-within:text-primary transition-colors">
                 <Terminal className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your health concern or ask for advice..." 
                className="flex-1 bg-transparent border-none outline-none py-5 text-sm font-medium text-slate-800 placeholder:text-slate-400"
              />
              <button 
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-slate-900 text-white p-5 rounded-[1.75rem] shadow-xl hover:bg-primary hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
             <div className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-amber-500" /> Neural Model v4.0</div>
             <div className="flex items-center gap-2"><Stethoscope className="w-3.5 h-3.5 text-primary" /> Clinical Validation</div>
             <div className="flex items-center gap-2 text-slate-300"><Info className="w-3.5 h-3.5" /> For Educational Use</div>
          </div>
        </div>
      </div>
    </div>
  );
}
