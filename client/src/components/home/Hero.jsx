import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, FileText, Zap, Users, Star, CheckCircle2, TrendingUp, Layout, CheckCircle, Command, Search } from 'lucide-react';

const Hero = () => {
    const { user } = useSelector(state => state.auth);
    return (
        <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-24 overflow-hidden bg-gradient-to-b from-white via-indigo-50/30 to-white">
            {/* Background Decorations */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[140px]" />
                <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-1/2 w-[400px] h-[400px] bg-blue-200/30 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Hero Content */}
                <div className="text-center max-w-4xl mx-auto mb-20">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-200 shadow-sm text-indigo-700 text-sm font-semibold mb-6 hover:shadow-md transition-all"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>AI-Powered Resume Builder</span>
                        <span className="px-2 py-0.5 bg-indigo-100 rounded-full text-xs">v1.0</span>
                    </motion.div>

                    {/* Main Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] mb-6"
                    >
                        Land Your Dream Job with an{' '}
                        <span className="relative inline-block">
                            <span className="relative z-10 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                AI-Powered Resume
                            </span>
                            <svg className="absolute -bottom-2 left-0 w-full h-3 text-indigo-300" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <motion.path
                                    d="M0 8 Q 50 0 100 8"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.2, delay: 0.8 }}
                                />
                            </svg>
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed"
                    >
                        Create ATS-optimized, professional resumes in minutes, not hours. Our AI-powered builder crafts tailored bullet points, suggests impactful keywords, and provides real-time scoring to ensure your resume passes automated filters and lands you 3x more interviews. Choose from expert-designed templates and let technology handle the heavy lifting.
                    </motion.p>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-wrap items-center justify-center gap-6 mb-10 text-sm"
                    >
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-600" />
                            <span className="font-semibold text-slate-700">50,000+ Users</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold text-slate-700">4.9/5 Rating</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                            <span className="font-semibold text-slate-700">95% Success Rate</span>
                        </div>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link
                            to={user ? "/app" : "/app?state=login"}
                            className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all flex items-center gap-2"
                        >
                            <span>Create Your Resume</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>


            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                * { font-family: 'Inter', sans-serif; }
            `}</style>
        </section>
    );
};

export default Hero;
