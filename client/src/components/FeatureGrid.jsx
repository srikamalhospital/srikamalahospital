import React from 'react';
import { Stethoscope, ShoppingBag, Brain, Heart, Microscope, Sparkles, ChevronRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FeatureGrid = () => {
    const items = [
        {
            title: 'General Consultation',
            telugu: 'జనరల్ కన్సల్టేషన్',
            descriptionTelugu: 'మీ అన్ని ప్రాథమిక ఆరోగ్య అవసరాల కోసం నిపుణులైన జనరల్ ఫిజీషియన్లు.',
            descriptionEnglish: 'Expert general physicians for all your primary healthcare needs.',
            icon: <Stethoscope size={20} />,
            link: '/book',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            title: 'AI Health Analyzer',
            telugu: 'AI రోగ నిర్ధారణ',
            descriptionTelugu: 'తెలివైన లక్షణాల తనిఖీ మరియు ముందస్తు ఆరోగ్య అంచనా.',
            descriptionEnglish: 'Intelligent symptom checker and predictive health assessment.',
            icon: <Brain size={20} />,
            link: '/ai-health',
            color: 'text-indigo-600',
            bg: 'bg-indigo-50'
        },
        {
            title: 'Diagnostic Lab',
            telugu: 'పాథాలజీ ల్యాబ్',
            descriptionTelugu: 'డిజిటల్ రిపోర్ట్ సదుపాయంతో కూడిన అధునాతన పాథాలజీ సేవలు.',
            descriptionEnglish: 'Advanced pathology services with digital report access.',
            icon: <Microscope size={20} />,
            link: '/diagnosis',
            color: 'text-rose-600',
            bg: 'bg-rose-50'
        },
        {
            title: 'Medical Pharmacy',
            telugu: 'అంతర్గత ఫార్మసీ',
            descriptionTelugu: 'వైద్య సరఫరాలు మరియు ప్రిస్క్రిప్షన్ల పూర్తి శ్రేణి.',
            descriptionEnglish: 'Complete range of medical supplies and prescriptions.',
            icon: <ShoppingBag size={20} />,
            link: '/medical-shop',
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            title: 'Cardiac Care',
            telugu: 'గుండె ఆరోగ్యం',
            descriptionTelugu: 'ప్రత్యేక హృదయ ఆరోగ్య పర్యవేక్షణ మరియు నిపుణులైన కార్డియాలజీ.',
            descriptionEnglish: 'Specialized heart health monitoring and expert cardiology.',
            icon: <Heart size={20} />,
            link: '/ai-health',
            color: 'text-red-600',
            bg: 'bg-red-50'
        },
        {
            title: 'Emergency 24/7',
            telugu: 'అత్యవసర విభాగం',
            descriptionTelugu: 'అత్యవసర మరియు ట్రామా రెస్పాన్స్ సేవలు 24 గంటలూ అందుబాటులో ఉంటాయి.',
            descriptionEnglish: 'Round-the-clock emergency and trauma response services.',
            icon: <Sparkles size={20} />,
            link: '/doctors',
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
    ];

    return (
        <section id="services" className="py-10 px-6 bg-hospital-surface relative overflow-hidden grainy font-['Plus_Jakarta_Sans']">

            <div className="container mx-auto max-w-6xl relative z-10">

                <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-8">
                    <div className="max-w-xl text-left">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-8 h-[2px] bg-hospital-primary"></span>
                            <p className="font-['Noto_Sans_Telugu'] text-[10px] font-black uppercase tracking-[0.3em] text-hospital-primary italic">మా ప్రధాన సేవలు <span className="text-[8px] opacity-40 ml-1">Our Core Services</span></p>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-hospital-dark tracking-tightest leading-[0.9] mb-4 font-['Noto_Sans_Telugu']">
                            ప్రీమియం <span className="text-hospital-secondary italic">ప్రత్యేకతలు.</span>
                            <div className="text-[14px] font-black uppercase tracking-[0.3em] text-hospital-dark/10">Premium Specialties</div>
                        </h2>
                        <p className="font-['Noto_Sans_Telugu'] text-lg text-hospital-slate font-medium">మీ ఆరోగ్యం కోసం మా క్లినికల్ సేవలు <span className="text-[10px] opacity-40 ml-1">Our clinical services for your health</span></p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, i) => (
                        <motion.div key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05, duration: 0.8 }}
                            className="bg-white p-8 rounded-3xl border border-black/5 hover:border-hospital-primary/20 transition-all group flex flex-col justify-between"
                        >
                            <div>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                                    {item.icon}
                                </div>
                                <div className="space-y-2 mb-4">
                                    <h3 className="text-xl font-black text-hospital-dark font-['Noto_Sans_Telugu'] tracking-tight">
                                        {item.telugu}
                                    </h3>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-hospital-primary/60 italic">
                                        {item.title}
                                    </p>
                                </div>
                                <div className="space-y-4 mb-8">
                                    <p className="font-['Noto_Sans_Telugu'] text-[12px] font-bold text-hospital-slate leading-relaxed">
                                        {item.descriptionTelugu}
                                    </p>
                                    <p className="text-[10px] font-medium text-hospital-slate/40 leading-relaxed italic">
                                        {item.descriptionEnglish}
                                    </p>
                                </div>
                            </div>

                            <Link to={item.link} className="flex items-center justify-between group/link">
                                <span className="font-['Noto_Sans_Telugu'] text-[11px] font-bold text-hospital-dark group-hover/link:text-hospital-primary transition-colors">మరింత తెలుసుకోండి <span className="text-[8px] opacity-40 ml-1 uppercase tracking-widest">Learn More</span></span>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover/link:bg-hospital-primary group-hover/link:text-white transition-all">
                                    <ArrowUpRight size={14} />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeatureGrid;
