
import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.Mixed, required: true },
    title: { type: String, default: 'Untitled Resume' },
    public: { type: Boolean, default: false },
    template: { type: String, default: "classic" },
    accent_color: { type: String, default: "#3B82F6" },
    professional_summary: { type: String, default: '' },
    skills: { type: [String], default: [] },
    personal_info: {
        image: { type: String, default: '' },
        full_name: { type: String, default: '' },
        profession: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        location: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        website: { type: String, default: '' },
    },
    experience: {
        type: [
            {
                company: { type: String },
                position: { type: String },
                start_date: { type: String },
                end_date: { type: String },
                description: { type: String },
                is_current: { type: Boolean },
            }
        ],
        default: []
    },
    project: {
        type: [
            {
                name: { type: String },
                type: { type: String },
                description: { type: String },
            }
        ],
        default: []
    },
    education: {
        type: [
            {
                institution: { type: String },
                degree: { type: String },
                field: { type: String },
                graduation_date: { type: String },
                gpa: { type: String },
            }
        ],
        default: []
    },
    certificates: {
        type: [
            {
                title: { type: String },
                issuer: { type: String },
                date: { type: String },
                description: { type: String },
            }
        ],
        default: []
    },
    achievements: {
        type: [
            {
                title: { type: String },
                date: { type: String },
                description: { type: String },
            }
        ],
        default: []
    },
    hobbies: { type: [String], default: [] },
    languages: { type: [String], default: [] },
}, { timestamps: true, minimize: false, strict: false })

const Resume = mongoose.model('Resume', ResumeSchema)

export default Resume