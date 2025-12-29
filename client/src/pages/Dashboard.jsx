import { LayoutTemplate, LoaderCircleIcon, UploadCloudIcon, XIcon, Crown, Sparkles, CheckCircle } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import pdfToText from 'react-pdftotext'
import { dummyResumeData } from '../assets/assets'
import Pricing from '../components/Pricing'

// Import Template Components
import ClassicTemplate from '../assets/templates/ClassicTemplate'
import ModernTemplate from '../assets/templates/ModernTemplate'
import MinimalImageTemplate from '../assets/templates/MinimalImageTemplate'
import MinimalTemplate from '../assets/templates/MinimalTemplate'
import ExecutiveTemplate from '../assets/templates/ExecutiveTemplate'
import AcademicTemplate from '../assets/templates/AcademicTemplate'
import ATS from '../assets/templates/ATS'
import ATS1 from '../assets/templates/ATS1'

const Dashboard = () => {

  const { user, token } = useSelector(state => state.auth)

  const [templates, setTemplates] = useState([])
  const [showCreateResume, setShowCreateResume] = useState(false)
  const [showUploadResume, setShowUploadResume] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [title, setTitle] = useState('')
  const [resume, setResume] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState('classic')

  const [isLoading, setIsLoading] = useState(false)
  const [credits, setCredits] = useState(null)

  const navigate = useNavigate()

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

  const loadTemplates = async () => {
    try {
      const { data } = await api.get('/api/resumes/templates', { headers: { Authorization: token } })
      setTemplates(data.templates)
    } catch (error) {
      console.log("Error loading templates:", error.message)
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

    // Check if user has credits
    if (credits.usedCredits >= credits.totalCredits) {
      setShowPricing(true);
      return;
    }

    // Check expiry
    if (new Date(credits.expiresAt) < new Date()) {
      setShowPricing(true);
      return;
    }

    action();
  }

  const createResume = async (event) => {
    try {
      event.preventDefault()

      const proceed = async () => {
        // Deduct credit first (optional: can be moved to backend auto-deduct)
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
        }
      };

      proceed();

    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  const uploadResume = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      // Deduct credit logic handled by userController/creditController or check before
      // Ideally backend should handle atomic deduct-and-create
      // For now, we rely on the checkCredits call done before opening modal, 
      // AND a backend deduct call

      await api.post('/api/credits/deduct', {}, { headers: { Authorization: token } });

      const resumeText = await pdfToText(resume)
      const { data } = await api.post('/api/ai/upload-resume', { title, resumeText }, { headers: { Authorization: token } })
      setTitle('')
      setResume(null)
      setShowUploadResume(false)
      navigate(`/app/builder/${data.resumeId}`)
    } catch (error) {
      if (error.response?.status === 403) {
        setShowPricing(true);
        setShowUploadResume(false);
      } else {
        toast.error(error?.response?.data?.message || error.message)
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadTemplates()
    loadCredits()
  }, [])

  return (
    <div>
      <div className='max-w-7xl mx-auto px-4 py-8'>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <p className='text-3xl font-bold text-slate-800'>Welcome back, {user?.name}</p>
            <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium capitalize">
                {credits?.planType || 'Free'} Plan
              </span>
              <span>•</span>
              <span>{credits ? (credits.totalCredits - credits.usedCredits) : 0} Credits remaining</span>
            </div>
          </div>

          <div className='flex gap-4'>
            <button
              onClick={() => navigate('/app/ats-check')}
              className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Check ATS Score
            </button>
            <button
              onClick={() => setShowPricing(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
            >
              <Crown className="w-5 h-5" />
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* Upload Resume Banner */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-lg shadow-indigo-200 mb-12 relative overflow-hidden group">
          <div className='relative z-10'>
            <h2 className="text-2xl font-bold mb-2">Have a resume already?</h2>
            <p className="text-indigo-100 max-w-lg">Upload your existing PDF resume and let our AI intelligence instantly format it into a stunning, professional design.</p>
          </div>
          <button
            onClick={() => checkCreditsAndAction(() => setShowUploadResume(true))}
            className="mt-6 md:mt-0 relative z-10 bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 hover:scale-105 transition-all shadow-md flex items-center gap-2"
          >
            <UploadCloudIcon className='w-5 h-5' />
            Upload Resume
          </button>

          {/* Background Decoration */}
          <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12 group-hover:rotate-[20deg] group-hover:scale-110 transition-all duration-500">
            <UploadCloudIcon className="w-64 h-64" />
          </div>
        </div>


        {/* Visual Separator */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px bg-slate-200 flex-1"></div>
          <span className="text-slate-400 font-medium uppercase text-sm tracking-widest">Or Start From Scratch</span>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>


        <h3 className="text-xl font-bold text-slate-800 mb-6">Choose a Template</h3>

        {/* Template Grid: Live Previews */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8'>
          {templates.map((t, index) => {
            const TemplateComponent = templateComponents[t.id] || ClassicTemplate;
            const isRecommended = ['classic', 'modern'].includes(t.id);

            return (
              <button
                key={t.id}
                onClick={() => checkCreditsAndAction(() => { setSelectedTemplate(t.id); setShowCreateResume(true); })}
                className='h-[24rem] bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-2xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer relative overflow-hidden ring-0 ring-indigo-200 hover:ring-4 pb-0'
              >
                {/* Recommended Badge */}
                {isRecommended && (
                  <div className="absolute top-0 right-0 z-30 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                    Recommended
                  </div>
                )}

                {/* Preview Container */}
                <div className="flex-1 w-full bg-slate-50 relative overflow-hidden group-hover:bg-slate-100 transition-colors">
                  <div className="absolute top-0 left-0 w-[210mm] origin-top-left transform scale-[0.28] pointer-events-none select-none bg-white shadow-lg m-4 min-h-[297mm]">
                    <TemplateComponent data={dummyResumeData[0]} accentColor="#4f46e5" />
                  </div>
                  <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/5 transition-colors z-10" />
                </div>

                {/* Footer Button */}
                <div className="h-14 bg-white border-t border-slate-100 flex items-center justify-center relative z-20 group-hover:bg-indigo-600 transition-colors duration-300 w-full">
                  <span className='font-bold text-slate-700 group-hover:text-white transition-colors text-sm uppercase tracking-wide'>
                    Choose Template
                  </span>
                </div>

                {/* Hover overlay for Template Name */}
                <div className="absolute bottom-16 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                    {t.name}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {showCreateResume && (
          <form onSubmit={createResume} onClick={() => setShowCreateResume(false)} className='fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <div onClick={e => e.stopPropagation()} className='relative bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 transform transition-all scale-100'>
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <LayoutTemplate className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className='text-2xl font-bold text-slate-800'>Create <span className='text-indigo-600'>{templates.find(t => t.id === selectedTemplate)?.name || 'New'}</span> Resume</h2>
                <p className="text-slate-500 text-sm mt-1">Give your new resume a name to get started</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Resume Title</label>
                  <input autoFocus onChange={(e) => setTitle(e.target.value)} value={title} type="text" placeholder='e.g., Software Engineer @ Google' className='w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all' required />
                </div>

                <div className="flex items-center gap-2 mb-2 p-3 bg-indigo-50 text-indigo-700 rounded-lg text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>This will cost 1 credit</span>
                </div>

                <button className='w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200'>Create Resume</button>
              </div>
              <button type="button" className='absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all' onClick={() => { setShowCreateResume(false); setTitle('') }}>
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          </form>
        )
        }

        {showUploadResume && (
          <form onSubmit={uploadResume} onClick={() => setShowUploadResume(false)} className='fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <div onClick={e => e.stopPropagation()} className='relative bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 transform transition-all'>
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mb-4">
                  <UploadCloudIcon className="w-6 h-6 text-violet-600" />
                </div>
                <h2 className='text-2xl font-bold text-slate-800'>Upload Existing Resume</h2>
                <p className="text-slate-500 text-sm mt-1">We'll extract your info to populate the builder</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Resume Title</label>
                  <input autoFocus onChange={(e) => setTitle(e.target.value)} value={title} type="text" placeholder='e.g., My Uploaded Resume' className='w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all' required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">PDF File</label>
                  <label htmlFor="resume-input" className="block w-full">
                    <div className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer ${resume ? 'border-violet-500 bg-violet-50' : 'border-slate-300 hover:border-violet-400 hover:bg-slate-50'}`}>
                      {resume ? (
                        <>
                          <div className="p-3 bg-white rounded-full shadow-sm">
                            <LayoutTemplate className="w-8 h-8 text-violet-600" />
                          </div>
                          <p className='font-medium text-violet-700 truncate max-w-full'>{resume.name}</p>
                          <p className="text-xs text-violet-500">{(resume.size / 1024).toFixed(0)} KB</p>
                        </>
                      ) : (
                        <>
                          <UploadCloudIcon className='w-12 h-12 text-slate-300' />
                          <div className="text-center">
                            <p className="font-medium text-slate-600">Click to upload</p>
                            <p className="text-xs text-slate-400">PDF files only</p>
                          </div>
                        </>
                      )}
                    </div>
                  </label>
                  <input type="file" id='resume-input' accept='.pdf' hidden onChange={(e) => setResume(e.target.files[0])} />
                </div>

                <div className="flex items-center gap-2 mb-2 p-3 bg-indigo-50 text-indigo-700 rounded-lg text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>This will cost 1 credit</span>
                </div>

                <button disabled={isLoading} className='w-full py-3 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed'>
                  {isLoading && <LoaderCircleIcon className='animate-spin w-5 h-5 text-white' />}
                  {isLoading ? 'Processing...' : 'Upload & Convert'}
                </button>
              </div>

              <button type="button" className='absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all' onClick={() => { setShowUploadResume(false); setTitle('') }}>
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          </form>
        )
        }

        {/* Pricing Modal */}
        {showPricing && <Pricing onClose={() => setShowPricing(false)} />}

      </div>
    </div>
  )
}

export default Dashboard
