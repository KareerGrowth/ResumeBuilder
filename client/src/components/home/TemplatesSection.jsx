import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Sparkles, CheckCircle, Layout } from 'lucide-react';

const TemplatesSection = () => {
    return (
        <section className="py-20 bg-white" id="templates-preview">
            <div className="max-w-7xl mx-auto px-6">
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
                                <div className="space-y-2 text-indigo-100/80 text-xs font-mono">
                                    <p>• Spearheaded development of...</p>
                                    <p>• Increased system efficiency by 25%...</p>
                                </div>
                                <div className="mt-4 p-3 bg-indigo-500/50 rounded-lg text-xs font-mono text-indigo-100 typing-cursor">
                                    Optimizing keywords...
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
                            {[
                                { text: 'Grammar Verified', active: false },
                                { text: 'ATS Score: 95/100', active: true },
                                { text: 'Action Verbs Strong', active: false }
                            ].map((item, i) => (
                                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${item.active ? 'bg-white border-green-200 shadow-md scale-105' : 'bg-slate-100/50 border-transparent opacity-60'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.active ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <div className={`text-sm font-medium ${item.active ? 'text-slate-800' : 'text-slate-500'}`}>
                                        {item.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

            </div>
        </section>
    );
};

export default TemplatesSection;
