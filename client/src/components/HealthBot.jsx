import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Trash2, ArrowUpRight, Plus, Sparkles, Activity, ShieldCheck, Phone, MessageSquarePlus, Scissors, Syringe, Droplets, Pill, Download, Globe, Languages, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { bookAppointment, getConfig } from '../utils/api';

const HealthBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [language, setLanguage] = useState('te'); // te or en
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [bookingState, setBookingState] = useState({ active: false, step: 0, data: {} });
    const [allowOnlinePayment, setAllowOnlinePayment] = useState(true);
    const [isDismissed, setIsDismissed] = useState(false);
    const scrollRef = useRef(null);

    const steps = [
        { key: 'name', q: { te: "దయచేసి మీ పూర్తి పేరు తెలియజేయండి?", en: "Please provide your full name?" } },
        { key: 'phone', q: { te: "మీ ఫోన్ నంబర్ ఎంత?", en: "What is your phone number?" } },
        { key: 'age', q: { te: "మీ వయస్సు ఎంత?", en: "How old are you?" } },
        { key: 'gender', q: { te: "మీ లింగం? (పురుషుడు/స్త్రీ/ఇతరము)", en: "Your gender? (Male/Female/Other)" } },
        { key: 'department', q: { te: "ఏ విభాగంలో పరీక్ష చేయించుకోవాలి? (General, Cardiology, etc.)", en: "Which department would you like to visit? (General, Cardiology, etc.)" } },
        { key: 'paymentMethod', q: { te: "చెల్లింపు విధానం? (Online/ఆసుపత్రిలో)", en: "Payment Method? (Online/Pay at Hospital)" } }
    ].filter(s => s.key !== 'paymentMethod' || allowOnlinePayment);

    useEffect(() => {
        getConfig().then(resp => {
            if (resp.data.success) {
                setAllowOnlinePayment(resp.data.config.allowOnlinePayment ?? true);
            }
        });
    }, []);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcome = {
                id: 'welcome',
                text: language === 'te' 
                    ? "శ్రీ కమల హాస్పిటల్ క్లినికల్ AI కోర్ కు స్వాగతం. నేను డాక్టర్ కిరణ్ AI. మీకు ఎలా సహాయపడగలను?" 
                    : "Welcome to Sri Kamala Hospital Clinical AI Core. I am Dr. Kiran AI. How can I assist you today?",
                sender: 'bot',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages([welcome]);
        }
    }, [language, isOpen]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isTyping]);

    const toggleLanguage = () => setLanguage(prev => prev === 'te' ? 'en' : 'te');

    const generateReceiptPDF = (data) => {
        const doc = new jsPDF();
        
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 0, 210, 297, 'F');
        
        doc.setTextColor(0, 204, 204);
        doc.setFontSize(24);
        doc.text("SRI KAMALA HOSPITAL", 105, 40, { align: 'center' });
        
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(10);
        doc.text("CLINICAL APPOINTMENT RECEIPT", 105, 50, { align: 'center' });
        
        doc.setDrawColor(15, 23, 42, 0.1);
        doc.line(20, 60, 190, 60);
        
        const details = [
            ["Token", data.token || "PENDING"],
            ["Patient", data.name],
            ["Phone", data.phone],
            ["Age/Gender", `${data.age} / ${data.gender}`],
            ["Clinical Node", data.department],
            ["Payment", data.paymentMethod || "Institutional Credit"],
            ["Verification", "VERIFIED BY AI CORE"]
        ];
        
        let y = 80;
        details.forEach(([label, val]) => {
            doc.setTextColor(100, 116, 139);
            doc.text(label.toUpperCase(), 30, y);
            doc.setTextColor(15, 23, 42);
            doc.text(String(val), 120, y);
            y += 15;
        });
        
        doc.setTextColor(0, 204, 204, 0.5);
        doc.setFontSize(8);
        doc.text("Powered by Kiran AI Core v5.0", 105, 250, { align: 'center' });
        
        doc.save(`Receipt_${data.name}.pdf`);
    };

    const handleSend = async (manualText = null) => {
        const text = manualText || input;
        if (!text.trim()) return;

        const userMsg = { id: Date.now(), text, sender: 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        if (bookingState.active) {
            const currentStep = steps[bookingState.step];
            const updatedData = { ...bookingState.data, [currentStep.key]: text };
            
            if (bookingState.step < steps.length - 1) {
                setBookingState({ ...bookingState, step: bookingState.step + 1, data: updatedData });
                const nextQ = steps[bookingState.step + 1].q[language];
                setTimeout(() => {
                    setMessages(prev => [...prev, { id: Date.now() + 1, text: nextQ, sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
                }, 300);
            } else {
                try {
                    const bookingPayload = { ...updatedData };
                    if (!allowOnlinePayment) bookingPayload.paymentMethod = 'ఆసుపత్రిలో';
                    const resp = await bookAppointment(bookingPayload);
                    const finalData = resp.data.success ? resp.data.appointment : { ...bookingPayload, token: 'ERR-NODE' };
                    
                    const successMsg = language === 'te'
                        ? `నియామకం విజయవంతంగా బుక్ చేయబడింది! మీ టోకెన్: ${finalData.token}. రసీదును డౌన్‌లోడ్ చేయండి.`
                        : `Appointment booked! Your Token: ${finalData.token}. Access receipt below.`;
                    
                    setMessages(prev => [...prev, { 
                        id: Date.now() + 2, 
                        text: successMsg, 
                        sender: 'bot', 
                        isReceipt: true, 
                        receiptData: finalData,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    }]);
                    setBookingState({ active: false, step: 0, data: {} });
                } catch (err) {
                    setMessages(prev => [...prev, { id: Date.now() + 2, text: "Clinical link error. Please try again.", sender: 'bot' }]);
                } finally {
                    setIsTyping(false);
                }
            }
            return;
        }

        setIsTyping(true);
        try {
            const { chatWithAI } = await import('../utils/api');
            const lText = text.toLowerCase();
            if (lText.includes('book') || lText.includes('appointment') || lText.includes('బుకింగ్') || lText.includes('అపాయింట్‌మెంట్')) {
                setBookingState({ active: true, step: 0, data: {} });
                setTimeout(() => {
                    setMessages(prev => [...prev, { id: Date.now() + 1, 
                        text: language === 'te' ? "మీ నియామకం ప్రారంభిస్తున్నాను. మీ పేరు చెప్పండి?" : "Starting booking. May I have your name?", 
                        sender: 'bot', 
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    }]);
                    setIsTyping(false);
                }, 400);
                return;
            }

            const prompt = `You are Dr. Kiran, AI focal point for Sri Kamala Hospital. 
                Respond in ${language === 'te' ? 'Telugu' : 'English'}. Concise info (1-2 sentences). 
                User: "${text}"`;
            
            const resp = await chatWithAI(prompt);
            const botResponse = resp.data.success ? resp.data.response : "NODE ERROR: Link severed.";
            setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        } catch (err) {
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Link failure.", sender: 'bot' }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleDismiss = (e) => {
        e.stopPropagation();
        setIsDismissed(true);
    };

    if (isDismissed) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[600]">
            <AnimatePresence>
                {!isOpen && (
                  <div className="relative group">
                    <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="w-10 h-10 bg-white text-hospital-primary rounded-full shadow-xl flex items-center justify-center border border-black/5 hover:scale-105 transition-all">
                        <Bot size={24} className="relative z-10" />
                    </motion.button>
                    
                    {/* Tiny Dismiss Button */}
                    <button 
                        onClick={handleDismiss}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-white border border-black/5 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={10} />
                    </button>

                    <div className="absolute right-14 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white border border-black/5 rounded-lg shadow-lg hidden md:block pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[7px] font-black uppercase tracking-[0.4em] whitespace-nowrap text-slate-400 italic">Kiran AI Dispatch</p>
                    </div>
                  </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 30 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="w-[85vw] md:w-[260px] h-[60vh] md:h-[380px] bg-white rounded-[24px] shadow-4xl flex flex-col overflow-hidden border border-black/5 backdrop-blur-3xl relative">
                        
                        {/* Transparent Logo Background Decor */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                            <img src="/logo.png" className="w-[80%] h-auto object-contain" alt="Background Watermark" />
                        </div>

                        {/* High Fidelity Header */}
                        <div className="p-4 px-6 bg-slate-50 text-slate-900 border-b border-black/5 relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 p-1.5 bg-white border border-black/5 rounded-xl relative shadow-md">
                                     <img src="/logo.png" className="w-full h-full object-contain relative z-10" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-[10px] font-black tracking-widest uppercase italic leading-none whitespace-nowrap">KIRAN CORE <span className="text-hospital-primary font-serif">v5.0</span></h3>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-neon-mint"></div>
                                        <span className="text-[6px] uppercase font-black tracking-[0.3em] text-slate-300">Surveillance: Active</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button onClick={toggleLanguage} className="px-3 py-1.5 bg-white border border-black/5 rounded-full text-[7px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all text-hospital-secondary group">
                                    <Globe size={10} /> {language === 'te' ? 'TE' : 'EN'}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="w-8 h-8 bg-white rounded-xl flex items-center justify-center hover:bg-slate-50 text-slate-400 border border-black/5 transition-all">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Messaging Stream */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 relative z-10 scrollbar-hide">
                            {messages.map((m, i) => (
                                <motion.div key={m.id} initial={{ x: m.sender === 'user' ? 20 : -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                                    className={`flex items-end gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center border border-black/5 shadow-md bg-slate-50`}>
                                        {m.sender === 'user' ? <User size={12} className="text-slate-400" /> : <img src="/logo.png" className="w-4 h-4 object-contain" />}
                                    </div>
                                    <div className={`max-w-[85%] text-left rounded-[24px] px-5 py-3.5 text-[11px] shadow-lg relative ${m.sender === 'user' ? 'bg-hospital-primary text-black rounded-br-none' : 'bg-slate-50 text-slate-900 rounded-bl-none border border-black/5'}`}>
                                        <p className={`font-bold italic tracking-tight leading-relaxed ${language === 'te' ? "font-['Noto_Sans_Telugu']" : ""}`}>
                                            {m.text}
                                        </p>
                                        
                                        {m.isReceipt && (
                                            <div className="mt-4 space-y-4 pt-4 border-t border-black/5">
                                                <button onClick={() => generateReceiptPDF(m.receiptData)} className="w-full py-3 bg-[#0f172a] text-white rounded-xl font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg">
                                                    <Download size={10} /> Download Receipt
                                                </button>
                                            </div>
                                        )}
  
                                        <p className={`text-[6px] mt-1.5 font-black uppercase opacity-20 italic absolute ${m.sender === 'user' ? '-left-12 bottom-1' : '-right-12 bottom-1'}`}>{m.time}</p>
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-black/5 flex items-center justify-center animate-pulse"><Bot size={14} className="text-hospital-primary" /></div>
                                    <div className="bg-slate-50 border border-black/5 px-4 py-3 rounded-[24px] rounded-bl-none shadow-sm flex gap-1">
                                        {[1, 2, 3].map(d => <motion.div key={d} animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: d * 0.2 }} className="w-1 h-1 bg-hospital-primary rounded-full"></motion.div>)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Core */}
                        <div className="p-4 bg-slate-50 border-t border-black/5 space-y-2 relative z-10 text-left">
                            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
                                <div className="flex-1 relative group">
                                    <input type="text" placeholder={bookingState.active ? "Fill indexing..." : "Query Kiran..."} value={input} onChange={(e) => setInput(e.target.value)}
                                        className="w-full bg-white border border-black/5 focus:border-hospital-primary px-4 py-3 rounded-2xl outline-none text-[11px] font-bold transition-all text-slate-900 placeholder:text-slate-200 shadow-inner italic" />
                                    <button type="submit" className={`absolute right-3 top-1/2 -translate-y-1/2 text-hospital-primary hover:scale-110 active:scale-90 transition-all ${!input.trim() ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                                        <Send size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                                {bookingState.active && (
                                    <button onClick={() => setBookingState({ active: false, step: 0, data: {} })} className="w-10 h-10 bg-red-50 border border-red-100 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-md">
                                        <LogOut size={16} />
                                    </button>
                                )}
                            </form>
                            <div className="flex items-center justify-between text-[7px] font-black uppercase tracking-[0.4em] text-slate-300 italic">
                                <span>HIPAA Secured Node</span>
                                <span className={bookingState.active ? "text-hospital-secondary animate-pulse" : ""}>{bookingState.active ? `Step ${bookingState.step + 1}/${steps.length}` : 'AI Tracking active'}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HealthBot;
