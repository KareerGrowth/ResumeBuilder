import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, XCircle, AlertCircle, Loader2, Sparkles, AlertTriangle, ArrowLeft, Target, Award, ChevronDown, ChevronRight, LayoutList, RefreshCw, Wand2, Info, Check, X, HelpCircle, ChevronRightSquare, ArrowRight, ListChecks, Type, Maximize, AlignLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import sandGif from '../assets/sand.gif'
import api from '../configs/api';
import { useSelector } from 'react-redux';
import pdfToText from 'react-pdftotext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ATSCheckerPage = () => {
    const { token } = useSelector(state => state.auth);
    const [activeTab, setActiveTab] = useState('upload');
    const [analyzing, setAnalyzing] = useState(false);
    const [projects, setProjects] = useState([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [file, setFile] = useState(null);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [resumeTextRaw, setResumeTextRaw] = useState("");

    // JSON Analysis State
    const [analysisResult, setAnalysisResult] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

    const ws = useRef(null);

    const toggleSection = (sectionName) => {
        setExpandedSections(prev => {
            // If clicking the already open section, close it
            if (prev[sectionName]) {
                return {};
            }
            // Otherwise, close all others and open only this one
            return { [sectionName]: true };
        });
    };

    // Load projects on mount
    useEffect(() => {
        if (token) loadProjects();
        return () => { if (ws.current) ws.current.close(); };
    }, [token]);

    const loadProjects = async () => {
        setIsLoadingProjects(true);
        try {
            const { data } = await api.get('/api/users/resumes', { headers: { Authorization: token } });
            setProjects(data.resumes || []);
        } catch (error) { console.error(error); }
        finally { setIsLoadingProjects(false); }
    };

    const handleAnalyze = async (specificProjectId = null) => {
        let resumeText = "";
        setAnalyzing(true);
        setAnalysisResult(null);
        setActiveTab('results');

        try {
            const effectiveProjectId = specificProjectId || selectedProjectId;

            if ((specificProjectId || activeTab === 'project') && !resumeTextRaw) {
                if (!effectiveProjectId) { toast.error("Select a project"); setAnalyzing(false); return; }
                const project = projects.find(p => p._id === effectiveProjectId);
                if (!project) { toast.error("Project not found"); setAnalyzing(false); return; }

                resumeText = `
${project.personal_info?.first_name || ''} ${project.personal_info?.last_name || ''}
${project.personal_info?.email || ''}
${project.professional_summary || ''}

EXPERIENCE
${project.experience?.map(e => `${e.position} at ${e.company} (${e.start_date} - ${e.end_date})
${e.description}`).join('\n\n')}

EDUCATION
${project.education?.map(e => `${e.degree} in ${e.field} from ${e.institution}`).join('\n')}

SKILLS
${project.skills?.map(s => s.name || s).join(', ')}
                 `;
                setResumeTextRaw(resumeText);
            } else if (activeTab === 'upload' && !resumeTextRaw) {
                if (!file) { toast.error("Please upload a file"); setAnalyzing(false); return; }
                resumeText = await pdfToText(file);
                setResumeTextRaw(resumeText);
            } else {
                resumeText = resumeTextRaw;
            }

            if (!resumeText) { toast.error("No content to analyze"); setAnalyzing(false); return; }

            // WebSocket Connection
            const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
            const wsUrl = baseUrl.replace(/^http/, 'ws');
            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                ws.current.send(JSON.stringify({ type: 'ats_check', resumeText, token }));
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'json_result') {
                    console.log("ATS Analysis Results:", data.content);
                    setAnalysisResult(data.content);
                } else if (data.type === 'done') {
                    setAnalyzing(false);
                    ws.current.close();
                } else if (data.type === 'error') {
                    toast.error(data.message);
                    setAnalyzing(false);
                }
            };

            ws.current.onerror = (error) => {
                console.error("WebSocket Error:", error);
                toast.error("Connection failed. Please try again.");
                setAnalyzing(false);
            }

        } catch (error) {
            console.error(error);
            toast.error("Analysis failed");
            setAnalyzing(false);
        }
    };

    const reset = () => { setAnalysisResult(null); setFile(null); setSelectedProjectId(null); setActiveTab('upload'); setResumeTextRaw(""); };

    // --- Sub-Components ---

    const ScoreGauge = ({ score }) => {
        const radius = 45;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - ((score || 0) / 100) * circumference;
        const getColor = (s) => s >= 80 ? '#10b981' : s >= 50 ? '#eab308' : '#ef4444';

        return (
            <div className="flex flex-col items-center">
                <div className="relative flex items-center justify-center w-28 h-28">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r={radius} stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
                        <circle cx="56" cy="56" r={radius} stroke={getColor(score)} strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-black text-slate-800">{score}%</span>
                    </div>
                </div>
                <span className="text-[11px] font-black uppercase text-slate-400 mt-2 tracking-widest">ATS Match Score</span>
            </div>
        );
    };

    const AuditCard = ({ icon: Icon, title, current, recommended, color }) => (
        <div className="flex-1 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center gap-6 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
            <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-500 shrink-0`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 whitespace-nowrap overflow-hidden text-ellipsis">{title}</h4>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Current</span>
                        <span className="text-xs font-black text-slate-400 line-through truncate">{current || "N/A"}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-blue-500 font-bold uppercase tracking-tighter">Recommended</span>
                        <span className="text-xs font-black text-slate-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 truncate">{recommended}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const ChecklistItem = ({ item }) => {
        const status = item.status ? item.status.toLowerCase() : 'fail';
        const isPass = status === 'pass';
        const isWarn = status === 'warning';
        return (
            <div className="py-3 flex items-start gap-4 group hover:bg-slate-50/50 transition-colors px-4 -mx-4 rounded-2xl">
                <div className="w-48 md:w-56 shrink-0">
                    <h4 className="font-bold text-slate-700 text-xs md:text-sm flex items-center gap-2">
                        {item.label}
                    </h4>
                </div>
                <div className="shrink-0 pt-1">
                    {isPass ? (
                        <div className="p-1 bg-green-100 rounded-full"><Check className="w-3 h-3 text-green-600" /></div>
                    ) : isWarn ? (
                        <div className="p-1 bg-yellow-100 rounded-full"><AlertTriangle className="w-3 h-3 text-yellow-600" /></div>
                    ) : (
                        <div className="p-1 bg-red-100 rounded-full"><X className="w-3 h-3 text-red-600" /></div>
                    )}
                </div>
                <div className="flex-1">
                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-2">{item.message}</p>
                    {!isPass && item.fix && (
                        <div className="flex items-start gap-2 bg-blue-50/30 p-3 rounded-xl border border-blue-100/20">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide shrink-0">Fix:</span>
                            <span className="text-xs md:text-sm text-slate-700 font-medium">{item.fix}</span>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Helper to render ArrowDown icon since it wasn't imported
    const ArrowDown = ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m7 13 5 5 5-5" /><path d="M12 18V6" /></svg>
    );

    return (
        <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link to="/app" className='p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors'><ArrowLeft className="w-5 h-5" /></Link>
                    <h1 className="text-xl font-bold text-slate-800">ATS Resume Checker</h1>
                </div>
                <div className="flex items-center gap-6">
                    {analysisResult && (
                        <button onClick={reset} className="px-5 py-2 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl border border-slate-200 shadow-sm text-xs transition-all flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" /> Rescan New Resume
                        </button>
                    )}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Expert System Live</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-hidden relative w-full h-full flex flex-col">
                {(!analysisResult && !analyzing && activeTab === 'upload') ? (
                    <div className="flex-1 flex items-center justify-center p-4 bg-slate-50 overflow-y-auto">
                        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[550px]">
                            <div className="flex-1 p-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 relative bg-white">
                                <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={(e) => { setFile(e.target.files[0]); setActiveTab('upload'); }} />
                                <div className={`h-full border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center p-10 transition-all duration-300 ${file ? 'border-blue-500 bg-blue-50/30 shadow-inner' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}>
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${file ? 'bg-blue-100 shadow-lg shadow-blue-100' : 'bg-slate-100'}`}>
                                        <UploadCloud className={`w-10 h-10 ${file ? 'text-blue-600' : 'text-slate-400'}`} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 mb-2 text-center">{file ? file.name : "Professional Resume Upload"}</h3>
                                    <p className="text-slate-500 text-center mb-8 max-w-xs text-sm font-medium">Identify structural weaknesses and keyword gaps in seconds.</p>
                                    <button onClick={() => handleAnalyze()} disabled={!file} className={`px-10 py-4 text-sm font-black rounded-2xl relative z-30 transition-all ${file ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                                        Start ATS Analysis
                                    </button>
                                </div>
                            </div>
                            <div className="w-full md:w-[350px] bg-slate-50 flex flex-col">
                                <div className="p-10 pb-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quick Select</h3>
                                    <h2 className="text-lg font-black text-slate-800">Recent Resumes</h2>
                                </div>
                                <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar space-y-3">
                                    {isLoadingProjects ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <img src={sandGif} alt="Loading..." className="w-16 h-16 object-contain mb-4" />
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Syncing Projects...</p>
                                        </div>
                                    ) : (projects.map(p => (
                                        <div key={p._id} onClick={() => { setSelectedProjectId(p._id); setActiveTab('project'); setResumeTextRaw(""); handleAnalyze(p._id); }} className="group p-4 bg-white rounded-2xl border border-slate-200 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                                <FileText className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-800 truncate text-sm">{p.title || "Untitled Resume"}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Ready for analysis</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                                        </div>
                                    )))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden relative">
                        {analyzing && !analysisResult && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md z-50">
                                <img src={sandGif} alt="Analyzing..." className="w-24 h-24 object-contain mb-10" />
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Running Expert Analysis Engine...</h3>
                                <p className="text-slate-500 mt-4 font-bold text-sm uppercase tracking-widest animate-pulse">Checking structural integrity & keyword density</p>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-0 custom-scrollbar scroll-smooth">
                            {analysisResult && (
                                <div className="w-full flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-1000">

                                    <div className="bg-white border-b border-slate-200 shadow-sm overflow-hidden min-h-full">
                                        <div className="px-6 md:px-12 lg:px-12 py-10 space-y-0">

                                            {/* Unified Row: Executive Summary & Score */}
                                            <div className="mb-8 pb-4 border-b border-slate-100">
                                                <div className="flex items-center gap-4 mb-3">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${analysisResult.profile_type === 'Experienced' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                        {analysisResult.profile_type} Profile Identified
                                                    </span>
                                                </div>
                                                <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tightest mb-6">Executive Profile Analysis</h2>

                                                {/* Mobile: Score on top, Desktop: Side by side */}
                                                <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6 md:gap-8">
                                                    {/* Score Gauge - Shows first on mobile, right on desktop */}
                                                    <div className="order-1 md:order-2 shrink-0 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                                        <ScoreGauge score={analysisResult.ats_score} />
                                                    </div>

                                                    {/* Summary Text - Shows second on mobile, left on desktop */}
                                                    <div className="order-2 md:order-1 flex-1 min-w-0 w-full md:w-auto">
                                                        <div className="relative group">
                                                            <div className="flex items-start gap-4 mb-2">
                                                                <Sparkles className="w-6 h-6 text-indigo-500 mt-1 shrink-0" />
                                                                <div className="flex-1">
                                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Executive Summary</h4>
                                                                    <p className="text-slate-800 text-base md:text-lg lg:text-xl font-bold leading-relaxed">
                                                                        {analysisResult.executive_summary}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="text-slate-500 text-xs font-bold mt-4 leading-relaxed italic">
                                                            {analysisResult.score_justification}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Step 2: Formatting Audit (Font, Size, Alignment) */}
                                            {analysisResult.formatting_audit && (
                                                <div className="mb-10">
                                                    <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                                        <Type className="w-5 h-5 text-blue-500" /> Structural & Formatting Audit
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                        <AuditCard
                                                            icon={Type}
                                                            title="Typography (Font)"
                                                            current={analysisResult.formatting_audit.current_font}
                                                            recommended={analysisResult.formatting_audit.recommended_font}
                                                            color="blue"
                                                        />
                                                        <AuditCard
                                                            icon={Maximize}
                                                            title="Font Size"
                                                            current={analysisResult.formatting_audit.current_size}
                                                            recommended={analysisResult.formatting_audit.recommended_size}
                                                            color="indigo"
                                                        />
                                                        <AuditCard
                                                            icon={AlignLeft}
                                                            title="Alignment"
                                                            current={analysisResult.formatting_audit.current_alignment}
                                                            recommended={analysisResult.formatting_audit.recommended_alignment}
                                                            color="emerald"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 3: Current Resume Content Breakdown */}
                                            {analysisResult.current_resume_sections && (
                                                <div className="mb-10 pt-8 border-t border-slate-100">
                                                    <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                                        <ListChecks className="w-6 h-6 text-indigo-500" /> Resume Content Architecture (Dynamic)
                                                    </h3>

                                                    {/* Grid of Section Cards */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                                                        {analysisResult.current_resume_sections.map((section, i) => (
                                                            <div key={i} className="flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden transition-all duration-300 hover:border-indigo-200">
                                                                <button
                                                                    onClick={() => toggleSection(section)}
                                                                    className={`w-full flex flex-row items-center gap-3 md:gap-5 p-4 md:p-6 transition-all duration-300 text-left ${expandedSections[section] ? 'border-indigo-300 bg-indigo-50/30' : 'bg-slate-50/30 hover:bg-slate-50'}`}
                                                                >
                                                                    <div className={`w-10 h-10 rounded-xl bg-white border-2 flex items-center justify-center text-sm font-black transition-all shrink-0 ${expandedSections[section] ? 'border-indigo-200 text-indigo-600' : 'border-slate-100 text-slate-400'}`}>
                                                                        {i + 1}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="text-lg md:text-xl font-black text-slate-800 leading-none truncate">{section}</h4>
                                                                    </div>
                                                                    <div className="shrink-0 flex items-center gap-2 md:gap-3">
                                                                        <div className="text-right">
                                                                            <div className="text-lg md:text-xl font-black text-indigo-600">{analysisResult.metrics?.[section]?.score || 85}%</div>
                                                                        </div>
                                                                        <ChevronRight className={`w-5 h-5 text-slate-300 transition-all duration-300 ${expandedSections[section] ? 'rotate-90 text-indigo-500' : ''}`} />
                                                                    </div>
                                                                </button>

                                                                {/* Mobile Dropdown (visible only on mobile) */}
                                                                <AnimatePresence>
                                                                    {expandedSections[section] && (
                                                                        <motion.div
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: 'auto', opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                                            className="md:hidden"
                                                                        >
                                                                            <div className="px-6 pb-6 pt-2">
                                                                                <div className="h-px bg-slate-100 mb-4" />

                                                                                {/* User's Resume Content */}
                                                                                {analysisResult.section_content?.[section] && (
                                                                                    <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                                                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Your Content</h5>
                                                                                        {(() => {
                                                                                            const content = analysisResult.section_content[section];
                                                                                            const lines = content.split('\n').filter(line => line.trim());
                                                                                            const isShortList = lines.length === 1 && !content.includes('•') && !content.includes('-') && content.split(' ').length <= 10;

                                                                                            if (isShortList) {
                                                                                                const items = content.trim().split(/\s+/);
                                                                                                return (
                                                                                                    <div className="flex flex-wrap gap-2">
                                                                                                        {items.map((item, idx) => (
                                                                                                            <span key={idx} className="px-3 py-1.5 bg-white border border-indigo-200 text-slate-700 text-sm rounded-full">
                                                                                                                {item}
                                                                                                            </span>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                );
                                                                                            } else {
                                                                                                return (
                                                                                                    <div className="text-sm text-slate-700 space-y-2">
                                                                                                        {lines.map((line, idx) => (
                                                                                                            <div key={idx} className="leading-relaxed">
                                                                                                                {line.trim().startsWith('•') || line.trim().startsWith('-') ? (
                                                                                                                    <div className="flex gap-2">
                                                                                                                        <span className="text-indigo-500 shrink-0">•</span>
                                                                                                                        <span>{line.replace(/^[•\-]\s*/, '')}</span>
                                                                                                                    </div>
                                                                                                                ) : (
                                                                                                                    <div>{line}</div>
                                                                                                                )}
                                                                                                            </div>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                );
                                                                                            }
                                                                                        })()}
                                                                                    </div>
                                                                                )}

                                                                                {/* AI Analysis Points */}
                                                                                <div className="space-y-0">
                                                                                    {analysisResult.detailed_analysis?.[section]?.map((point, idx) => (
                                                                                        <div key={idx} className="flex items-start gap-2 py-1.5">
                                                                                            <div className="shrink-0 mt-0.5">
                                                                                                {point.status === 'good' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> :
                                                                                                    point.status === 'bad' ? <XCircle className="w-4 h-4 text-rose-600" /> :
                                                                                                        <AlertTriangle className="w-4 h-4 text-amber-600" />}
                                                                                            </div>
                                                                                            <div className="flex-1">
                                                                                                <p className="text-sm text-slate-700 leading-relaxed">
                                                                                                    <span className="font-semibold">{point.label}:</span> {point.message}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Desktop Detail Section Below Grid (hidden on mobile) */}
                                                    <AnimatePresence>
                                                        {Object.keys(expandedSections).find(key => expandedSections[key]) && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                                className="hidden md:block bg-white rounded-3xl border border-indigo-200 overflow-hidden"
                                                            >
                                                                {analysisResult.current_resume_sections.map((section) => (
                                                                    expandedSections[section] && (
                                                                        <div key={section} className="p-6">
                                                                            <h3 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                                                                                <span className="text-indigo-600">{section}</span>
                                                                                <span className="text-sm font-bold text-slate-400">Detailed Analysis</span>
                                                                            </h3>

                                                                            <div className="h-px bg-slate-100 mb-6" />

                                                                            {/* User's Resume Content */}
                                                                            {analysisResult.section_content?.[section] && (
                                                                                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                                                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Your Content</h5>
                                                                                    {(() => {
                                                                                        const content = analysisResult.section_content[section];
                                                                                        const lines = content.split('\n').filter(line => line.trim());
                                                                                        const isShortList = lines.length === 1 && !content.includes('•') && !content.includes('-') && content.split(' ').length <= 10;

                                                                                        if (isShortList) {
                                                                                            const items = content.trim().split(/\s+/);
                                                                                            return (
                                                                                                <div className="flex flex-wrap gap-2">
                                                                                                    {items.map((item, idx) => (
                                                                                                        <span key={idx} className="px-3 py-1.5 bg-white border border-indigo-200 text-slate-700 text-sm rounded-full">
                                                                                                            {item}
                                                                                                        </span>
                                                                                                    ))}
                                                                                                </div>
                                                                                            );
                                                                                        } else {
                                                                                            return (
                                                                                                <div className="text-sm text-slate-700 space-y-2">
                                                                                                    {lines.map((line, idx) => (
                                                                                                        <div key={idx} className="leading-relaxed">
                                                                                                            {line.trim().startsWith('•') || line.trim().startsWith('-') ? (
                                                                                                                <div className="flex gap-2">
                                                                                                                    <span className="text-indigo-500 shrink-0">•</span>
                                                                                                                    <span>{line.replace(/^[•\-]\s*/, '')}</span>
                                                                                                                </div>
                                                                                                            ) : (
                                                                                                                <div>{line}</div>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    ))}
                                                                                                </div>
                                                                                            );
                                                                                        }
                                                                                    })()}
                                                                                </div>
                                                                            )}

                                                                            {/* AI Analysis Points */}
                                                                            <div>
                                                                                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">AI Feedback</h5>
                                                                                <div className="space-y-0">
                                                                                    {analysisResult.detailed_analysis?.[section]?.map((point, idx) => (
                                                                                        <div key={idx} className="flex items-start gap-2 py-1.5">
                                                                                            <div className="shrink-0 mt-0.5">
                                                                                                {point.status === 'good' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> :
                                                                                                    point.status === 'bad' ? <XCircle className="w-4 h-4 text-rose-600" /> :
                                                                                                        <AlertTriangle className="w-4 h-4 text-amber-600" />}
                                                                                            </div>
                                                                                            <div className="flex-1">
                                                                                                <p className="text-sm text-slate-700 leading-relaxed">
                                                                                                    <span className="font-semibold">{point.label}:</span> {point.message}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}


                                            {/* Final Optimized Master Draft */}
                                            <div className="pt-16 border-t-2 border-slate-900 pb-12">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
                                                    <div>
                                                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter mb-1">The Expert-Standard Draft</h3>
                                                        <p className="text-slate-500 font-bold text-[11px] uppercase tracking-widest">Fully optimized for ATS parsing and human readability</p>
                                                    </div>
                                                    <button onClick={() => { navigator.clipboard.writeText(analysisResult.optimized_resume_markdown); toast.success("Draft Copied to Clipboard!"); }} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] shadow-2xl shadow-slate-400 hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-3 self-start">
                                                        <FileText className="w-5 h-5" /> Copy Markdown Source
                                                    </button>
                                                </div>
                                                <div className="p-10 bg-slate-900 rounded-[3rem] font-mono text-indigo-200 text-xs md:text-sm overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-deep-xl border-2 border-slate-800 shadow-indigo-500/10">
                                                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800/50">
                                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                                                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                                        <span className="ml-4 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Resume_Draft_Optimized.md</span>
                                                    </div>
                                                    {analysisResult.optimized_resume_markdown}
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ATSCheckerPage;
