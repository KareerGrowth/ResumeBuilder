import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { dummyResumeData } from '../assets/assets'
import { ArrowLeftIcon, Award, Briefcase, ChevronLeft, ChevronRight, DownloadIcon, EyeIcon, EyeOffIcon, FileText, FolderIcon, GraduationCap, Heart, Languages, Share2Icon, Sparkles, Trophy, User } from 'lucide-react'
import PersonalInfoForm from '../components/PersonalInfoForm'
import ResumePreview from '../components/ResumePreview'
import ColorPicker from '../components/ColorPicker'
import ProfessionalSummaryForm from '../components/ProfessionalSummaryForm'
import ExperienceForm from '../components/ExperienceForm'
import EducationForm from '../components/EducationForm'
import ProjectForm from '../components/ProjectForm'
import SkillsForm from '../components/SkillsForm'
import CertificatesForm from '../components/CertificatesForm'
import AchievementsForm from '../components/AchievementsForm'
import LanguagesForm from '../components/LanguagesForm'
import HobbiesForm from '../components/HobbiesForm'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import Pricing from '../components/Pricing'

const ResumeBuilder = () => {

  const { resumeId } = useParams()
  const { token } = useSelector(state => state.auth)

  const [resumeData, setResumeData] = useState({
    _id: '',
    title: '',
    personal_info: {},
    professional_summary: "",
    experience: [],
    education: [],
    project: [],
    skills: [],
    certificates: [],
    achievements: [],
    languages: [],
    hobbies: [],
    template: "classic",
    accent_color: "#3B82F6",
    public: false,
  })

  const loadExistingResume = async () => {
    try {
      const { data } = await api.get('/api/resumes/get/' + resumeId, { headers: { Authorization: token } })
      if (data.resume) {
        // Ensure new fields have default values if they don't exist
        const loadedResume = {
          ...data.resume,
          certificates: data.resume.certificates || [],
          achievements: data.resume.achievements || [],
          languages: data.resume.languages || [],
          hobbies: data.resume.hobbies || []
        };
        setResumeData(loadedResume)
        document.title = data.resume.title;
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [removeBackground, setRemoveBackground] = useState(false);


  const sections = [
    { id: "personal", name: "Personal Info", icon: User },
    { id: "summary", name: "Summary", icon: FileText },
    { id: "experience", name: "Experience", icon: Briefcase },
    { id: "education", name: "Education", icon: GraduationCap },
    { id: "projects", name: "Projects", icon: FolderIcon },
    { id: "skills", name: "Skills", icon: Sparkles },
    { id: "certificates", name: "Certificates", icon: Award },
    { id: "achievements", name: "Achievements", icon: Trophy },
    { id: "languages", name: "Languages", icon: Languages },
    { id: "hobbies", name: "Hobbies", icon: Heart },
  ]

  const activeSection = sections[activeSectionIndex]

  useEffect(() => {
    loadExistingResume()
  }, [])

  const changeResumeVisibility = async () => {
    try {
      const formData = new FormData()
      formData.append("resumeId", resumeId)
      formData.append("resumeData", JSON.stringify({ public: !resumeData.public }))

      const { data } = await api.put('/api/resumes/update', formData, { headers: { Authorization: token } })

      setResumeData({ ...resumeData, public: !resumeData.public })
      toast.success(data.message)
    } catch (error) {
      console.error("Error saving resume:", error)
    }
  }

  const handleShare = () => {
    const frontendUrl = window.location.href.split('/app/')[0];
    const resumeUrl = frontendUrl + '/view/' + resumeId;

    if (navigator.share) {
      navigator.share({ url: resumeUrl, text: "My Resume", })
    } else {
      alert('Share not supported on this browser.')
    }
  }

  const [showPricing, setShowPricing] = useState(false);

  const downloadResume = async () => {
    try {
      const { data } = await api.post('/api/credits/deduct', {}, { headers: { Authorization: token } });

      if (data.success) {
        toast.success("Credit deducted successfully!");
        window.print();

        // Optional: Update local credit state if you were tracking it
      } else {
        toast.error(data.message || "Failed to download");
      }

    } catch (error) {
      if (error.response && error.response.status === 403) {
        setShowPricing(true);
      } else {
        toast.error(error?.response?.data?.message || "Something went wrong");
      }
    }
  }

  const handlePaymentSuccess = () => {
    setShowPricing(false);
    // You might want to update local credit state if you have one, 
    // or just let the next download attempt succeed (as backend is updated)
  }

  const saveResume = async () => {
    try {
      let updatedResumeData = structuredClone(resumeData)

      // remove image from updatedResumeData
      if (typeof resumeData.personal_info.image === 'object') {
        delete updatedResumeData.personal_info.image
      }

      const formData = new FormData();
      formData.append("resumeId", resumeId)
      formData.append('resumeData', JSON.stringify(updatedResumeData))
      removeBackground && formData.append("removeBackground", "yes");
      typeof resumeData.personal_info.image === 'object' && formData.append("image", resumeData.personal_info.image)

      const { data } = await api.put('/api/resumes/update', formData, { headers: { Authorization: token } })

      // Ensure new fields have default values in the response
      const savedResume = {
        ...data.resume,
        certificates: data.resume.certificates || [],
        achievements: data.resume.achievements || [],
        languages: data.resume.languages || [],
        hobbies: data.resume.hobbies || []
      };
      setResumeData(savedResume)
      toast.success(data.message)
    } catch (error) {
      console.error("Error saving resume:", error)
    }
  }

  return (
    <div>

      {showPricing && <Pricing onClose={() => setShowPricing(false)} onSuccess={handlePaymentSuccess} />}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link to={'/app'} className='inline-flex gap-2 items-center text-slate-500 hover:text-slate-700 transition-all'>
          <ArrowLeftIcon className="size-4" /> Back to Dashboard
        </Link>
      </div>

      <div className='max-w-7xl mx-auto px-4 pb-8'>
        <div className='grid lg:grid-cols-12 gap-8'>
          {/* Left Panel - Form */}
          <div className='relative lg:col-span-5 rounded-lg overflow-hidden'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 pt-1'>
              {/* progress bar using activeSectionIndex */}
              <hr className="absolute top-0 left-0 right-0 border-2 border-gray-200" />
              <hr className="absolute top-0 left-0  h-1 bg-gradient-to-r from-green-500 to-green-600 border-none transition-all duration-2000" style={{ width: `${activeSectionIndex * 100 / (sections.length - 1)}%` }} />

              {/* Section Navigation */}
              <div className="flex justify-between items-center mb-6 border-b border-gray-300 py-1">

                <div className='flex items-center gap-2'>
                  <ColorPicker selectedColor={resumeData.accent_color} onChange={(color) => setResumeData(prev => ({ ...prev, accent_color: color }))} />
                </div>

                <div className='flex items-center'>
                  {activeSectionIndex !== 0 && (
                    <button onClick={() => setActiveSectionIndex((prevIndex) => Math.max(prevIndex - 1, 0))} className='flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all' disabled={activeSectionIndex === 0}>
                      <ChevronLeft className="size-4" /> Previous
                    </button>
                  )}
                  <button onClick={() => setActiveSectionIndex((prevIndex) => Math.min(prevIndex + 1, sections.length - 1))} className={`flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all ${activeSectionIndex === sections.length - 1 && 'opacity-50'}`} disabled={activeSectionIndex === sections.length - 1}>
                    Next <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className='space-y-6'>
                {activeSection.id === 'personal' && (
                  <PersonalInfoForm data={resumeData.personal_info} onChange={(data) => setResumeData(prev => ({ ...prev, personal_info: data }))} removeBackground={removeBackground} setRemoveBackground={setRemoveBackground} />
                )}
                {activeSection.id === 'summary' && (
                  <ProfessionalSummaryForm data={resumeData.professional_summary} onChange={(data) => setResumeData(prev => ({ ...prev, professional_summary: data }))} setResumeData={setResumeData} />
                )}
                {activeSection.id === 'experience' && (
                  <ExperienceForm data={resumeData.experience} onChange={(data) => setResumeData(prev => ({ ...prev, experience: data }))} />
                )}
                {activeSection.id === 'education' && (
                  <EducationForm data={resumeData.education} onChange={(data) => setResumeData(prev => ({ ...prev, education: data }))} />
                )}
                {activeSection.id === 'projects' && (
                  <ProjectForm data={resumeData.project} onChange={(data) => setResumeData(prev => ({ ...prev, project: data }))} />
                )}
                {activeSection.id === 'skills' && (
                  <SkillsForm data={resumeData.skills} onChange={(data) => setResumeData(prev => ({ ...prev, skills: data }))} />
                )}
                {activeSection.id === 'certificates' && (
                  <CertificatesForm data={resumeData.certificates} onChange={(data) => setResumeData(prev => ({ ...prev, certificates: data }))} />
                )}
                {activeSection.id === 'achievements' && (
                  <AchievementsForm data={resumeData.achievements} onChange={(data) => setResumeData(prev => ({ ...prev, achievements: data }))} />
                )}
                {activeSection.id === 'languages' && (
                  <LanguagesForm data={resumeData.languages} onChange={(data) => setResumeData(prev => ({ ...prev, languages: data }))} />
                )}
                {activeSection.id === 'hobbies' && (
                  <HobbiesForm data={resumeData.hobbies} onChange={(data) => setResumeData(prev => ({ ...prev, hobbies: data }))} />
                )}

              </div>


              <div className="sticky bottom-0 bg-white pt-4 pb-2 mt-4 border-t border-gray-100">
                <button onClick={() => { toast.promise(saveResume, { loading: 'Saving...' }) }} className='w-full bg-indigo-600 text-white hover:bg-indigo-700 transition-all rounded-xl py-3 text-sm font-bold shadow-lg shadow-indigo-200 active:scale-[0.98]'>
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className='lg:col-span-7 max-lg:mt-6'>
            <div className='relative w-full'>
              <div className='absolute bottom-3 left-0 right-0 flex items-center justify-end gap-2'>
                {resumeData.public && (
                  <button onClick={handleShare} className='flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-lg ring-blue-300 hover:ring transition-colors'>
                    <Share2Icon className='size-4' /> Share
                  </button>
                )}
                <button onClick={changeResumeVisibility} className='flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 ring-purple-300 rounded-lg hover:ring transition-colors'>
                  {resumeData.public ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
                  {resumeData.public ? 'Public' : 'Private'}
                </button>
                <button onClick={downloadResume} className='flex items-center gap-2 px-6 py-2 text-xs bg-gradient-to-br from-green-100 to-green-200 text-green-600 rounded-lg ring-green-300 hover:ring transition-colors'>
                  <DownloadIcon className='size-4' /> Download
                </button>
              </div>
            </div>

            <ResumePreview data={resumeData} template={resumeData.template} accentColor={resumeData.accent_color} />
          </div>
        </div>
      </div>

    </div>
  )
}

export default ResumeBuilder
