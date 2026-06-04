import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';

const CustomCursor = () => {
    const cursorRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [rotation, setRotation] = useState(-45);
    const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
    const [cursorText, setCursorText] = useState('');

    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 300 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    const followerConfig = { damping: 15, stiffness: 80 };
    const followerX = useSpring(mouseX, followerConfig);
    const followerY = useSpring(mouseY, followerConfig);
 
    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY, movementX, movementY } = e;
            mouseX.set(clientX);
            mouseY.set(clientY);
            setMousePosition({ x: clientX, y: clientY });
 
            // Orchestrate Syringe Rotation based on movement vector
            if (Math.abs(movementX) > 2 || Math.abs(movementY) > 2) {
                const angle = Math.atan2(movementY, movementX) * (180 / Math.PI);
                setRotation(angle + 135); 
            }
 
            const target = e.target;
            const isClickable = target.closest('button') || target.closest('a') || target.tagName === 'BUTTON' || target.tagName === 'A';
            
            if (isClickable) {
                setIsHovered(true);
                const text = target.getAttribute('data-cursor') || '';
                setCursorText(text);
            } else {
                setIsHovered(false);
                setCursorText('');
            }
        };

        const handleMouseDown = () => setIsHovered(true);
        const handleMouseUp = () => setIsHovered(false);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [mouseX, mouseY]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[1000] overflow-hidden hidden lg:block">
            
            {/* Minimal Precision Ring */}
            <motion.div
                className="absolute w-6 h-6 rounded-full border border-slate-900/10 flex items-center justify-center"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: '-50%',
                    translateY: '-50%',
                    scale: isHovered ? 1.5 : 1,
                    borderColor: isHovered ? 'var(--hospital-primary)' : 'rgba(0, 0, 0, 0.1)',
                }}
            >
                <div className="w-1 h-1 bg-hospital-primary rounded-full opacity-20"></div>
            </motion.div>

            {/* Core Syringe Focal Point */}
            <motion.div
                className="absolute pointer-events-none text-hospital-primary"
                style={{
                    x: mouseX,
                    y: mouseY,
                    translateX: '-10%',
                    translateY: '-90%',
                    rotate: rotation,
                    scale: isHovered ? 0.8 : 0.5,
                }}
            >
                <div className="relative">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-neon">
                        {/* Needle */}
                        <path d="M5 19L2 22" strokeWidth="3" className="text-hospital-secondary opacity-80" />
                        {/* Barrel */}
                        <rect x="8" y="4" width="6" height="12" rx="1.5" transform="rotate(-45 8 4)" className="fill-white/10" />
                        {/* Plunger */}
                        <motion.path 
                            animate={{ y: isHovered ? 3 : 0 }}
                            d="M16 4L19 1" 
                            strokeWidth="3"
                        />
                        {/* Indicators */}
                        <path d="M10 8L13 11" className="opacity-40" />
                        <path d="M12 6L15 9" className="opacity-40" />
                    </svg>
                    
                    {/* Pulsing Clinical Liquid Drop */}
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0, y: 0 }}
                                animate={{ scale: [1, 1.8, 0], opacity: [1, 0.8, 0], y: 15 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ repeat: Infinity, duration: 1.2 }}
                                className="absolute bottom-[-10px] left-[-2px] w-1.5 h-1.5 bg-hospital-secondary rounded-full blur-[1px]"
                            />
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Dynamic Telemetry Label */}
            <AnimatePresence>
                {isHovered && cursorText && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 35 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute flex flex-col items-start gap-1"
                        style={{
                            x: mouseX,
                            y: mouseY,
                            translateY: '-100%',
                        }}
                    >
                        <div className="px-3 py-1 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-lg shadow-4xl">
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-hospital-primary whitespace-nowrap">{cursorText}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trailing Vapor Effect (Simplified for performance) */}
            <motion.div
                className="absolute w-4 h-4 bg-white/5 rounded-full blur-md"
                style={{
                    x: followerX,
                    y: followerY,
                    translateX: '-50%',
                    translateY: '-50%',
                    opacity: isHovered ? 0.2 : 0,
                }}
            />
        </div>
    );
};

export default CustomCursor;
