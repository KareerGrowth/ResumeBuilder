import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, XCircle, AlertCircle, Loader2, Sparkles, AlertTriangle, ArrowLeft, Target, Award, ChevronDown, ChevronRight, LayoutList, RefreshCw, Wand2, Info, Check, X, HelpCircle, ChevronRightSquare } from 'lucide-react';
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
    const [activeSection, setActiveSection] = useState('Overall Verdict');

    const ws = useRef(null);

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

    // Scroll to section handler
    const scrollToSection = (sectionId) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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
    const handleOptimize = async () => { toast("Optimization feature coming soon!", { icon: "✨" }); };

    // --- Sub-Components ---

    const ScoreGauge = ({ score }) => {
        const radius = 45; // Reduced from 56
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - ((score || 0) / 100) * circumference;
        const getColor = (s) => s >= 80 ? '#10b981' : s >= 50 ? '#eab308' : '#ef4444'; // Green, Yellow, Red

        return (
            <div className="flex flex-col items-center">
                <h3 className="text-lg font-bold text-slate-800 mb-3">Match Rate</h3>
                <div className="relative flex items-center justify-center w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r={radius} stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
                        <circle cx="64" cy="64" r={radius} stroke={getColor(score)} strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-black text-slate-800">{score}%</span>
                    </div>
                </div>
            </div>
        );
    };

    const NavItem = ({ label, metric, active, onClick }) => (
        <button onClick={onClick} className="w-full group mb-3 outline-none text-left">
            <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-bold transition-colors ${active ? 'text-blue-600' : 'text-slate-600 group-hover:text-slate-800'}`}>{label}</span>
                {metric && metric.issues > 0 && <span className="text-[10px] text-blue-500 font-bold bg-blue-50 px-1.5 py-0.5 rounded-full">{metric.issues} issues</span>}
            </div>
            {metric && (
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${metric.score >= 80 ? 'bg-blue-500' : metric.score >= 50 ? 'bg-blue-400' : 'bg-red-400'}`}
                        style={{ width: `${metric.score}%` }}
                    />
                </div>
            )}
        </button>
    );

    // ... ChecklistItem remains mostly same but can be compacted if needed ...
    const ChecklistItem = ({ item }) => {
        const status = item.status ? item.status.toLowerCase() : 'fail';
        const isPass = status === 'pass';
        const isWarn = status === 'warning';
        return (
            <div className="py-4 border-b border-slate-100 last:border-0 flex items-start gap-4 group hover:bg-slate-50/50 transition-colors px-4 -mx-4 rounded-xl">
                <div className="w-40 shrink-0 pt-1">
                    <h4 className="font-bold text-slate-700 text-xs flex items-center gap-2">
                        {item.label}
                    </h4>
                </div>
                <div className="shrink-0 pt-0.5">
                    {isPass ? (
                        <div className="p-1 bg-green-100 rounded-full"><Check className="w-3 h-3 text-green-600" /></div>
                    ) : isWarn ? (
                        <div className="p-1 bg-yellow-100 rounded-full"><AlertTriangle className="w-3 h-3 text-yellow-600" /></div>
                    ) : (
                        <div className="p-1 bg-red-100 rounded-full"><X className="w-3 h-3 text-red-600" /></div>
                    )}
                </div>
                <div className="flex-1">
                    <p className="text-slate-600 text-xs leading-relaxed mb-2">{item.message}</p>

                    {!isPass && item.fix && (
                        <div className="flex flex-col gap-2 mt-1">
                            <div className="flex items-start gap-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide shrink-0 mt-0.5">Fix:</span>
                                <span className="text-xs text-slate-700 font-medium">{item.fix}</span>
                            </div>
                        </div>
                    )}

                    {item.sub_items && item.sub_items.length > 0 && (
                        <ul className="mt-2 space-y-1 pl-1 border-l-2 border-slate-200 ml-1">
                            {item.sub_items.map((sub, idx) => (
                                <li key={idx} className="text-[10px] text-slate-500 pl-2">{sub}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 z-30 shadow-sm">
                <div className="flex items-center gap-3">
                    <Link to="/app" className='p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors'><ArrowLeft className="w-4 h-4" /></Link>
                    <h1 className="text-lg font-bold text-slate-800">ATS Resume Checker</h1>
                </div>
                <div className="hidden md:flex items-center gap-2 px-2 py-0.5 bg-slate-100 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Analysis Active</span>
                </div>
            </header>

            <div className="flex-1 overflow-hidden relative w-full h-full flex flex-col">
                {(!analysisResult && !analyzing && activeTab === 'upload') ? (
                    /* Initial Upload State - Compacted */
                    <div className="flex-1 flex items-center justify-center p-4 bg-slate-50 overflow-y-auto">
                        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                            {/* Drag & Drop Zone */}
                            <div className="flex-1 p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 relative bg-white">
                                <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={(e) => { setFile(e.target.files[0]); setActiveTab('upload'); }} />
                                <div className={`h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all duration-300 ${file ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}>
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${file ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                        <UploadCloud className={`w-8 h-8 ${file ? 'text-blue-600' : 'text-slate-400'}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-1 text-center">{file ? file.name : "Upload Resume PDF"}</h3>
                                    <p className="text-slate-500 text-center mb-6 max-w-xs text-sm">Drag & drop your resume here, or click to browse files.</p>
                                    <button onClick={() => handleAnalyze()} disabled={!file} className={`px-8 py-3 text-sm font-bold rounded-xl relative z-30 transition-all ${file ? 'bg-blue-600 text-white shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                                        Analyze Resume
                                    </button>
                                </div>
                            </div>
                            {/* Project Selection */}
                            <div className="w-full md:w-[320px] bg-slate-50 flex flex-col">
                                <div className="p-6 pb-2">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Quick Select</h3>
                                    <h2 className="text-base font-bold text-slate-800">Recent Projects</h2>
                                </div>
                                <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar space-y-2">
                                    {isLoadingProjects ? (
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mb-2" />
                                            <p className="text-xs text-slate-500 font-medium">Loading Projects...</p>
                                        </div>
                                    ) : (projects.map(p => (
                                        <div key={p._id} onClick={() => { setSelectedProjectId(p._id); setActiveTab('project'); setResumeTextRaw(""); handleAnalyze(p._id); }} className="group p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-blue-500 hover:shadow-sm transition-all flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                                <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-700 truncate text-sm">{p.title || "Untitled Resume"}</h4>
                                                <p className="text-[10px] text-slate-400 truncate">Last edited recently</p>
                                            </div>
                                            <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                        </div>
                                    )))}
                                    {!isLoadingProjects && projects.length === 0 && (
                                        <div className="text-center py-8 text-slate-400 text-sm">No projects found.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Full Page Analysis View */
                    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden">

                        {/* 1. Left Sidebar (Navigation & Score) - Compacted */}
                        <div className="w-full md:w-[300px] bg-white border-r border-slate-200 flex flex-col h-full z-20 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                            <div className="p-5 pb-2">
                                {analyzing && !analysisResult ? (
                                    <div className="h-40 flex items-center justify-center flex-col gap-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                        <div className="text-center">
                                            <h3 className="font-bold text-slate-800 mb-0.5 text-sm">Analyzing...</h3>
                                            <p className="text-[10px] text-slate-500">Processing resume...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center">
                                        <ScoreGauge score={analysisResult?.ats_score} />
                                    </div>
                                )}
                            </div>

                            {/* Actions - Minimized */}
                            <div className="px-5 py-4 space-y-2 border-b border-slate-100">
                                <button onClick={reset} className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-sm text-xs transition-all flex items-center justify-center gap-2">
                                    <RefreshCw className="w-3.5 h-3.5" /> Rescan New Resume
                                </button>
                            </div>

                            {/* Categories List */}
                            <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Analysis Breakdown</h3>
                                {analysisResult && (
                                    <NavItem
                                        label="Overall Verdict"
                                        metric={{ score: analysisResult?.ats_score || 0, issues: 0 }}
                                        active={activeSection === 'Overall Verdict'}
                                        onClick={() => scrollToSection('Overall Verdict')}
                                    />
                                )}
                                {analysisResult?.metrics && Object.keys(analysisResult.metrics).map(key => (
                                    <NavItem key={key} label={key} metric={analysisResult.metrics[key]} active={activeSection === key} onClick={() => scrollToSection(key)} />
                                ))}
                            </div>
                        </div>

                        {/* 2. Main Panel (Detailed Analysis) */}
                        <div className="flex-1 bg-white flex flex-col h-full overflow-hidden relative">
                            {/* Loading Overlay */}
                            {analyzing && !analysisResult && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50">
                                    <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-8" />
                                    <h3 className="text-2xl font-bold text-slate-800">Analyzing your resume...</h3>
                                    <p className="text-slate-500 mt-2 text-lg">Comparing against industry standards.</p>
                                </div>
                            )}

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white scroll-smooth" id="report-container">
                                {analysisResult && (
                                    <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

                                        {/* 1. Overall Verdict Section */}
                                        <div id="Overall Verdict" className="scroll-mt-6">
                                            <div className="flex items-center gap-3 mb-6">
                                                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Overall Verdict</h2>
                                            </div>
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100 shadow-sm">
                                                <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Executive Summary</h3>
                                                <p className="text-blue-900 leading-loose text-base font-medium">{analysisResult.overall_verdict.summary}</p>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                                    <div>
                                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200/50 pb-2">Top Strengths</h3>
                                                        <ul className="space-y-4">
                                                            {analysisResult.overall_verdict.strengths.map((s, i) => (
                                                                <li key={i} className="flex items-start gap-3 text-slate-700 text-sm font-medium">
                                                                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5" /></div>
                                                                    <span className="pt-0.5">{s}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200/50 pb-2">Critical Issues</h3>
                                                        <ul className="space-y-4">
                                                            {analysisResult.overall_verdict.red_flags.map((s, i) => (
                                                                <li key={i} className="flex items-start gap-3 text-slate-700 text-sm font-medium">
                                                                    <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0"><X className="w-3.5 h-3.5" /></div>
                                                                    <span className="pt-0.5">{s}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>

                                                <div className="mt-8 pt-8 border-t border-blue-100">
                                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-orange-500" /> Strategic Roadmap</h3>
                                                    <div className="space-y-3">
                                                        {analysisResult.overall_verdict.roadmap.map((step, i) => (
                                                            <div key={i} className="flex items-center gap-4 p-4 bg-white/60 border border-blue-100 rounded-xl">
                                                                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-lg shadow-slate-200">{i + 1}</div>
                                                                <p className="text-slate-800 font-bold text-sm">{step}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. Dynamic Detailed Sections */}
                                        {analysisResult.detailed_analysis && Object.keys(analysisResult.detailed_analysis).map((sectionKey) => (
                                            <div key={sectionKey} id={sectionKey} className="scroll-mt-6">
                                                <div className="h-px bg-slate-100 w-full mb-12"></div>
                                                <div className="flex items-center gap-3 mb-6">
                                                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{sectionKey}</h2>
                                                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                        Score: {analysisResult.metrics[sectionKey]?.score || 0}
                                                    </span>
                                                </div>

                                                <div className="space-y-8">
                                                    {/* Section Summary */}
                                                    {analysisResult.detailed_analysis[sectionKey]?.summary && (
                                                        <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl">
                                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Analysis</h4>
                                                            <p className="text-slate-700 text-sm leading-relaxed">{analysisResult.detailed_analysis[sectionKey].summary}</p>
                                                        </div>
                                                    )}

                                                    {/* Section Items */}
                                                    {analysisResult.detailed_analysis[sectionKey]?.items && (
                                                        <div className="grid gap-0">
                                                            {analysisResult.detailed_analysis[sectionKey].items.map((item, idx) => (
                                                                <ChecklistItem key={idx} item={item} />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default ATSCheckerPage;
