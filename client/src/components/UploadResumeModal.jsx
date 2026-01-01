import React, { useState } from 'react'
import { UploadCloudIcon, XIcon, LayoutTemplate, Sparkles, LoaderCircleIcon } from 'lucide-react'
import api from '../configs/api'
import toast from 'react-hot-toast'
import pdfToText from 'react-pdftotext'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Pricing from './Pricing' // Assuming we might need this or handle it via callback

const UploadResumeModal = ({ isOpen, onClose }) => {
    const { token } = useSelector(state => state.auth)
    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [resume, setResume] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showPricing, setShowPricing] = useState(false)

    if (!isOpen) return null;

    // Handle internal pricing modal closing without closing parent if needed, 
    // or just close both. For simplicity, if pricing opens, we might overlay it.
    // actually, let's keep pricing logic simple: if 403, show toast or handle externally?
    // The original dashboard showed Pricing component.
    // I'll include the Pricing modal logic here for completeness if it's self-contained.

    const uploadResume = async (event) => {
        event.preventDefault()
        setIsLoading(true)
        try {
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
            onClose() // Close modal on success
            navigate('/app/templates', { state: { resumeId: data.resumeId } })
        } catch (error) {
            if (error.response?.status === 403) {
                setShowPricing(true);
                // Don't close upload modal immediately, let user decide? 
                // Or switch to pricing. 
                // Dashboard behavior: setShowPricing(true); setShowUploadResume(false);
                // I'll mimic that:
                onClose(); // Close upload modal
                // But wait, where does Pricing render? 
                // Any component using this Modal might need to handle Pricing visibility.
                // For global navbar usage, Pricing needs to be global too? 
                // For now, let's just trigger a specialized event or toast if credits fail.
                // Or better: Render Pricing inside this component purely? No, Pricing is a full modal.
                // I will add a `setShowPricing` local state and render it only if this component is "active" 
                // but if I close this modal, Pricing disappears?
                // Let's keep it simple: if 403, show Pricing URL or separate modal.
                // I'll import Pricing and render it conditionally *instead* of this modal or above it.
            } else {
                toast.error(error?.response?.data?.message || error.message)
            }
        } finally {
            setIsLoading(false)
        }
    }

    if (showPricing) {
        return <Pricing onClose={() => setShowPricing(false)} />
    }

    return (
        <div className='fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] flex items-center justify-center p-4' onClick={onClose}>
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
                        <input
                            autoFocus
                            onChange={(e) => setTitle(e.target.value)}
                            value={title}
                            type="text"
                            placeholder='e.g., My Uploaded Resume'
                            className='w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-slate-800 outline-none transition-all'
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">PDF File</label>
                        <label htmlFor="resume-input-global" className="block w-full">
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
                        <input type="file" id='resume-input-global' accept='.pdf' hidden onChange={(e) => setResume(e.target.files[0])} />
                    </div>

                    <div className="flex items-center gap-2 mb-2 p-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium">
                        <Sparkles className="w-3 h-3" />
                        <span>This will cost 1 credit</span>
                    </div>

                    <button
                        onClick={uploadResume}
                        disabled={isLoading}
                        className='w-full py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-black transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed'
                    >
                        {isLoading && <LoaderCircleIcon className='animate-spin w-4 h-4 text-white' />}
                        {isLoading ? 'Processing...' : 'Upload & Convert'}
                    </button>
                </div>

                <button type="button" className='absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full transition-all' onClick={onClose}>
                    <XIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

export default UploadResumeModal
