import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Send, Bot, User, Download, Globe, LogOut, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { bookAppointment, doctorConsultAI, getConfig } from '../utils/api';
import useSiteConfig from '../hooks/useSiteConfig';
import DoctorSuggestionChips from './DoctorSuggestionChips';
import BilingualAIBlock from './BilingualAIBlock';
import {
  DR_KIRAN,
  buildChatHistory,
  deriveSyncedSuggestions,
  displayText,
  getBookingSuggestions,
  getInitialSuggestions,
  getWelcomeMessage,
  parseDoctorConsultResponse,
} from '../utils/kiranDoctorAI';
import { OP_DEPARTMENTS, validateAppointmentBooking, normalizeDepartment, getNextThursday } from '../utils/appointmentSchedule';

const HealthBot = () => {
    const { config } = useSiteConfig();
    const [isOpen, setIsOpen] = useState(false);
    const [language, setLanguage] = useState('te');
    const [messages, setMessages] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [bookingState, setBookingState] = useState({ active: false, step: 0, data: {} });
    const [allowOnlinePayment, setAllowOnlinePayment] = useState(true);
    const [isDismissed, setIsDismissed] = useState(false);
    const scrollRef = useRef(null);

    const schedule = config.doctorSchedule?.dr_kiran || config.doctorSchedule?.[DR_KIRAN.id] || {};
    const doctorAvailable = schedule.available !== false;

    const steps = useMemo(() => [
        { key: 'name', q: { te: 'మీ పూర్తి పేరు ఏమిటి?', en: 'What is your full name?' } },
        { key: 'phone', q: { te: 'మీ మొబైల్ నంబర్?', en: 'Your mobile number?' } },
        { key: 'age', q: { te: 'మీ వయస్సు?', en: 'Your age?' } },
        { key: 'gender', q: { te: 'లింగం? (పురుషుడు / స్త్రీ)', en: 'Gender? (Male / Female)' } },
        { key: 'department', q: { te: 'ఏ విభాగం? జనరల్ మెడిసిన్ (ప్రతి రోజు) లేదా కార్డియాలజీ (గురువారం)', en: 'Department? General Medicine (daily) or Cardiology (Thursday only)' } },
        { key: 'paymentMethod', q: { te: 'చెల్లింపు: ఆసుపత్రిలో లేదా Online?', en: 'Payment: at hospital or online?' } },
    ].filter(s => s.key !== 'paymentMethod' || allowOnlinePayment), [allowOnlinePayment]);

    useEffect(() => {
        getConfig().then(resp => {
            if (resp.data.success) {
                setAllowOnlinePayment(resp.data.config.allowOnlinePayment ?? true);
            }
        });
    }, []);

    const resetConsult = () => {
        const welcomeText = getWelcomeMessage(language, schedule);
        setMessages([{
            id: 'welcome',
            text: welcomeText,
            rawText: welcomeText,
            sender: 'bot',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
        setSuggestions(getInitialSuggestions(language, schedule));
    };

    useEffect(() => {
        if (!isOpen) return;
        resetConsult();
    }, [language]);

    useEffect(() => {
        if (isOpen && messages.length === 0) resetConsult();
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isTyping, suggestions]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [isOpen]);

    const toggleLanguage = () => setLanguage(prev => prev === 'te' ? 'en' : 'te');

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

    const generateReceiptPDF = (data) => {
        const doc = new jsPDF();
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 0, 210, 297, 'F');
        doc.setTextColor(0, 204, 204);
        doc.setFontSize(24);
        doc.text('SRI KAMALA HOSPITAL', 105, 40, { align: 'center' });
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(10);
        doc.text('CLINICAL APPOINTMENT RECEIPT', 105, 50, { align: 'center' });
        doc.setDrawColor(15, 23, 42, 0.1);
        doc.line(20, 60, 190, 60);
        const details = [
            ['Token', data.token || 'PENDING'],
            ['Patient', data.name],
            ['Phone', data.phone],
            ['Age/Gender', `${data.age} / ${data.gender}`],
            ['Doctor', DR_KIRAN.name],
            ['Department', data.department],
            ['Payment', data.paymentMethod || 'Pay at hospital'],
        ];
        let y = 80;
        details.forEach(([label, val]) => {
            doc.setTextColor(100, 116, 139);
            doc.text(label.toUpperCase(), 30, y);
            doc.setTextColor(15, 23, 42);
            doc.text(String(val), 120, y);
            y += 15;
        });
        doc.save(`Receipt_${data.name}.pdf`);
    };

    const userTurnCount = messages.filter((m) => m.sender === 'user').length;

    const handleSend = async (manualText = null) => {
        const text = manualText || input;
        if (!text.trim()) return;

        const userMsg = {
            id: Date.now(),
            text,
            rawText: text,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setSuggestions([]);

        if (bookingState.active) {
            const currentStep = steps[bookingState.step];
            const updatedData = { ...bookingState.data, [currentStep.key]: text };

            if (bookingState.step < steps.length - 1) {
                const nextStep = bookingState.step + 1;
                setBookingState({ ...bookingState, step: nextStep, data: updatedData });
                const nextQ = steps[nextStep].q[language];
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        id: Date.now() + 1,
                        text: nextQ,
                        rawText: nextQ,
                        sender: 'bot',
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    }]);
                    setSuggestions(getBookingSuggestions(steps[nextStep].key, language));
                    if (steps[nextStep].key === 'department') {
                        setSuggestions(
                            OP_DEPARTMENTS.map((d) => ({
                                te: d.te,
                                en: d.en,
                                label: language === 'en' ? `${d.en} (${d.scheduleEn})` : `${d.te} (${d.scheduleTe})`,
                            }))
                        );
                    }
                }, 300);
            } else {
                try {
                    const deptRaw = updatedData.department || OP_DEPARTMENTS[0].value;
                    const apptDate =
                        normalizeDepartment(deptRaw) === 'cardiology'
                            ? getNextThursday()
                            : new Date().toISOString().slice(0, 10);
                    const scheduleCheck = validateAppointmentBooking(deptRaw, apptDate);
                    if (!scheduleCheck.ok) {
                        setMessages(prev => [...prev, {
                            id: Date.now() + 2,
                            text: scheduleCheck.messageEn,
                            sender: 'bot',
                        }]);
                        setBookingState({ active: false, step: 0, data: {} });
                        setIsTyping(false);
                        return;
                    }
                    const bookingPayload = {
                        ...updatedData,
                        department: deptRaw,
                        appointmentDate: apptDate,
                    };
                    if (!allowOnlinePayment) bookingPayload.paymentMethod = 'ఆసుపత్రిలో';
                    const resp = await bookAppointment(bookingPayload);
                    const finalData = resp.data.success ? resp.data.appointment : { ...bookingPayload, token: 'ERR' };

                    const successMsg = language === 'te'
                        ? `మీ అపాయింట్‌మెంట్ బుక్ అయింది. టోకెన్: ${finalData.token}. రిసెప్షన్‌లో చూపించండి.`
                        : `Appointment booked. Token: ${finalData.token}. Show this at reception.`;

                    setMessages(prev => [...prev, {
                        id: Date.now() + 2,
                        text: successMsg,
                        rawText: successMsg,
                        sender: 'bot',
                        isReceipt: true,
                        receiptData: finalData,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    }]);
                    setBookingState({ active: false, step: 0, data: {} });
                    setSuggestions([
                        { te: 'ధన్యవాదాలు', en: 'Thank you', label: language === 'en' ? 'Thank you' : 'ధన్యవాదాలు' },
                    ]);
                } catch {
                    setMessages(prev => [...prev, {
                        id: Date.now() + 2,
                        text: language === 'te' ? 'బుకింగ్ విఫలమైంది — 99480 76665 కి కాల్ చేయండి.' : 'Booking failed — call 99480 76665.',
                        sender: 'bot',
                    }]);
                } finally {
                    setIsTyping(false);
                }
            }
            return;
        }

        const lText = text.toLowerCase();
        if (lText.includes('book') || lText.includes('appointment') || lText.includes('బుక్') || lText.includes('అపాయింట్')) {
            setBookingState({ active: true, step: 0, data: {} });
            const startQ = steps[0].q[language];
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    text: language === 'te'
                        ? `${DR_KIRAN.name} గారి OP బుకింగ్ ప్రారంభిస్తాను. ${startQ}`
                        : `Starting OP booking with ${DR_KIRAN.name}. ${startQ}`,
                    rawText: startQ,
                    sender: 'bot',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }]);
                setSuggestions(getBookingSuggestions('name', language));
                setIsTyping(false);
            }, 400);
            return;
        }

        setIsTyping(true);
        try {
            const history = buildChatHistory([...messages, userMsg]);
            const resp = await doctorConsultAI(text, DR_KIRAN, {
                history,
                language,
                opHours: schedule.opHours || config.opTimings,
                doctorAvailable,
            });

            const { reply, suggestions: apiSug } = parseDoctorConsultResponse(resp.data);
            const replyText = reply || resp.data?.response || '';
            const fallback = language === 'te'
                ? 'దయచేసి మీ లక్షణాన్ని మరోసారి వివరించండి.'
                : 'Please describe your symptom again.';

            const botMsg = {
                id: Date.now() + 1,
                text: displayText(replyText || fallback, language),
                rawText: replyText || fallback,
                sender: 'bot',
                bilingual: replyText.includes('|||') ? replyText : null,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, botMsg]);
            syncSuggestions(replyText, resp.data?.suggestions || apiSug, userTurnCount + 1);
        } catch {
            const errText = 'క్షమించండి, ఇప్పుడు సమాధానం ఇవ్వలేకపోయాను. 99480 76665 ||| Sorry, I could not respond. Call 99480 76665.';
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: displayText(errText, language),
                rawText: errText,
                bilingual: errText,
                sender: 'bot',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }]);
            setSuggestions(getInitialSuggestions(language, schedule));
        } finally {
            setIsTyping(false);
        }
    };

    const handleDismiss = (e) => {
        e.stopPropagation();
        setIsDismissed(true);
    };

    if (isDismissed) return null;

    const fabBottom = 'bottom-[var(--health-bot-offset)]';

    return (
        <>
            {isOpen && (
                <button
                    type="button"
                    aria-label="Close chat backdrop"
                    className="fixed inset-0 z-[54] bg-slate-900/30 sm:bg-transparent sm:pointer-events-none"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`fixed right-3 sm:right-5 z-[55] ${fabBottom} safe-area-pb pointer-events-none`}>
                <div className="pointer-events-auto">
                    <AnimatePresence>
                        {!isOpen && (
                          <div className="relative group">
                            <motion.button
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                type="button"
                                onClick={() => setIsOpen(true)}
                                aria-label="Chat with Dr. Kiran"
                                className="w-12 h-12 bg-white text-hospital-primary rounded-full shadow-xl flex items-center justify-center border border-black/5 hover:scale-105 transition-all"
                            >
                                <Stethoscope size={20} />
                            </motion.button>
                            <button
                                type="button"
                                onClick={handleDismiss}
                                aria-label="Hide assistant"
                                className="absolute -top-1 -right-1 w-5 h-5 bg-white border border-black/5 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 shadow-md"
                            >
                                <X size={10} />
                            </button>
                          </div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 16 }}
                                className="ai-chat-panel fixed left-2 right-2 sm:left-auto sm:right-0 bottom-[calc(var(--health-bot-offset)+3.25rem)] sm:bottom-[calc(var(--health-bot-offset)+0.25rem)] w-auto sm:w-[min(calc(100vw-1rem),400px)] max-h-[min(82dvh,calc(100dvh-var(--health-bot-offset)-4rem))] bg-white rounded-2xl shadow-2xl flex flex-col border border-black/5 overflow-hidden"
                            >
                                <div className="px-3 py-3 sm:px-4 bg-slate-50 border-b border-black/5 flex items-center gap-2 shrink-0 min-w-0">
                                    <div className="w-9 h-9 p-1 bg-white border border-black/5 rounded-lg shrink-0">
                                         <img src="/logo.png" alt="" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <h3 className="text-[11px] font-bold text-slate-900 truncate">{DR_KIRAN.name}</h3>
                                        <p className="text-[9px] text-slate-500 flex items-center gap-1 truncate">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                            {doctorAvailable ? 'OP assistant · online' : 'On leave · emergency only'}
                                        </p>
                                    </div>
                                    <button type="button" onClick={toggleLanguage} className="shrink-0 px-2 py-1 bg-white border border-black/5 rounded-full text-[9px] font-bold uppercase flex items-center gap-1">
                                        <Globe size={10} /> {language === 'te' ? 'TE' : 'EN'}
                                    </button>
                                    <button type="button" onClick={() => setIsOpen(false)} aria-label="Close" className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 border border-black/5 bg-white">
                                        <X size={14} />
                                    </button>
                                </div>

                                <div ref={scrollRef} className="ai-chat-messages flex-1 p-3 sm:p-4 space-y-3 min-h-0">
                                    {messages.map((m) => (
                                        <div key={m.id} className={`flex items-end gap-2 min-w-0 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                            <div className="w-6 h-6 shrink-0 rounded-md flex items-center justify-center border border-black/5 bg-slate-50">
                                                {m.sender === 'user' ? <User size={11} className="text-slate-400" /> : <Bot size={11} className="text-hospital-primary" />}
                                            </div>
                                            <div className={`ai-bubble max-w-[min(88%,calc(100vw-5rem))] rounded-2xl px-3 py-2.5 text-[11px] sm:text-xs shadow-sm ${
                                                m.sender === 'user'
                                                    ? 'bg-hospital-primary text-slate-900 rounded-br-sm'
                                                    : 'bg-slate-50 text-slate-900 rounded-bl-sm border border-black/5'
                                            }`}>
                                                {m.sender === 'bot' && m.bilingual ? (
                                                    <BilingualAIBlock text={m.bilingual} className="text-[11px] sm:text-xs" />
                                                ) : (
                                                    <p className={`font-medium leading-relaxed ${language === 'te' ? "font-['Noto_Sans_Telugu']" : ''}`}>
                                                        {m.text}
                                                    </p>
                                                )}
                                                {m.isReceipt && (
                                                    <button
                                                        type="button"
                                                        onClick={() => generateReceiptPDF(m.receiptData)}
                                                        className="mt-2 w-full py-2 bg-slate-900 text-white rounded-lg text-[9px] font-bold uppercase flex items-center justify-center gap-1"
                                                    >
                                                        <Download size={10} /> Receipt
                                                    </button>
                                                )}
                                                <p className="text-[9px] mt-1 opacity-50">{m.time}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {isTyping && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-md bg-slate-50 border border-black/5 flex items-center justify-center">
                                                <Bot size={12} className="text-hospital-primary animate-pulse" />
                                            </div>
                                            <p className="text-[10px] text-slate-400 italic">
                                                {language === 'te' ? 'డాక్టర్ కిరణ్ టైప్ చేస్తున్నారు…' : 'Dr. Kiran is typing…'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <DoctorSuggestionChips
                                    suggestions={suggestions}
                                    language={language}
                                    onPick={(label) => handleSend(label)}
                                    disabled={isTyping}
                                />

                                <div className="p-3 bg-slate-50 border-t border-black/5 shrink-0 min-w-0">
                                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="ai-chat-input-row flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder={bookingState.active
                                                ? (language === 'te' ? 'మీ సమాధానం…' : 'Your answer…')
                                                : (language === 'te' ? 'లక్షణం లేదా ప్రశ్న…' : 'Symptom or question…')}
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            className="flex-1 min-w-0 bg-white border border-black/5 focus:border-hospital-primary px-3 py-2.5 rounded-xl outline-none text-sm sm:text-xs"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!input.trim() || isTyping}
                                            className="shrink-0 w-10 h-10 rounded-xl bg-hospital-primary text-slate-900 flex items-center justify-center disabled:opacity-30"
                                        >
                                            <Send size={16} />
                                        </button>
                                        {bookingState.active && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setBookingState({ active: false, step: 0, data: {} });
                                                    resetConsult();
                                                }}
                                                className="shrink-0 w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-100"
                                            >
                                                <LogOut size={14} />
                                            </button>
                                        )}
                                    </form>
                                    {bookingState.active && (
                                        <p className="text-[9px] text-slate-400 mt-1.5 text-center">
                                            {language === 'te' ? 'బుకింగ్' : 'Booking'} · {bookingState.step + 1}/{steps.length}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
};

export default HealthBot;
