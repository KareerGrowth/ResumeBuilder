import { FilePenLineIcon, LoaderCircleIcon, PencilIcon, PlusIcon, TrashIcon, XIcon } from 'lucide-react'
import sandGif from '../assets/sand.gif'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'

// Import Template Components
import ClassicTemplate from '../assets/templates/ClassicTemplate'
import ModernTemplate from '../assets/templates/ModernTemplate'
import MinimalImageTemplate from '../assets/templates/MinimalImageTemplate'
import MinimalTemplate from '../assets/templates/MinimalTemplate'
import ExecutiveTemplate from '../assets/templates/ExecutiveTemplate'
import AcademicTemplate from '../assets/templates/AcademicTemplate'
import ATSTemplate from '../assets/templates/ATS'
import ATS1Template from '../assets/templates/ATS1'

const Projects = () => {

    const { user, token } = useSelector(state => state.auth)

    const [allResumes, setAllResumes] = useState([])
    const [templates, setTemplates] = useState([])
    const [title, setTitle] = useState('')
    const [editResumeId, setEditResumeId] = useState('')

    // New Loading State
    const [isUpdating, setIsUpdating] = useState(false)
    const [isPageLoading, setIsPageLoading] = useState(true)

    const navigate = useNavigate()

    const loadAllResumes = async () => {
        setIsPageLoading(true)
        try {
            const { data } = await api.get('/api/users/resumes', { headers: { Authorization: token } })
            setAllResumes(data.resumes)
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message)
        } finally {
            setIsPageLoading(false)
        }
    }

    const loadTemplates = async () => {
        try {
            const { data } = await api.get('/api/resumes/templates', { headers: { Authorization: token } })
            setTemplates(data.templates)
        } catch (error) {
            console.log("Error loading templates:", error.message)
        }
    }

    const editTitle = async (event) => {
        try {
            event.preventDefault()
            setIsUpdating(true)
            const { data } = await api.put(`/api/resumes/update`, { resumeId: editResumeId, resumeData: { title } }, { headers: { Authorization: token } })
            setAllResumes(allResumes.map(resume => resume._id === editResumeId ? { ...resume, title } : resume))
            setTitle('')
            setEditResumeId('')
            toast.success(data.message)
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message)
        } finally {
            setIsUpdating(false)
        }
    }

    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [resumeToDelete, setResumeToDelete] = useState(null)

    const initiateDelete = (resumeId) => {
        setResumeToDelete(resumeId)
        setDeleteModalOpen(true)
    }

    const confirmDelete = async () => {
        if (!resumeToDelete) return
        try {
            const { data } = await api.delete(`/api/resumes/delete/${resumeToDelete}`, { headers: { Authorization: token } })
            setAllResumes(allResumes.filter(resume => resume._id !== resumeToDelete))
            toast.success(data.message)
            setDeleteModalOpen(false)
            setResumeToDelete(null)
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message)
        }
    }

    useEffect(() => {
        loadAllResumes()
        loadTemplates()
    }, [])

    return (
        <div>
            <div className='max-w-7xl mx-auto px-4 py-8'>

                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">Your Projects</h2>
                    <button onClick={() => navigate('/app')} className='flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm'>
                        <PlusIcon className="size-4" /> Create New
                    </button>
                </div>

                {isPageLoading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20">
                        <img src={sandGif} alt="Loading..." className="w-16 h-16 object-contain" />
                    </div>
                ) : allResumes.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <p className="text-slate-500">No projects found. Create your first resume from the Dashboard!</p>
                        <button onClick={() => navigate('/app')} className="mt-4 text-indigo-600 font-medium hover:underline">Go to Dashboard</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {allResumes.map((resume) => {
                            const templateId = resume.template || 'classic';
                            const accentColor = resume.accent_color || '#3B82F6';
                            return (
                                <div key={resume._id} onClick={() => navigate(`/app/builder/${resume._id}`)} className='h-[24rem] bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-2xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer relative overflow-hidden ring-0 ring-indigo-200 hover:ring-4 pb-0'>
                                    {/* Preview Section */}
                                    <div className="flex-1 w-full bg-slate-50 relative overflow-hidden group-hover:bg-slate-100 transition-colors">
                                        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[210mm] origin-top transform scale-[0.45] lg:scale-[0.28] pointer-events-none select-none bg-white shadow-lg m-0 lg:my-4 min-h-[297mm]'>
                                            {templateId === 'modern' && <ModernTemplate data={resume} accentColor={accentColor} />}
                                            {templateId === 'minimal' && <MinimalTemplate data={resume} accentColor={accentColor} />}
                                            {templateId === 'minimal-image' && <MinimalImageTemplate data={resume} accentColor={accentColor} />}
                                            {templateId === 'executive' && <ExecutiveTemplate data={resume} accentColor={accentColor} />}
                                            {templateId === 'academic' && <AcademicTemplate data={resume} accentColor={accentColor} />}
                                            {templateId === 'ats' && <ATSTemplate data={resume} accentColor={accentColor} />}
                                            {templateId === 'ats-compact' && <ATS1Template data={resume} accentColor={accentColor} />}
                                            {templateId === 'classic' && <ClassicTemplate data={resume} accentColor={accentColor} />}
                                        </div>

                                        {/* Template Badge */}
                                        <div className="absolute top-3 left-3 z-30">
                                            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-500 bg-white/90 backdrop-blur border border-slate-200 px-2 py-1 rounded-md shadow-sm">
                                                {templates.find(t => t.id === templateId)?.name || 'Classic'}
                                            </span>
                                        </div>

                                        <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/5 transition-colors z-10" />
                                    </div>

                                    {/* Content Section */}
                                    <div className="h-20 bg-white border-t border-slate-100 flex flex-col justify-center px-4 relative z-20 w-full group-hover:bg-slate-50 transition-colors">
                                        <div className='flex justify-between items-start'>
                                            <div className='overflow-hidden'>
                                                <h3 className="font-bold text-slate-800 truncate mb-1 text-base group-hover:text-indigo-600 transition-colors">{resume.title || 'Untitled Resume'}</h3>
                                                <p className="text-xs text-slate-400">
                                                    Edited {new Date(resume.updatedAt).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div className='flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200'>
                                                <button onClick={(e) => { e.stopPropagation(); setEditResumeId(resume._id); setTitle(resume.title) }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all" title="Rename">
                                                    <PencilIcon className="size-4" />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); initiateDelete(resume._id) }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all" title="Delete">
                                                    <TrashIcon className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {editResumeId && (
                    <form onSubmit={editTitle} onClick={() => setEditResumeId('')} className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-50 flex items-center justify-center'>
                        <div onClick={e => e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
                            <h2 className='text-xl font-bold mb-4'>Edit Project Title</h2>
                            <input onChange={(e) => setTitle(e.target.value)} value={title} type="text" placeholder='Enter title' className='w-full px-4 py-2 mb-4 focus:border-green-600 ring-green-600' required />

                            <button disabled={isUpdating} className='w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed'>
                                {isUpdating ? <LoaderCircleIcon className="animate-spin size-4" /> : null}
                                {isUpdating ? 'Updating...' : 'Update'}
                            </button>
                            <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={() => { setEditResumeId(''); setTitle('') }} />
                        </div>
                    </form>
                )
                }

                {/* Delete Confirmation Modal */}
                {deleteModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDeleteModalOpen(false)}>
                        <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                            <div className="p-6 text-center">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <TrashIcon className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Project?</h3>
                                <p className="text-slate-500 text-sm mb-6">
                                    This action cannot be undone. This project will be permanently removed from your account.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteModalOpen(false)}
                                        className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="flex-1 py-2.5 px-4 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}

export default Projects
