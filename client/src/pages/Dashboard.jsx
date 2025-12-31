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
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(true)
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
    setIsTemplatesLoading(true)
    try {
      const { data } = await api.get('/api/resumes/templates', { headers: { Authorization: token } })
      setTemplates(data.templates)
    } catch (error) {
      console.log("Error loading templates:", error.message)
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
      setIsLoading(true)

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

  const uploadResume = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      // Deduct credit logic handled by userController/creditController or check before
      // Ideally backend should handle atomic deduct-and-create
      // For now, we rely on the checkCredits call done before opening modal, 
      // AND a backend deduct call

      await api.post('/api/credits/deduct', {}, { headers: { Authorization: token } });

      if (!resume) {
        toast.error("Please select a file")
        setIsLoading(false)
        return
      }

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
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
    loadCredits()
  }, [])


  return (
    <div>
      <div className='w-full px-4 md:px-8 py-8'>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <p className='text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 transition-all'>Welcome back, {user?.name}</p>
            <div className="flex items-center gap-3 mt-2 text-xs md:text-sm text-slate-500 font-medium transition-all">
              <span>{credits?.planType || 'Free'} Plan</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>{credits ? (credits.totalCredits - credits.usedCredits) : 0} Credits remaining</span>
            </div>
          </div>

          <div className='flex gap-3'>
            <button
              onClick={() => navigate('/app/ats-check')}
              className="bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900 px-4 py-2 md:px-5 md:py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 text-sm md:text-base"
            >
              <CheckCircle className="w-4 h-4" />
              Check ATS Score
            </button>
            <button
              onClick={() => setShowPricing(true)}
              className="bg-slate-900 hover:bg-black text-white px-4 py-2 md:px-5 md:py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 text-sm md:text-base"
            >
              <Crown className="w-4 h-4" />
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* Upload Resume Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between mb-12 transition-all">
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-2 text-slate-900 transition-all">Have a resume already?</h2>
            <p className="text-sm md:text-base text-slate-500 max-w-lg transition-all">Upload your existing PDF resume and let our AI format it instantly.</p>
          </div>
          <button
            onClick={() => checkCreditsAndAction(() => setShowUploadResume(true))}
            className="mt-6 md:mt-0 bg-white border border-slate-200 text-slate-900 px-5 py-2 md:px-6 md:py-2.5 rounded-lg font-medium hover:border-slate-400 transition-all flex items-center gap-2 text-sm md:text-base"
          >
            <UploadCloudIcon className='w-4 h-4' />
            Upload Resume
          </button>
        </div>


        {/* Visual Separator */}
        <div className="flex items-center gap-4 mb-8">
          <span className="text-slate-400 font-medium uppercase text-[10px] md:text-xs tracking-widest transition-all">Or Start From Scratch</span>
          <div className="h-px bg-slate-100 flex-1"></div>
        </div>


        <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-6 transition-all">Choose a Template</h3>

        {/* Template Grid: Live Previews */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8 mb-8'>
          {isTemplatesLoading ? (
            // Template Skeleton
            [1, 2, 3, 4].map((n) => (
              <div key={n} className='aspect-[210/297] bg-white rounded-xl border border-slate-100 overflow-hidden animate-pulse'>
                <div className="flex-1 w-full h-full bg-slate-50"></div>
              </div>
            ))
          ) : (
            templates.map((t, index) => {
              const TemplateComponent = templateComponents[t.id] || ClassicTemplate;
              const isRecommended = ['classic', 'modern'].includes(t.id);

              return (
                <button
                  key={t.id}
                  onClick={() => checkCreditsAndAction(() => { setSelectedTemplate(t.id); setShowCreateResume(true); })}
                  className='aspect-[210/297] bg-white rounded-xl border border-slate-200 hover:border-slate-800 transition-all duration-200 flex flex-col group cursor-pointer relative overflow-hidden'
                >
                  {/* Recommended Badge */}
                  {isRecommended && (
                    <div className="absolute top-3 right-3 z-30 bg-slate-900 text-white text-[10px] font-medium px-2 py-1 rounded shadow-sm">
                      Recommended
                    </div>
                  )}

                  {/* Preview Container */}
                  <div className="flex-1 w-full bg-slate-50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none bg-white shadow-sm flex flex-col">
                      {/* 
                          We use a transform scale approach to fit the resume in the card.
                          Since resumes are A4 (210mm x 297mm), we need to scale them to fit the container.
                          However, for a fluid responsive grid, a fixed scale might be tricky.
                          CSS container queries or a simple extensive transform might be best.
                          For now, we will use a viewbox-like approach or just simple scaling.
                       */}
                      <div className="w-[210mm] origin-top-left transform scale-[0.25] sm:scale-[0.3] md:scale-[0.35] lg:scale-[0.28] xl:scale-[0.32] transition-transform duration-300">
                        <TemplateComponent data={dummyResumeData[0]} accentColor="#000000" />
                      </div>
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
        </div>


        {showCreateResume && (
          <form onSubmit={createResume} onClick={() => setShowCreateResume(false)} className='fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <div onClick={e => e.stopPropagation()} className='relative bg-white shadow-xl rounded-xl w-full max-w-md p-6 transform transition-all scale-100'>
              <div className="text-center mb-6">
                <div className="mx-auto w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <LayoutTemplate className="w-5 h-5 text-slate-900" />
                </div>
                <h2 className='text-xl font-semibold text-slate-900'>Create <span className='text-slate-900'>{templates.find(t => t.id === selectedTemplate)?.name || 'New'}</span> Resume</h2>
                <p className="text-slate-500 text-sm mt-1">Give your new resume a name to get started</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Resume Title</label>
                  <input autoFocus onChange={(e) => setTitle(e.target.value)} value={title} type="text" placeholder='e.g., Software Engineer @ Google' className='w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-slate-800 outline-none transition-all' required />
                </div>

                <div className="flex items-center gap-2 mb-2 p-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium">
                  <Sparkles className="w-3 h-3" />
                  <span>This will cost 1 credit</span>
                </div>

                <button disabled={isLoading} className='w-full py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-black transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed'>
                  {isLoading && <LoaderCircleIcon className="animate-spin w-4 h-4" />}
                  {isLoading ? 'Creating...' : 'Create Resume'}
                </button>
              </div>
              <button type="button" className='absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full transition-all' onClick={() => { setShowCreateResume(false); setTitle('') }}>
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </form>
        )
        }

        {showUploadResume && (
          <form onSubmit={uploadResume} onClick={() => setShowUploadResume(false)} className='fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <div onClick={e => e.stopPropagation()} className='relative bg-white shadow-xl rounded-xl w-full max-w-md p-6 transform transition-all'>
              <div className="text-center mb-6">
                <div className="mx-auto w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <UploadCloudIcon className="w-5 h-5 text-slate-900" />
                </div>
                <h2 className='text-xl font-semibold text-slate-900'>Upload Existing Resume</h2>
                <p className="text-slate-500 text-sm mt-1">We'll extract your info to populate the builder</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Resume Title</label>
                  <input autoFocus onChange={(e) => setTitle(e.target.value)} value={title} type="text" placeholder='e.g., My Uploaded Resume' className='w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-slate-800 outline-none transition-all' required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">PDF File</label>
                  <label htmlFor="resume-input" className="block w-full">
                    <div className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer ${resume ? 'border-slate-800 bg-slate-50' : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'}`}>
                      {resume ? (
                        <>
                          <div className="p-3 bg-white rounded-full shadow-sm">
                            <LayoutTemplate className="w-6 h-6 text-slate-900" />
                          </div>
                          <p className='font-medium text-slate-900 truncate max-w-full'>{resume.name}</p>
                          <p className="text-xs text-slate-500">{(resume.size / 1024).toFixed(0)} KB</p>
                        </>
                      ) : (
                        <>
                          <UploadCloudIcon className='w-8 h-8 text-slate-300' />
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

                <div className="flex items-center gap-2 mb-2 p-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium">
                  <Sparkles className="w-3 h-3" />
                  <span>This will cost 1 credit</span>
                </div>

                <button disabled={isLoading} className='w-full py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-black transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed'>
                  {isLoading && <LoaderCircleIcon className='animate-spin w-4 h-4 text-white' />}
                  {isLoading ? 'Processing...' : 'Upload & Convert'}
                </button>
              </div>

              <button type="button" className='absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full transition-all' onClick={() => { setShowUploadResume(false); setTitle('') }}>
                <XIcon className="w-4 h-4" />
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
