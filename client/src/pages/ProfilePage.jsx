import React, { useEffect, useState, useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../configs/api';
import {
    Briefcase,
    CheckCircle,
    LoaderCircle,
    Award,
    Play,
} from 'lucide-react';
import sandGif from '../assets/sand.gif'

const ProfilePage = () => {
    const { user, token } = useSelector(state => state.auth);
    const [resumeData, setResumeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Experience');
    const [rightTab, setRightTab] = useState('Hobbies');

    useEffect(() => {
        const fetchResumeData = async () => {
            try {
                const { data } = await api.get('/api/users/resumes', {
                    headers: { Authorization: token }
                });
                if (data.resumes && data.resumes.length > 0) {
                    setResumeData(data.resumes[0]);
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchResumeData();
        }
    }, [token]);

    // BLOCK PAGE SCROLL ON DESKTOP (md+)
    useLayoutEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) { // md breakpoint
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto'; // or '' to unset
            }
        };

        // Run on mount
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            document.body.style.overflow = ''; // Cleanup always
        };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <img src={sandGif} alt="Loading..." className="w-16 h-16 object-contain" />
            </div>
        );
    }

    if (!resumeData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 font-[Outfit]">
                <div className="bg-indigo-50 p-6 rounded-full mb-4">
                    <Briefcase className="w-10 h-10 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
                <a href="/app" className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                    Create Resume
                </a>
            </div>
        );
    }

    const { personal_info, experience, education, skills, certificates, social_links, hobbies, languages, project } = resumeData;
    const fullName = personal_info?.full_name || user?.name || "User Name";
    const profession = personal_info?.profession || "Professional";
    const avatar = personal_info?.image || user?.avatar || `https://ui-avatars.com/api/?name=${fullName}&background=4F46E5&color=fff`;
    const summary = resumeData.professional_summary || "No summary provided.";

    // Helper to find LinkedIn URL
    const linkedinUrl = social_links?.find(link => link.name?.toLowerCase().includes('linkedin'))?.url || personal_info?.linkedin;

    // NEW ITEMS: Name, Email, Mobile, Social Media
    const items = [
        { label: "Name", value: fullName },
        { label: "Email", value: personal_info?.email || "N/A" },
        { label: "Mobile", value: personal_info?.phone || "N/A" },
        {
            label: "Social Media",
            value: linkedinUrl,
            type: linkedinUrl ? 'linkedin' : 'text'
        },
    ];



    const similarProfiles = [
        { name: "HiTe-1130", role: "Front end developer", loc: "Pune, India", exp: "2 Years Experience", img: "https://randomuser.me/api/portraits/men/32.jpg" },
        { name: "HiTe-0220", role: "Team Lead", loc: "Pune, India", exp: "6 Years Experience", img: "https://randomuser.me/api/portraits/women/44.jpg" },
        { name: "HiTe-0783", role: "Lead - Front end dev", loc: "Pune, India", exp: "5 Years Experience", img: "https://randomuser.me/api/portraits/women/68.jpg" },
    ];

    return (
        <div className="fixed top-20 bottom-0 left-0 right-0 bg-gray-50 py-4 pb-20 md:pb-4 w-full font-[Outfit] overflow-y-auto !md:overflow-hidden">
            {/* FULL WIDTH CONTAINER */}
            <div className="w-full px-4 md:h-full box-border">


                {/* 3 EQUAL COLUMNS LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:h-full">

                    {/* LEFT COLUMN - Profile Card */}
                    <div className="w-full md:h-full md:overflow-hidden">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center md:h-full md:overflow-y-auto custom-scrollbar">
                            <div className="relative mb-6">
                                <div className="p-1 rounded-full border-4 border-indigo-100">
                                    <img
                                        src={avatar}
                                        alt={fullName}
                                        className="w-32 h-32 rounded-full object-cover"
                                    />
                                </div>
                                <div className="absolute top-2 right-2 bg-indigo-600 rounded-full p-1 border-2 border-white">
                                    <CheckCircle className="w-3 h-3 text-white" />
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 mb-4">{fullName}</h2>
                            <p className="text-sm text-gray-500 font-medium mb-1">{profession}</p>
                            <p className="text-sm text-gray-400 mb-6">$44/hr</p>

                            <p className="text-sm text-gray-600 leading-relaxed mb-8 text-left w-full">
                                {summary}
                            </p>

                            <div className="w-full text-left">
                                <h3 className="font-bold text-gray-900 mb-4 text-sm">Skill:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {skills && skills.length > 0 ? (
                                        skills.slice(0, 15).map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium text-gray-600"
                                            >
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-400">No skills listed</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE COLUMN - Info & Tabs */}
                    <div className="w-full md:h-full flex flex-col gap-6 md:overflow-hidden">

                        {/* Basic Information Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 md:h-[30%] min-h-0 md:overflow-y-auto custom-scrollbar bg-white shrink-0">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Basic Information:</h3>

                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-0">
                                {items.map((item, index) => (
                                    <div key={index}>
                                        <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                                        <div className="font-semibold text-gray-800 text-sm break-words min-h-[20px]">
                                            {item.type === 'linkedin' && item.value ? (
                                                <a href={item.value} target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity">
                                                    <img
                                                        src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
                                                        alt="LinkedIn"
                                                        className="w-8 h-8"
                                                    />
                                                </a>
                                            ) : (
                                                item.value || '-'
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* REMOVED BUTTONS AS REQUESTED */}
                        </div>

                        {/* Tabs Section */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 md:flex-1 min-h-0 flex flex-col bg-white shrink-0 md:overflow-hidden">
                            <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-gray-200 mb-6 shrink-0">
                                {['Experience', 'Education', 'Certification'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`pb-3 text-sm font-bold capitalize transition-colors relative ${activeTab === tab
                                            ? 'text-gray-900'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        {tab}
                                        {activeTab === tab && (
                                            <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-indigo-600 rounded-t-full"></div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="md:flex-1 md:overflow-y-auto custom-scrollbar pr-2">
                                {/* Experience */}
                                {activeTab === 'Experience' && (
                                    <div className="space-y-6">
                                        {experience?.map((exp, index) => (
                                            <div key={index} className="flex flex-col gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                                                <div className="flex gap-4 items-start">
                                                    <img
                                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(exp.company)}&background=random&color=fff&rounded=true&bold=true&size=128`}
                                                        alt={exp.company}
                                                        className="w-14 h-14 rounded-full object-cover shadow-sm flex-shrink-0"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-col xl:flex-row justify-between items-start gap-2">
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-gray-900 text-base">{exp.company}</h4>
                                                                <p className="text-sm text-gray-500 mt-1">{exp.position}</p>
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date} | {personal_info?.location || 'Remote'}
                                                                </p>
                                                            </div>
                                                            <button className="text-sm font-medium text-indigo-600 hover:underline whitespace-nowrap">
                                                                View Project
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed text-justify">
                                                    {exp.description}
                                                </p>
                                            </div>
                                        ))}
                                        {(!experience || experience.length === 0) && (
                                            <p className="text-center text-gray-400 py-4">No experience added.</p>
                                        )}
                                    </div>
                                )}

                                {/* Education */}
                                {activeTab === 'Education' && (
                                    <div className="space-y-6">
                                        {education?.map((edu, index) => (
                                            <div key={index} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                                                <div className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 font-bold text-base">
                                                    {edu.institution?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col xl:flex-row justify-between items-start gap-2">
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-gray-900 text-base">{edu.institution}</h4>
                                                            <p className="text-sm text-gray-500 mt-1">{edu.degree} - {edu.field}</p>
                                                            <p className="text-xs text-gray-400 mt-1">{edu.graduation_date}</p>
                                                        </div>
                                                        <button className="text-sm font-medium text-indigo-600 hover:underline whitespace-nowrap">
                                                            View Certificate
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!education || education.length === 0) && (
                                            <p className="text-center text-gray-400 py-4">No education added.</p>
                                        )}
                                    </div>
                                )}

                                {/* Certification */}
                                {activeTab === 'Certification' && (
                                    <div className="space-y-6">
                                        {certificates?.map((cert, index) => (
                                            <div key={index} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                                                <div className="w-14 h-14 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0">
                                                    <Award className="w-7 h-7" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col xl:flex-row justify-between items-start gap-2">
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-gray-900 text-base">{cert.title}</h4>
                                                            <p className="text-sm text-gray-500 mt-1">{cert.issuer}</p>
                                                            <p className="text-xs text-gray-400 mt-1">{cert.date}</p>
                                                        </div>
                                                        <button className="text-sm font-medium text-indigo-600 hover:underline whitespace-nowrap">
                                                            View Certificate
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!certificates || certificates.length === 0) && (
                                            <p className="text-center text-gray-400 py-4">No certifications added.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Video & Similar Profiles */}
                    {/* RIGHT COLUMN - Hobbies/Languages & Projects */}
                    <div className="w-full md:h-full flex flex-col gap-6 md:overflow-hidden">

                        {/* Projects - FLEXIBLE HEIGHT SCROLL */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 md:flex-1 flex flex-col min-h-0 md:overflow-hidden shrink-0">
                            <h3 className="font-bold text-gray-900 mb-4 text-base shrink-0">Projects:</h3>
                            <div className="md:overflow-y-auto md:flex-1 pr-2 space-y-4 custom-scrollbar">
                                {project && project.length > 0 ? (
                                    project.map((proj, i) => (
                                        <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all">
                                            <h4 className="text-sm font-bold text-gray-900">{proj.name}</h4>
                                            <p className="text-xs text-indigo-600 font-medium mt-1 mb-2">{proj.type}</p>
                                            <p className="text-xs text-gray-600 leading-relaxed max-h-20 overflow-hidden text-ellipsis">
                                                {proj.description}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400 italic text-center py-4">No projects added.</p>
                                )}
                            </div>
                        </div>

                        {/* Hobbies / Languages Tabs - FIXED HEIGHT SCROLL */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 md:h-[40%] min-h-0 flex flex-col shrink-0 md:overflow-hidden">
                            <div className="flex gap-6 border-b border-gray-200 mb-4 shrink-0">
                                {['Hobbies', 'Languages'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setRightTab(tab)}
                                        className={`pb-3 text-sm font-bold capitalize transition-colors relative ${rightTab === tab
                                            ? 'text-gray-900'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        {tab}
                                        {rightTab === tab && (
                                            <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-indigo-600 rounded-t-full"></div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="md:overflow-y-auto md:flex-1 pr-2 custom-scrollbar">
                                {rightTab === 'Hobbies' && (
                                    hobbies && hobbies.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {hobbies.map((hobby, i) => (
                                                <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                                                    {hobby}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center">
                                            <p className="text-sm text-gray-400 italic">No hobbies added.</p>
                                        </div>
                                    )
                                )}
                                {rightTab === 'Languages' && (
                                    languages && languages.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {languages.map((lang, i) => (
                                                <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                                                    {lang}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center">
                                            <p className="text-sm text-gray-400 italic">No languages added.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;