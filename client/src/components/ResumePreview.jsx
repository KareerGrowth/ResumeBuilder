import React from 'react'
import { dummyResumeData } from '../assets/assets'
import ClassicTemplate from './templates/ClassicTemplate'
import ModernTemplate from './templates/ModernTemplate'
import MinimalTemplate from './templates/MinimalTemplate'
import MinimalImageTemplate from './templates/MinimalImageTemplate'
import ExecutiveTemplate from '../assets/templates/ExecutiveTemplate'
import AcademicTemplate from '../assets/templates/AcademicTemplate'
import ATSTemplate from '../assets/templates/ATS'
import ATS1Template from '../assets/templates/ATS1'

const ResumePreview = ({ data, template, accentColor, classes = "" }) => {

  // Merge data with dummy data for live preview effect
  const dummy = dummyResumeData[0];

  const mergedData = {
    ...dummy,
    ...data,
    personal_info: {
      ...dummy.personal_info,
      ...data.personal_info,
      full_name: data.personal_info?.full_name || dummy.personal_info.full_name,
      email: data.personal_info?.email || dummy.personal_info.email,
      phone: data.personal_info?.phone || dummy.personal_info.phone,
      location: data.personal_info?.location || dummy.personal_info.location,
      linkedin: data.personal_info?.linkedin || dummy.personal_info.linkedin,
      website: data.personal_info?.website || dummy.personal_info.website,
      profession: data.personal_info?.profession || dummy.personal_info.profession,
      image: data.personal_info?.image || dummy.personal_info.image,
    },
    project: data.project?.length > 0 ? data.project : dummy.project,
    experience: data.experience?.length > 0 ? data.experience : dummy.experience,
    education: data.education?.length > 0 ? data.education : dummy.education,
    skills: data.skills?.length > 0 ? data.skills : dummy.skills,
    certificates: data.certificates?.length > 0 ? data.certificates : dummy.certificates,
    achievements: data.achievements?.length > 0 ? data.achievements : dummy.achievements,
    languages: data.languages?.length > 0 ? data.languages : dummy.languages,
    hobbies: data.hobbies?.length > 0 ? data.hobbies : dummy.hobbies,
    professional_summary: data.professional_summary || dummy.professional_summary
  };

  const renderTemplate = () => {
    switch (template) {
      case "modern":
        return <ModernTemplate data={mergedData} accentColor={accentColor} />;
      case "minimal":
        return <MinimalTemplate data={mergedData} accentColor={accentColor} />;
      case "minimal-image":
        return <MinimalImageTemplate data={mergedData} accentColor={accentColor} />;
      case "executive":
        return <ExecutiveTemplate data={mergedData} accentColor={accentColor} />;
      case "academic":
        return <AcademicTemplate data={mergedData} accentColor={accentColor} />;
      case "ats":
        return <ATSTemplate data={mergedData} accentColor={accentColor} />;
      case "ats-compact":
        return <ATS1Template data={mergedData} accentColor={accentColor} />;

      default:
        return <ClassicTemplate data={mergedData} accentColor={accentColor} />;
    }
  }

  return (
    <div className='w-full bg-gray-100'>
      <div id="resume-preview" className={"border border-gray-200 print:shadow-none print:border-none " + classes}>
        {renderTemplate()}
      </div>

      <style jsx>
        {`
        @page {
          size: letter;
          margin: 0;
        }
        @media print {
          html, body {
            width: 8.5in;
            height: 11in;
            overflow: hidden; 
          }
          body * {
            visibility: hidden;
          }
          #resume-preview, #resume-preview * {
            visibility: visible;
          }
          #resume-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
            border: none !important;
          }
        }
        `}
      </style>
    </div>
  )
}

export default ResumePreview
