import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Activity, Sparkles, Phone, CalendarCheck, MessageSquarePlus } from 'lucide-react';

const DoctorConsultationModal = ({ isOpen, onClose, doctor }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const endOfMessagesRef = useRef(null);

    const suggestions = [
        "Symptom help",
        "Hospital timings",
        "Emergency contact",
        "Clinical details"
    ];

    useEffect(() => {
        if (isOpen && doctor) {
            setMessages([{
                id: Date.now(),
                sender: 'ai',
                text: `Welcome! I'm ${doctor.name}'s AI assistant. Ready to help with clinical guidance or ${doctor.specialty} queries.`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setInput('');
        }
    }, [isOpen, doctor]);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (manualText = null) => {
        const textToSend = manualText || input;
        if (!textToSend.trim() || !doctor) return;

        const userMsg = { id: Date.now(), sender: 'user', text: textToSend, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const { chatWithAI } = await import('../utils/api');
            const chatHistory = messages.slice(-4).map(m => {
                const text = typeof m.text === 'string' && m.text.includes('|||') ? m.text.split('|||')[1].trim() : m.text;
                return `${m.sender.toUpperCase()}: ${text}`;
            }).join('\n');

            const prompt = `Digital Medical Assistant for ${doctor.name} (${doctor.specialty}) at Sri Kamala Hospital.
Rules:
1. Warm, conversation, empathetic.
2. Max 2-3 sentences.
3. If symptoms mentioned, advise Dr. ${doctor.name} visit.

Context: ${chatHistory}
User: "${userMsg.text}"

Format: [Telugu] ||| [English]`;

            const resp = await chatWithAI(prompt);
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'ai',
                text: resp.data.response || "Clinical network delay. Call +91 99480 76665.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'ai',
                text: "Emergency Relay: Contact reception directly at 99480 76665.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-hospital-dark/60 backdrop-blur-sm z-[150] pointer-events-auto" onClick={onClose} />
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.95, x: 20 }} 
                        animate={{ opacity: 1, y: 0, scale: 1, x: 0 }} 
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-24 right-4 md:bottom-6 md:right-24 w-[300px] max-w-[90vw] h-[450px] max-h-[70vh] bg-white rounded-[32px] shadow-4xl z-[160] overflow-hidden flex flex-col border border-gray-100">

                        {/* Header */}
                        <div className="bg-hospital-dark px-4 py-3 relative flex items-center gap-3 flex-shrink-0">
                            <div className="w-10 h-10 rounded-xl border border-hospital-primary/30 overflow-hidden relative shadow-md">
                                <img src={doctor?.img} className="w-full h-full object-cover" alt="Doctor" />
                                <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-hospital-dark"></div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-[11px] font-black text-white tracking-tight leading-none">{doctor?.name}</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Sparkles size={8} className="text-hospital-secondary animate-pulse" />
                                    <p className="text-[7px] font-black uppercase tracking-widest text-hospital-secondary opacity-80">KIRAN CORE AI</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all flex items-center justify-center">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-5 bg-[#fcfdfe] flex flex-col gap-5">
                            {messages.map((msg, i) => (
                                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-4 rounded-3xl text-[13px] font-bold shadow-sm leading-relaxed ${msg.sender === 'user' ? 'bg-hospital-secondary text-white rounded-br-sm' : 'bg-white border border-gray-100 text-hospital-dark rounded-bl-sm max-w-[85%]'}`}>
                                        {msg.text.includes('|||') ? (
                                            <>
                                                <p className="font-['Noto_Sans_Telugu']">{msg.text.split('|||')[0].trim()}</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-hospital-primary opacity-60 mt-3 pt-2 border-t border-gray-50">{msg.text.split('|||')[1].trim()}</p>
                                            </>
                                        ) : (
                                            <p className="font-['Noto_Sans_Telugu']">{msg.text}</p>
                                        )}
                                        <p className={`text-[8px] mt-2 uppercase flex items-center gap-1 ${msg.sender === 'user' ? 'text-white/40 justify-end' : 'text-gray-400'}`}>
                                            {msg.time}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-1 items-center bg-gray-50 px-4 py-3 rounded-full w-fit">
                                    {[0, 0.2, 0.4].map(delay => (
                                        <motion.div key={delay} animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1, delay }} className="w-1 h-1 bg-gray-400 rounded-full" />
                                    ))}
                                </div>
                            )}
                            <div ref={endOfMessagesRef} />
                        </div>

                        {/* Input & Suggestions */}
                        <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
                            {messages.length < 3 && !isLoading && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {suggestions.map(s => (
                                        <button key={s} onClick={() => handleSend(s)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-[9px] font-black uppercase text-hospital-dark hover:bg-hospital-primary/10 hover:border-hospital-primary/20 transition-all flex items-center gap-1.5 group">
                                            <MessageSquarePlus size={10} className="text-hospital-primary group-hover:scale-110 transition-transform" /> {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                            
                            <div className="relative flex items-center bg-[#f8fafc] border-2 border-gray-200 rounded-[24px] p-1.5 focus-within:border-hospital-primary/30 transition-all shadow-inner">
                                <input value={input} onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={`Ask Dr. Kiran...`}
                                    className="w-full bg-transparent border-none px-4 outline-none text-xs text-hospital-dark font-black placeholder:text-gray-300" />
                                <button onClick={() => handleSend()} disabled={!input.trim() || isLoading}
                                    className="p-3 bg-hospital-primary text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                                    <Send size={14} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between mt-3 px-1">
                                <p className="text-[7px] font-black uppercase tracking-widest text-gray-300">Clinical AI Simulation</p>
                                <div className="flex items-center gap-2">
                                     <a href="tel:9948076665" className="text-hospital-primary hover:underline"><Phone size={10} /></a>
                                     <a href="/#booking" className="text-[7px] font-black uppercase text-hospital-secondary hover:underline">Book Visit</a>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default DoctorConsultationModal;
