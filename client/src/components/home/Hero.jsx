import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Command, Search, CheckCircle, Layout, MousePointer2 } from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden bg-white">
            {/* Background Decorations (Indigo/Purple Glow) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 opacity-40 pointer-events-none w-full max-w-7xl">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-200/50 rounded-full blur-[120px]" />
                <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-purple-200/50 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center relative z-10">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-sm font-medium mb-8 hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-default"
                >
                    <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
                    <span>AI-Powered Resume Builder v2.0</span>
                </motion.div>

                {/* Main Heading with Underline Animation */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-8 max-w-5xl"
                >
                    Build your professional <br className="hidden md:block" />
                    <span className="relative inline-block text-indigo-600">
                        resume
                        {/* Hand-drawn Underline SVG */}
                        <svg className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-3 md:h-4 text-indigo-400 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <motion.path
                                d="M0 5 Q 50 10 100 5"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="2"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1, delay: 0.8 }}
                            />
                        </svg>
                    </span> in minutes.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed"
                >
                    Create ATS-optimized resumes with our intelligent builder. Choose from professionally designed templates and let AI handle the writing.
                </motion.p>

                {/* Search/Action Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="w-full max-w-xl relative mb-20 group"
                >
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="What is your job role? (e.g. Software Engineer)"
                        className="w-full py-4 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
                        readOnly // It's a mock input for the landing page
                    />
                    <div className="absolute right-2 top-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-400 hidden sm:flex items-center gap-1">
                        <Command className="w-3 h-3" />
                        <span>K</span>
                    </div>
                </motion.div>

                {/* Staggered Grid Visuals */}
                {/* Staggered Grid Visuals - Wrapped for Full Screen Center View */}
                <div id="templates-preview" className="min-h-screen w-full flex flex-col items-center justify-center scroll-mt-0 relative z-20 py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-2xl mx-auto mb-16"
                    >
                        <span className="text-sm font-semibold text-indigo-600 tracking-wider uppercase mb-2 block">Templates</span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Start with a professional design</h2>
                        <p className="text-slate-600 text-lg">Choose from our collection of ATS-friendly templates.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl mx-auto">
                        {/* Card 1: Resume Preview */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="bg-slate-50 rounded-3xl p-6 border border-slate-200/60 aspect-[4/5] md:aspect-auto md:h-[400px] relative overflow-hidden group hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-500"
                        >
                            <div className="absolute top-6 left-6 right-6">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                                        <Layout className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">ATS-Ready Layouts</h3>
                                </div>
                                <p className="text-sm text-slate-500 ml-12">Optimized for parsing.</p>
                            </div>
                            <img
                                src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80"
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] rounded-t-lg shadow-2xl border border-slate-200 transition-transform duration-500 group-hover:translate-y-[-10px] group-hover:scale-105"
                                alt="Resume Template"
                            />
                        </motion.div>

                        {/* Card 2: AI Writing (Center, Taller/Prominent) */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white md:-mt-12 md:mb-12 shadow-2xl shadow-indigo-200 relative overflow-hidden group"
                        >
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-100 text-xs font-medium mb-6">
                                    <Sparkles className="w-3 h-3" />
                                    <span>AI Writer</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Smart Content Generation</h3>
                                <p className="text-indigo-100 text-sm leading-relaxed mb-8">
                                    Let our AI write professional summaries and bullet points for you.
                                </p>

                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                    <div className="flex gap-3 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-red-400" />
                                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                        <div className="w-2 h-2 rounded-full bg-green-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-2 w-3/4 bg-white/20 rounded" />
                                        <div className="h-2 w-1/2 bg-white/20 rounded" />
                                    </div>
                                    <div className="mt-4 p-3 bg-indigo-500/50 rounded-lg text-xs font-mono text-indigo-100 typing-cursor">
                                        Generated 3 bullet points...
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Circles */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2" />
                        </motion.div>

                        {/* Card 3: Real-time Check */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="bg-slate-50 rounded-3xl p-6 border border-slate-200/60 aspect-[4/5] md:aspect-auto md:h-[400px] relative overflow-hidden group hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-500"
                        >
                            <div className="absolute top-6 left-6 right-6">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Instant Feedback</h3>
                                </div>
                                <p className="text-sm text-slate-500 ml-12">Live improvements as you type.</p>
                            </div>

                            <div className="absolute bottom-8 left-6 right-6 space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${i === 2 ? 'bg-white border-green-200 shadow-md scale-105' : 'bg-slate-100/50 border-transparent opacity-60'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${i === 2 ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                                            <CheckCircle className="w-4 h-4" />
                                        </div>
                                        <div className="h-2 w-24 bg-current opacity-20 rounded" />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                * { font-family: 'Poppins', sans-serif; }
            `}</style>
        </section>
    );
};

export default Hero;
