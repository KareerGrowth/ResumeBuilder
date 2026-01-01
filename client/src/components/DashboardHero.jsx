import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mic, ArrowUpRight, ArrowDownLeft, Repeat, MoreVertical } from 'lucide-react';

const DashboardHero = ({ onCreateResume }) => {
    return (
        <section className="relative w-full rounded-3xl bg-white overflow-hidden font-[Poppins] mb-6 border border-slate-100 shadow-[0_0_30px_rgba(148,163,184,0.15)]">

            <div className="w-full grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 lg:gap-8 items-center p-8 lg:p-12">

                {/* LEFT CONTENT */}
                <div className="z-10 flex flex-col items-start text-left w-full">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-6xl lg:text-7xl xl:text-[5.4rem] font-bold tracking-tight text-slate-900 leading-[1.05] mb-8"
                    >
                        Smart-Resume<br />
                        management <br />
                        with Ai
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-base md:text-lg text-slate-500 mb-10 max-w-xl leading-relaxed font-light"
                    >
                        Create professional, ATS-optimized resumes with our advanced AI builder. Get instant scoring and personalized feedback to ensure your profile stands out to recruiters.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <button
                            onClick={onCreateResume}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 group transform hover:-translate-y-1"
                        >
                            <span>Create New Resume</span>
                        </button>
                    </motion.div>
                </div>

                {/* RIGHT VISUALS (FLOATING UI) */}
                <div className="relative z-10 w-full h-[500px] hidden lg:flex items-center justify-center lg:justify-end">

                    {/* Soft Gradient Background Blob */}
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-indigo-50 via-purple-50 to-white rounded-full blur-[80px] -z-10 opacity-70"></div>

                    {/* Main Container Mockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="relative w-full max-w-sm bg-white/60 backdrop-blur-xl border border-white/80 rounded-[32px] p-6 shadow-2xl shadow-indigo-100/50"
                    >

                        {/* Top Bubble */}
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="bg-white rounded-2xl p-5 mb-4 shadow-sm relative overflow-hidden text-center border border-slate-200"
                        >
                            <h3 className="text-xs font-semibold text-slate-900 mb-1">Hey, need help?</h3>
                            <p className="text-lg font-light text-slate-400">Ask me anything about your resume?</p>

                            <div className="mt-4 flex justify-center">
                                <div className="w-10 h-10 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200/50">
                                    <Mic className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Career Card */}
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-slate-200"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-lg font-bold text-slate-900 tracking-tight">RESUME</span>
                                <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full">Pro</span>
                            </div>

                            <div className="mb-6">
                                <p className="text-xs text-slate-400 mb-1">ATS Score</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                                    </div>
                                    <span className="text-2xl font-bold text-slate-900">75%</span>
                                </div>
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-100 hover:bg-slate-50 transition-colors whitespace-nowrap">
                                    <ArrowUpRight className="w-3 h-3 text-slate-400" />
                                    <span className="text-[10px] font-medium text-slate-600">Scan</span>
                                </button>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-100 hover:bg-slate-50 transition-colors whitespace-nowrap">
                                    <ArrowDownLeft className="w-3 h-3 text-slate-400" />
                                    <span className="text-[10px] font-medium text-slate-600">Download</span>
                                </button>
                                <button className="flex items-center justify-center w-7 h-7 rounded-full border border-slate-100 hover:bg-slate-50 transition-colors shrink-0">
                                    <MoreVertical className="w-3 h-3 text-slate-400" />
                                </button>
                            </div>
                        </motion.div>

                        {/* Activity Manager */}
                        <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-semibold text-slate-900">Activity</h4>
                                <div className="flex gap-2 text-[10px] font-medium text-slate-400">
                                    <span className="text-slate-900">7d</span>
                                    <span>15d</span>
                                    <span>30d</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end h-12 mb-1">
                                <div className="w-6 bg-indigo-50 rounded-t h-[60%]"></div>
                                <div className="w-6 bg-indigo-50 rounded-t h-[40%]"></div>
                                <div className="w-6 bg-indigo-500 rounded-t h-[80%] shadow-md shadow-indigo-200"></div>
                                <div className="w-6 bg-indigo-50 rounded-t h-[50%]"></div>
                                <div className="w-6 bg-indigo-50 rounded-t h-[30%]"></div>
                            </div>
                        </motion.div>

                    </motion.div>
                </div>

            </div>

            {/* FONT IMPORT */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                div, p, h1, h2, h3, h4, h5, h6, span, button { font-family: 'Poppins', sans-serif; }
            `}</style>
        </section>
    );
};

export default DashboardHero;
