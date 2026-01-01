import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema({
    templateId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['PRO', 'PREMIUM', 'RECOMMENDED', null], default: null },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Template = mongoose.model("Template", TemplateSchema);

export default Template;
