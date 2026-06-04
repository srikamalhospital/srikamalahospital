import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Send, Sparkles, Phone, CalendarCheck, Stethoscope } from 'lucide-react';
import { doctorConsultAI } from '../utils/api';
import { getAIResponseText, fallbackAI, HOSPITAL_PHONE_TEL } from '../utils/aiHelpers';
import BilingualAIBlock from './BilingualAIBlock';

const DoctorConsultationModal = ({ isOpen, onClose, doctor }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const endRef = useRef(null);

    const suggestions = [
        'ఛాతీ నొప్పి ఉంది',
        'జ్వరం మరియు తలనొప్పి',
        'డాక్టర్ అపాయింట్‌మెంట్',
        'ఆసుపత్రి సమయాలు',
    ];

    useEffect(() => {
        if (isOpen && doctor) {
            const fb = fallbackAI(
                `నమస్కారం! నేను ${doctor.name} గారి AI సహాయకుడిని. లక్షణాలు లేదా అపాయింట్‌మెంట్ గురించి అడగండి.`,
                `Hello! I'm the AI assistant for ${doctor.name}. Ask about symptoms or booking a visit.`
            );
            setMessages([{
                id: Date.now(),
                sender: 'ai',
                text: `${fb.te} ||| ${fb.en}`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }]);
            setInput('');
        }
    }, [isOpen, doctor]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const sendMessage = async (manualText = null) => {
        const textToSend = (manualText || input).trim();
        if (!textToSend || !doctor || isLoading) return;

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: textToSend,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const resp = await doctorConsultAI(textToSend, doctor);
            const raw = getAIResponseText(resp);
            const reply = raw || `${fallbackAI().te} ||| ${fallbackAI().en}`;
            setMessages((prev) => [...prev, {
                id: Date.now() + 1,
                sender: 'ai',
                text: reply,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }]);
        } catch (err) {
            const raw = err.response?.data?.response;
            if (raw) {
                setMessages((prev) => [...prev, {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: raw,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }]);
                setIsLoading(false);
                return;
            }
            const fb = fallbackAI();
            setMessages((prev) => [...prev, {
                id: Date.now() + 1,
                sender: 'ai',
                text: `${fb.te} ||| ${fb.en}`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!doctor) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[150]"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.98 }}
                        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-[min(100vw-2rem,400px)] h-[min(85vh,560px)] bg-white rounded-2xl shadow-2xl z-[160] flex flex-col border border-slate-200 overflow-hidden"
                    >
                        <div className="bg-hospital-dark px-4 py-4 flex items-center gap-3 shrink-0">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-hospital-primary/40">
                                <img src={doctor.img} alt={doctor.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-white truncate">{doctor.name}</h3>
                                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                                    <Sparkles size={12} className="text-hospital-secondary" />
                                    AI Clinical Assistant
                                </p>
                            </div>
                            <button type="button" onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                        msg.sender === 'user'
                                            ? 'bg-hospital-primary text-white rounded-br-md'
                                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'
                                    }`}>
                                        {msg.sender === 'ai' ? (
                                            <BilingualAIBlock text={msg.text} />
                                        ) : (
                                            <p>{msg.text}</p>
                                        )}
                                        <p className={`text-[10px] mt-2 ${msg.sender === 'user' ? 'text-white/70' : 'text-slate-400'}`}>{msg.time}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-1.5 px-4 py-2">
                                    {[0, 0.15, 0.3].map((d) => (
                                        <span key={d} className="w-2 h-2 bg-hospital-primary/40 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                                    ))}
                                </div>
                            )}
                            <div ref={endRef} />
                        </div>

                        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                            {messages.length < 4 && !isLoading && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {suggestions.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => sendMessage(s)}
                                            className="text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-hospital-primary/10 hover:text-hospital-primary border border-slate-200"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2 items-center pro-input p-1.5 pr-1.5">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type your question..."
                                    className="flex-1 border-0 focus:ring-0 bg-transparent py-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => sendMessage()}
                                    disabled={!input.trim() || isLoading}
                                    className="p-2.5 rounded-xl bg-hospital-primary text-white disabled:opacity-40"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <Stethoscope size={12} /> Preliminary guidance only
                                </span>
                                <div className="flex gap-3">
                                    <a href={HOSPITAL_PHONE_TEL} className="text-hospital-primary font-semibold flex items-center gap-1">
                                        <Phone size={12} /> Call
                                    </a>
                                    <Link to="/book" onClick={onClose} className="text-hospital-secondary font-semibold flex items-center gap-1">
                                        <CalendarCheck size={12} /> Book
                                    </Link>
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
