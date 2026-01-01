import imagekit from "../configs/imageKit.js";
import Resume from "../models/Resume.js";
import fs from 'fs';


// controller for creating a new resume
// POST: /api/resumes/create
export const createResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { title, template } = req.body;

        // create new resume
        const newResume = await Resume.create({ userId, title, template })
        // return success message
        return res.status(201).json({ message: 'Resume created successfully', resume: newResume })

    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// controller for deleting a resume
// DELETE: /api/resumes/delete
export const deleteResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        await Resume.findOneAndDelete({ userId, _id: resumeId })

        // return success message
        return res.status(200).json({ message: 'Resume deleted successfully' })

    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}


// get user resume by id
// GET: /api/resumes/get
export const getResumeById = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        const resume = await Resume.findOne({ userId, _id: resumeId })

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" })
        }

        resume.__v = undefined;
        resume.createdAt = undefined;
        resume.updatedAt = undefined;

        return res.status(200).json({ resume })

    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// get resume by id public
// GET: /api/resumes/public
export const getPublicResumeById = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const resume = await Resume.findOne({ public: true, _id: resumeId })

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" })
        }

        return res.status(200).json({ resume })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// controller for updating a resume
// PUT: /api/resumes/update
export const updateResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId, resumeData, removeBackground } = req.body
        const image = req.file;

        let resumeDataCopy;
        if (typeof resumeData === 'string') {
            resumeDataCopy = await JSON.parse(resumeData)
        } else {
            resumeDataCopy = structuredClone(resumeData)
        }

        if (image) {


            const imageBufferData = fs.createReadStream(image.path)

            const response = await imagekit.files.upload({
                file: imageBufferData,
                fileName: 'resume.png',
                folder: 'user-resumes',
                transformation: {
                    pre: 'w-300,h-300,fo-face,z-0.75' + (removeBackground ? ',e-bgremove' : '')
                }
            });

            resumeDataCopy.personal_info.image = response.url
        }

        // Log the data being sent to database
        console.log('Updating resume with data:', JSON.stringify({
            certificates: resumeDataCopy.certificates,
            achievements: resumeDataCopy.achievements,
            hobbies: resumeDataCopy.hobbies,
            languages: resumeDataCopy.languages
        }, null, 2));

        const resume = await Resume.findOneAndUpdate(
            { userId, _id: resumeId },
            {
                $set: {
                    ...resumeDataCopy,
                    certificates: resumeDataCopy.certificates || [],
                    achievements: resumeDataCopy.achievements || [],
                    hobbies: resumeDataCopy.hobbies || [],
                    languages: resumeDataCopy.languages || []
                }
            },
            {
                new: true,
                runValidators: false,
                strict: false,
                overwrite: false
            }
        )

        console.log('Resume after update:', JSON.stringify({
            certificates: resume.certificates,
            achievements: resume.achievements,
            hobbies: resume.hobbies,
            languages: resume.languages
        }, null, 2));

        // Ensure all fields are present in the response
        const responseResume = {
            ...resume.toObject(),
            certificates: resume.certificates || [],
            achievements: resume.achievements || [],
            hobbies: resume.hobbies || [],
            languages: resume.languages || []
        }

        return res.status(200).json({ resume: responseResume, message: "Resume updated successfully" })

    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// get all templates
// GET: /api/resumes/templates
export const getTemplates = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        // Default limit to 0 (all) to maintain backward compatibility for Dashboard
        // If limit is provided in query, use it.
        const limit = parseInt(req.query.limit) || 0;

        const allTemplates = [
            { id: "classic", name: "Classic" },
            { id: "modern", name: "Modern" },
            { id: "minimal-image", name: "Minimal Image" },
            { id: "minimal", name: "Minimal" },
            { id: "executive", name: "Executive" },
            { id: "academic", name: "Academic" },
            { id: "ats", name: "ATS Friendly" },
            { id: "ats-compact", name: "ATS Compact" },
            // Duplicating for demo purposes as user requested 12 logic with limited real templates
            { id: "classic", name: "Classic (Copy)" },
            { id: "modern", name: "Modern (Copy)" },
            { id: "minimal-image", name: "Minimal Image (Copy)" },
            { id: "minimal", name: "Minimal (Copy)" },
        ];

        let templates = allTemplates;
        const totalTemplates = allTemplates.length;
        let totalPages = 1;

        if (limit > 0) {
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            templates = allTemplates.slice(startIndex, endIndex);
            totalPages = Math.ceil(totalTemplates / limit);
        }

        return res.status(200).json({
            templates,
            currentPage: page,
            totalPages,
            totalTemplates
        })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}
