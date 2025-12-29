import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, XCircle, AlertCircle, Loader2, X, ChevronRight, Gauge } from 'lucide-react';
import api from '../configs/api';
import { useSelector } from 'react-redux';
import pdfToText from 'react-pdftotext';
import toast from 'react-hot-toast';

const ATSChecker = ({ onClose }) => {
    const { token } = useSelector(state => state.auth);
    const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'project'
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [projects, setProjects] = useState([]);

    // Inputs
    const [file, setFile] = useState(null);
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    // Results
    const [result, setResult] = useState(null);

    // Load projects on mount
    useEffect(() => {
        if (activeTab === 'project') {
            loadProjects();
        }
    }, [activeTab]);

    const loadProjects = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/users/resumes', { headers: { Authorization: token } });
            setProjects(data.resumes || []);
        } catch (error) {
            console.error("Error loading projects", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        let resumeText = "";
        setAnalyzing(true);
        try {
            if (activeTab === 'upload') {
                if (!file) {
                    toast.error("Please upload a file first");
                    setAnalyzing(false);
                    return;
                }
                resumeText = await pdfToText(file);
            } else {
                if (!selectedProjectId) {
                    toast.error("Please select a project");
                    setAnalyzing(false);
                    return;
                }
                // Fetch resume data and convert to text representation 
                // Alternatively, we can send ID to backend, but backend 'ats-check' expects text.
                // Let's reconstruct text from project data client-side for simplicity or fetch it.
                // Actually, the 'project' data in 'allResumes' might be light. Let's fetch full resume or just use what we have?
                // The dashboard list usually has full data or enough.
                const project = projects.find(p => p._id === selectedProjectId);
                if (!project) throw new Error("Project not found");

                // Simple text construction from project object
                resumeText = `
                    ${project.personal_info?.first_name || ''} ${project.personal_info?.last_name || ''}
                    ${project.personal_info?.email || ''}
                    ${project.professional_summary || ''}
                    
                    Experience:
                    ${project.experience?.map(e => `${e.position} at ${e.company} (${e.start_date} - ${e.end_date}): ${e.description}`).join('\n') || ''}
                    
                    Education:
                    ${project.education?.map(e => `${e.degree} in ${e.field} from ${e.institution}`).join('\n') || ''}
                    
                    Skills:
                    ${project.skills?.map(s => s.name || s).join(', ') || ''}
                `;
            }

            // Call API
            const { data } = await api.post('/api/ai/ats-check', { resumeText }, { headers: { Authorization: token } });
            setResult(data);

        } catch (error) {
            console.error(error);
            toast.error("Analysis failed. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    const reset = () => {
        setResult(null);
        setFile(null);
        setSelectedProjectId(null);
    };

    const ScoreGauge = ({ score }) => {
        const getColor = (s) => {
            if (s >= 80) return 'text-green-600';
            if (s >= 50) return 'text-yellow-600';
            return 'text-red-600';
        };

        const getBgColor = (s) => {
            if (s >= 80) return 'bg-green-100';
            if (s >= 50) return 'bg-yellow-100';
            return 'bg-red-100';
        };

        return (
            <div className="relative flex items-center justify-center w-40 h-40 mx-auto mb-6">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                        className="text-slate-200"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    />
                    <path
                        className={getColor(score)}
                        strokeDasharray={`${score}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>
                <div className={`absolute inset-4 rounded-full flex flex-col items-center justify-center ${getBgColor(score)} bg-opacity-30`}>
                    <span className={`text-4xl font-bold ${getColor(score)}`}>{score}</span>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">ATS Score</span>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className={`bg-white rounded-2xl shadow-2xl w-full ${result ? 'max-w-4xl' : 'max-w-2xl'} min-h-[500px] flex flex-col relative transition-all duration-500 overflow-hidden`}>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-indigo-600" />
                            ATS Score Checker
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Analyze your resume against ATS standards</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {analyzing ? (
                        <div className="flex flex-col items-center justify-center h-full py-20">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-indigo-600 animate-pulse" />
                                </div>
                            </div>
                            <h3 className="mt-8 text-xl font-semibold text-slate-800">Analyzing your resume...</h3>
                            <p className="text-slate-500 mt-2">Checking keywords, formatting, and readability</p>
                        </div>
                    ) : result ? (
                        <div className="p-8">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                {/* Left: Score */}
                                <div className="w-full md:w-1/3 text-center sticky top-0">
                                    <ScoreGauge score={result.score} />
                                    <div className="space-y-4">
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <h4 className="font-semibold text-slate-700 mb-1">Impact</h4>
                                            <p className="text-sm text-slate-500">
                                                {result.score >= 80 ? 'Excellent! Your resume is highly competitive.' :
                                                    result.score >= 50 ? 'Good start, but needs optimization.' :
                                                        'Needs significant improvement to pass ATS filters.'}
                                            </p>
                                        </div>
                                        <button onClick={reset} className="w-full py-2 border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                                            Check Another
                                        </button>
                                    </div>
                                </div>

                                {/* Right: Details */}
                                <div className="w-full md:w-2/3 space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-500" /> Strengths
                                        </h3>
                                        <ul className="space-y-2">
                                            {result.strengths.map((item, i) => (
                                                <li key={i} className="flex gap-3 text-slate-600 bg-green-50 p-3 rounded-lg border border-green-100 text-sm">
                                                    <div className="min-w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"></div>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-yellow-500" /> Improvements Needed
                                        </h3>
                                        <ul className="space-y-2">
                                            {result.suggestions.map((item, i) => (
                                                <li key={i} className="flex gap-3 text-slate-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm">
                                                    <div className="min-w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5"></div>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                            <XCircle className="w-5 h-5 text-red-500" /> Weaknesses
                                        </h3>
                                        <ul className="space-y-2">
                                            {result.weaknesses.map((item, i) => (
                                                <li key={i} className="flex gap-3 text-slate-600 bg-red-50 p-3 rounded-lg border border-red-100 text-sm">
                                                    <div className="min-w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></div>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            {/* Tabs */}
                            <div className="flex border-b border-slate-200">
                                <button
                                    onClick={() => setActiveTab('upload')}
                                    className={`flex-1 py-4 text-sm font-medium text-center transition-colors border-b-2 ${activeTab === 'upload' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    Upload Resume (PDF)
                                </button>
                                <button
                                    onClick={() => setActiveTab('project')}
                                    className={`flex-1 py-4 text-sm font-medium text-center transition-colors border-b-2 ${activeTab === 'project' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    Select from Projects
                                </button>
                            </div>

                            <div className="p-8 flex-1 flex flex-col justify-center">
                                {activeTab === 'upload' ? (
                                    <div className="space-y-6 animate-fade-in">
                                        <label className="block w-full cursor-pointer group">
                                            <div className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all ${file ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 group-hover:border-indigo-400 group-hover:bg-slate-50'}`}>
                                                {file ? (
                                                    <>
                                                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                                            <FileText className="w-8 h-8 text-indigo-600" />
                                                        </div>
                                                        <p className="font-semibold text-lg text-indigo-900">{file.name}</p>
                                                        <p className="text-sm text-indigo-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                                                        <p className="text-xs text-indigo-400 mt-4 font-medium">Click to change</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                            <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-indigo-500" />
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-slate-700">Upload your Resume</h3>
                                                        <p className="text-slate-500 text-sm mt-2 text-center max-w-xs">Drag and drop or click to select a PDF file from your computer</p>
                                                    </>
                                                )}
                                                <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                                            </div>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-fade-in h-80 overflow-y-auto pr-2 custom-scrollbar">
                                        {loading ? (
                                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-400" /></div>
                                        ) : projects.length === 0 ? (
                                            <div className="text-center py-10 text-slate-500">No projects found</div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {projects.map(p => (
                                                    <div
                                                        key={p._id}
                                                        onClick={() => setSelectedProjectId(p._id)}
                                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedProjectId === p._id ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
                                                    >
                                                        <h4 className="font-semibold text-slate-800 truncate">{p.title || 'Untitled'}</h4>
                                                        <p className="text-xs text-slate-500 mt-1">Last edited: {new Date(p.updatedAt).toLocaleDateString()}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={(!file && activeTab === 'upload') || (!selectedProjectId && activeTab === 'project')}
                                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    <SparklesIcon className="w-5 h-5" />
                                    Analyze Score
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Simple Icon wrapper if needed, otherwise rely on lucide Imports being separate
const SparklesIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
)

export default ATSChecker;
