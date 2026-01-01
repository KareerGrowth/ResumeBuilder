import { ChevronLeft, ChevronRight, LoaderCircleIcon, Crown, X } from 'lucide-react'
import sandGif from '../assets/sand.gif'
import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import pdfToText from 'react-pdftotext'
import { dummyResumeData } from '../assets/assets'
import Pricing from '../components/Pricing'
import DashboardHero from '../components/DashboardHero'

// Import Template Components (Same as Dashboard)
import ClassicTemplate from '../assets/templates/ClassicTemplate'
import ModernTemplate from '../assets/templates/ModernTemplate'
import MinimalImageTemplate from '../assets/templates/MinimalImageTemplate'
import MinimalTemplate from '../assets/templates/MinimalTemplate'
import ExecutiveTemplate from '../assets/templates/ExecutiveTemplate'
import AcademicTemplate from '../assets/templates/AcademicTemplate'
import ATS from '../assets/templates/ATS'
import ATS1 from '../assets/templates/ATS1'

const TemplatesPage = () => {

    const { user, token } = useSelector(state => state.auth)

    const [templates, setTemplates] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalTemplates, setTotalTemplates] = useState(0)

    const [showCreateResume, setShowCreateResume] = useState(false)
    const [showPricing, setShowPricing] = useState(false)

    const [title, setTitle] = useState('')
    const [selectedTemplate, setSelectedTemplate] = useState('classic')
    const [isLoading, setIsLoading] = useState(false)
    const [isTemplatesLoading, setIsTemplatesLoading] = useState(true)
    const [credits, setCredits] = useState(null)

    const navigate = useNavigate()
    const location = useLocation()
    const resumeId = location.state?.resumeId

    const [fetchedResume, setFetchedResume] = useState(null)

    const ITEMS_PER_PAGE = 12

    // Template Component Map
    const templateComponents = {
        'classic': ClassicTemplate,
        'modern': ModernTemplate,
        'minimal-image': MinimalImageTemplate,
        'minimal': MinimalTemplate,
        'executive': ExecutiveTemplate,
        'academic': AcademicTemplate,
        'ats': ATS,
        'ats-compact': ATS1
    }

    useEffect(() => {
        if (resumeId) {
            const fetchResume = async () => {
                try {
                    const { data } = await api.get(`/api/resumes/get/${resumeId}`, { headers: { Authorization: token } })
                    setFetchedResume(data.resume)
                } catch (error) {
                    toast.error("Failed to fetch resume")
                    console.error(error)
                }
            }
            fetchResume()
        }
    }, [resumeId, token])

    const updateTemplate = async (templateId) => {
        if (!resumeId || !fetchedResume) return
        setIsLoading(true)
        try {
            // Update the template in the fetched resume object
            const updatedResumeData = { ...fetchedResume, template: templateId }

            await api.put('/api/resumes/update', {
                resumeId,
                resumeData: updatedResumeData
            }, { headers: { Authorization: token } })

            navigate(`/app/builder/${resumeId}`)
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update template")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const loadTemplates = async (page = 1) => {
        setIsTemplatesLoading(true)
        try {
            const { data } = await api.get(`/api/resumes/templates?page=${page}&limit=${ITEMS_PER_PAGE}`, { headers: { Authorization: token } })
            setTemplates(data.templates)
            setCurrentPage(data.currentPage)
            setTotalPages(data.totalPages)
            setTotalTemplates(data.totalTemplates)
        } catch (error) {
            console.log("Error loading templates:", error.message)
            toast.error("Failed to load templates")
        } finally {
            setIsTemplatesLoading(false)
        }
    }

    const loadCredits = async () => {
        try {
            const { data } = await api.get('/api/credits/check', { headers: { Authorization: token } })
            setCredits(data.credit)
        } catch (error) {
            console.log("Error loading credits:", error.message)
        }
    }

    const checkCreditsAndAction = (action) => {
        if (!credits) {
            action();
            return;
        }
        if (credits.usedCredits >= credits.totalCredits) {
            setShowPricing(true);
            return;
        }
        if (new Date(credits.expiresAt) < new Date()) {
            setShowPricing(true);
            return;
        }
        action();
    }

    const createResume = async (event) => {
        try {
            event.preventDefault()
            setIsLoading(true)

            const proceed = async () => {
                try {
                    await api.post('/api/credits/deduct', {}, { headers: { Authorization: token } });
                    const { data } = await api.post('/api/resumes/create', { title, template: selectedTemplate }, { headers: { Authorization: token } })
                    setTitle('')
                    setShowCreateResume(false)
                    navigate(`/app/builder/${data.resume._id}`)
                } catch (err) {
                    if (err.response?.status === 403) {
                        setShowPricing(true);
                        setShowCreateResume(false);
                    } else {
                        throw err;
                    }
                } finally {
                    setIsLoading(false)
                }
            };
            proceed();

        } catch (error) {
            console.error(error)
            toast.error(error?.response?.data?.message || error.message)
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadTemplates(currentPage)
        loadCredits()
    }, [currentPage])

    return (
        <div className='w-full max-w-[95%] mx-auto px-2 md:px-8 py-8'>

            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Resume Templates</h1>
                    <p className="text-slate-500">Choose from our collection of professional templates</p>
                </div>
            </div>

            {/* Template Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-8 w-full mx-auto'>
                {isTemplatesLoading ? (
                    <div className="col-span-full flex items-center justify-center py-20">
                        <img src={sandGif} alt="Loading..." className="w-16 h-16 object-contain" />
                    </div>
                ) : (
                    templates.map((t, index) => {
                        // Extract base ID (e.g., "classic" from "classic-12345")
                        const baseId = t.templateId?.replace(/-\d{5}$/, "") || 'classic';
                        const TemplateComponent = templateComponents[baseId] || ClassicTemplate;
                        const isRecommended = ['classic', 'modern'].includes(baseId);

                        return (
                            <button
                                key={t._id}
                                onClick={() => {
                                    if (resumeId) {
                                        updateTemplate(t.templateId)
                                    } else {
                                        checkCreditsAndAction(() => { setSelectedTemplate(t.templateId); setShowCreateResume(true); })
                                    }
                                }}
                                className='aspect-[210/260] bg-white rounded-xl border border-slate-200 hover:border-slate-800 transition-all duration-200 flex flex-col group cursor-pointer relative overflow-hidden shadow-[0_0_20px_rgba(148,163,184,0.15)]'
                            >
                                {/* Status Badge */}
                                {t.status && (
                                    <div className={`absolute top-3 right-3 z-30 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-wider ${t.status === 'PRO' ? 'bg-purple-600' :
                                        t.status === 'PREMIUM' ? 'bg-amber-500' :
                                            'bg-indigo-600'
                                        }`}>
                                        {t.status}
                                    </div>
                                )}

                                {/* Preview Container - "Project" style for all views here or keep consistent with Dashboard? 
                    User asked for "same like there in the dashboard". 
                    In Dashboard, we have full-width zoomed mobile and card desktop.
                    I will replicate the exact classes I finalized in Dashboard.jsx.
                */}
                                <div className="flex-1 w-full bg-slate-50 relative overflow-hidden group-hover:bg-slate-100 transition-colors">
                                    <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[210mm] origin-top transform scale-[0.45] lg:scale-[0.32] pointer-events-none select-none bg-white shadow-lg m-0 lg:my-4 min-h-[297mm]'>
                                        <TemplateComponent data={dummyResumeData[0]} accentColor="#4B5563" />
                                    </div>
                                </div>

                                {/* Footer Button */}
                                <div className="h-10 md:h-12 bg-white border-t border-slate-100 flex items-center justify-center relative z-20 w-full">
                                    <span className='font-medium text-slate-600 text-xs md:text-sm group-hover:text-slate-900 transition-colors'>
                                        {t.name}
                                    </span>
                                </div>
                            </button>
                        )
                    })
                )}
            </div >

            {/* Pagination Controls */}
            {
                !isTemplatesLoading && totalTemplates > 0 && (
                    <div className="flex items-center justify-between border-t border-slate-200 pt-6 mt-8">
                        <div className="text-sm text-slate-500">
                            Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalTemplates)}</span> of <span className="font-medium">{totalTemplates}</span> results
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Modals - Reusing from Dashboard logic */}
            {
                showPricing && (
                    <Pricing onClose={() => setShowPricing(false)} />
                )
            }

            {
                showCreateResume && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Name your Resume</h3>
                                <button onClick={() => setShowCreateResume(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={createResume} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Resume Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Full Stack Developer"
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                        autoFocus
                                    />
                                </div>

                                <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-3 text-sm text-slate-600">
                                    <div className="bg-amber-100 p-1.5 rounded-full">
                                        <Crown className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <span>This will cost 1 credit</span>
                                </div>

                                <button disabled={isLoading} className='w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed'>
                                    {isLoading && <LoaderCircleIcon className="animate-spin w-4 h-4" />}
                                    {isLoading ? 'Creating...' : 'Create Resume'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

        </div >
    )
}

export default TemplatesPage
