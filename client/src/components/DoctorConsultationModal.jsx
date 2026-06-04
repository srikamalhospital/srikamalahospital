import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Send, Sparkles, Phone, CalendarCheck, Stethoscope } from 'lucide-react';
import { doctorConsultAI } from '../utils/api';
import { getAIResponseText, fallbackAI, HOSPITAL_PHONE_TEL } from '../utils/aiHelpers';
import useSiteConfig from '../hooks/useSiteConfig';
import BilingualAIBlock from './BilingualAIBlock';
import DoctorSuggestionChips from './DoctorSuggestionChips';
import {
    buildChatHistory,
    deriveSyncedSuggestions,
    displayText,
    getInitialSuggestions,
    getWelcomeMessage,
    parseDoctorConsultResponse,
} from '../utils/kiranDoctorAI';

const DoctorConsultationModal = ({ isOpen, onClose, doctor }) => {
    const { config } = useSiteConfig();
    const [messages, setMessages] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [language, setLanguage] = useState('te');
    const endRef = useRef(null);

    const schedule = useMemo(() => {
        if (!doctor) return {};
        return config.doctorSchedule?.[doctor.id] || config.doctorSchedule?.dr_kiran || {};
    }, [config, doctor]);

    const doctorAvailable = schedule.available !== false;

    const initChat = () => {
        if (!doctor) return;
        const welcome = getWelcomeMessage(language, schedule);
        setMessages([{
            id: Date.now(),
            sender: 'ai',
            text: displayText(welcome, language),
            rawText: welcome,
            bilingual: welcome,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
        setSuggestions(getInitialSuggestions(language, schedule));
        setInput('');
    };

    useEffect(() => {
        if (isOpen && doctor) initChat();
    }, [isOpen, doctor, language]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading, suggestions]);

    const syncSuggestions = (replyRaw, apiSuggestions, userTurn) => {
        const fromApi = (apiSuggestions || []).map((s) => ({
            te: s.te || s.en,
            en: s.en || s.te,
            label: language === 'en' ? (s.en || s.te) : (s.te || s.en),
        }));
        if (fromApi.length) {
            setSuggestions(fromApi);
            return;
        }
        setSuggestions(deriveSyncedSuggestions(replyRaw, language, userTurn));
    };

    const sendMessage = async (manualText = null) => {
        const textToSend = (manualText || input).trim();
        if (!textToSend || !doctor || isLoading) return;

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: textToSend,
            rawText: textToSend,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setSuggestions([]);
        setIsLoading(true);

        try {
            const history = buildChatHistory([...messages, userMsg]);
            const resp = await doctorConsultAI(textToSend, doctor, {
                history,
                language,
                opHours: schedule.opHours || config.opTimings,
                doctorAvailable,
            });

            const { reply, suggestions: apiSug } = parseDoctorConsultResponse(resp.data);
            const raw = reply || getAIResponseText(resp) || `${fallbackAI().te} ||| ${fallbackAI().en}`;

            setMessages((prev) => [...prev, {
                id: Date.now() + 1,
                sender: 'ai',
                text: displayText(raw, language),
                rawText: raw,
                bilingual: raw.includes('|||') ? raw : null,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }]);
            syncSuggestions(raw, resp.data?.suggestions || apiSug, messages.filter((m) => m.sender === 'user').length + 1);
        } catch (err) {
            const raw = err.response?.data?.response;
            if (raw) {
                setMessages((prev) => [...prev, {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: displayText(raw, language),
                    rawText: raw,
                    bilingual: raw.includes('|||') ? raw : null,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }]);
                syncSuggestions(raw, err.response?.data?.suggestions, 0);
            } else {
                const fb = fallbackAI();
                const combined = `${fb.te} ||| ${fb.en}`;
                setMessages((prev) => [...prev, {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: displayText(combined, language),
                    rawText: combined,
                    bilingual: combined,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }]);
                setSuggestions(getInitialSuggestions(language, schedule));
            }
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
                        className="ai-chat-panel fixed inset-x-0 bottom-[var(--emergency-bar-h)] sm:inset-x-auto sm:bottom-8 sm:right-6 w-full sm:w-[min(calc(100vw-1.5rem),400px)] max-h-[min(88dvh,calc(100dvh-var(--emergency-bar-h)-0.5rem))] sm:max-h-[min(85vh,560px)] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl z-[160] flex flex-col border border-slate-200 overflow-hidden safe-area-pb"
                    >
                        <div className="bg-hospital-dark px-3 py-3 sm:px-4 flex items-center gap-3 shrink-0 min-w-0">
                            <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-hospital-primary/40 shrink-0">
                                <img src={doctor.img} alt={doctor.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-white truncate">{doctor.name}</h3>
                                <p className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5 truncate">
                                    <Sparkles size={11} className="text-hospital-secondary shrink-0" />
                                    {doctorAvailable ? 'Virtual OP · preliminary advice' : 'On leave · call hospital'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setLanguage((l) => (l === 'te' ? 'en' : 'te'))}
                                className="shrink-0 text-[9px] font-bold uppercase px-2 py-1 rounded-full bg-white/10 text-white border border-white/20"
                            >
                                {language === 'te' ? 'TE' : 'EN'}
                            </button>
                            <button type="button" onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 shrink-0">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="ai-chat-messages flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-50 space-y-3 min-h-0">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex min-w-0 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`ai-bubble max-w-[min(92%,calc(100vw-2.5rem))] rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm shadow-sm ${
                                        msg.sender === 'user'
                                            ? 'bg-hospital-primary text-white rounded-br-md'
                                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'
                                    }`}>
                                        {msg.sender === 'ai' && msg.bilingual ? (
                                            <BilingualAIBlock text={msg.bilingual} />
                                        ) : msg.sender === 'ai' ? (
                                            <BilingualAIBlock text={msg.rawText || msg.text} />
                                        ) : (
                                            <p className="break-words">{msg.text}</p>
                                        )}
                                        <p className={`text-[10px] mt-2 ${msg.sender === 'user' ? 'text-white/70' : 'text-slate-400'}`}>{msg.time}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <p className="text-xs text-slate-500 italic px-1">
                                    {language === 'te' ? `${doctor.name} సమాధానం రాస్తున్నారు…` : `${doctor.name} is typing…`}
                                </p>
                            )}
                            <div ref={endRef} />
                        </div>

                        <DoctorSuggestionChips
                            suggestions={suggestions}
                            language={language}
                            onPick={sendMessage}
                            disabled={isLoading}
                        />

                        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 min-w-0">
                            <div className="ai-chat-input-row flex gap-2 items-center pro-input p-1.5 pr-1.5 min-w-0">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder={language === 'te' ? 'మీ లక్షణం లేదా ప్రశ్న…' : 'Your symptom or question…'}
                                    className="flex-1 min-w-0 border-0 focus:ring-0 bg-transparent py-2 text-base sm:text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => sendMessage()}
                                    disabled={!input.trim() || isLoading}
                                    className="p-2.5 rounded-xl bg-hospital-primary text-white disabled:opacity-40 shrink-0"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1 shrink-0">
                                    <Stethoscope size={12} /> Not a final diagnosis
                                </span>
                                <div className="flex flex-wrap gap-3 shrink-0">
                                    <a href={HOSPITAL_PHONE_TEL} className="text-hospital-primary font-semibold flex items-center gap-1">
                                        <Phone size={12} /> Call
                                    </a>
                                    <Link to="/book" onClick={onClose} className="text-hospital-secondary font-semibold flex items-center gap-1">
                                        <CalendarCheck size={12} /> Book OP
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
