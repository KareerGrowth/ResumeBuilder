import Resume from "../models/Resume.js";
import ai from "../configs/ai.js";

// controller for enhancing a resume's professional summary
// POST: /api/ai/enhance-pro-sum
export const enhanceProfessionalSummary = async (req, res) => {
    try {
        const { userContent } = req.body;

        if (!userContent) {
            console.log("[AI Enhance Summary] Missing userContent in request");
            return res.status(400).json({ message: 'Missing required fields' })
        }

        console.log("---------------------------------------------------");
        console.log("[AI Enhance Summary] STARTING REQUEST");
        console.log("[AI CONFIG CHECK] Model:", process.env.OPENAI_MODEL);
        console.log("[AI CONFIG CHECK] BaseURL:", ai.baseURL); // Check if AI instance has correct BaseURL
        console.log("[AI CONFIG CHECK] API Key Len:", ai.apiKey ? ai.apiKey.length : "MISSING");
        console.log("[AI PAYLOAD] Content Length:", userContent.length);
        console.log("---------------------------------------------------");

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                { role: "system", content: "You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly. and only return text no options or anything else." },
                {
                    role: "user",
                    content: userContent,
                },
            ],
        })

        console.log("[AI Enhance Summary] SUCCESS");
        console.log("[AI RESPONSE PREVIEW]:", response.choices[0].message.content.substring(0, 50) + "...");

        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({ enhancedContent })
    } catch (error) {
        console.error("---------------------------------------------------");
        console.error("[AI Enhance Summary] FAILED");
        console.error("ERROR MESSAGE:", error.message);
        console.error("ERROR STACK:", error.stack);
        if (error.response) {
            console.error("OPENAI ERROR DETAILS:", JSON.stringify(error.response.data));
        }
        console.error("---------------------------------------------------");
        return res.status(400).json({ message: error.message })
    }
}

// controller for enhancing a resume's job description
// POST: /api/ai/enhance-job-desc
export const enhanceJobDescription = async (req, res) => {
    try {
        const { userContent } = req.body;

        if (!userContent) {
            return res.status(400).json({ message: 'Missing required fields' })
        }

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are an expert in resume writing. Your task is to enhance the job description of a resume. The job description should be only in 1-2 sentence also highlighting key responsibilities and achievements. Use action verbs and quantifiable results where possible. Make it ATS-friendly. and only return text no options or anything else."
                },
                {
                    role: "user",
                    content: userContent,
                },
            ],
        })

        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({ enhancedContent })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// controller for uploading a resume to the database
// POST: /api/ai/upload-resume
export const uploadResume = async (req, res) => {
    try {

        const { resumeText, title } = req.body;
        const userId = req.userId;

        if (!resumeText) {
            return res.status(400).json({ message: 'Missing required fields' })
        }

        const systemPrompt = "You are an expert AI Agent to extract data from resume."

        const userPrompt = `extract data from this resume: ${resumeText}
        
        Provide data in the following JSON format with no additional text before or after:

        {
        professional_summary: { type: String, default: '' },
        skills: [{ type: String }],
        personal_info: {
            image: {type: String, default: '' },
            full_name: {type: String, default: '' },
            profession: {type: String, default: '' },
            email: {type: String, default: '' },
            phone: {type: String, default: '' },
            location: {type: String, default: '' },
            linkedin: {type: String, default: '' },
            website: {type: String, default: '' },
        },
        experience: [
            {
                company: { type: String },
                position: { type: String },
                start_date: { type: String },
                end_date: { type: String },
                description: { type: String },
                is_current: { type: Boolean },
            }
        ],
        project: [
            {
                name: { type: String },
                type: { type: String },
                description: { type: String },
            }
        ],
        education: [
            {
                institution: { type: String },
                degree: { type: String },
                field: { type: String },
                graduation_date: { type: String },
                gpa: { type: String },
            }
        ],          
        }
        `;

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userPrompt,
                },
            ],
            response_format: { type: 'json_object' }
        })

        const extractedData = response.choices[0].message.content;
        const parsedData = JSON.parse(extractedData)
        const newResume = await Resume.create({ userId, title, ...parsedData })

        res.json({ resumeId: newResume._id })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// controller for calculating ATS Score
// POST: /api/ai/ats-check
export const calculateATSScore = async (req, res) => {
    try {
        const { resumeText } = req.body;

        if (!resumeText) {
            return res.status(400).json({ message: 'Missing resume text' });
        }

        // Increase timeout for AI processing
        req.setTimeout(60000); // 60 seconds

        const systemPrompt = `You are an expert ATS (Applicant Tracking System) Analyzer & Resume Coach.
Analyze the resume deeply and provide a structured JSON response.

CRITICAL INSTRUCTIONS:
1. **Dynamic Sections**: Only include sections in the JSON that are ACTUALLY PRESENT in the resume. If a section (like "Experience", "Certificates", or "Projects") is missing from the text, DO NOT include it in the "metrics" or "detailed_analysis" objects.
2. **Analysis**: For each present section, provide a brief summary and a checklist of 3-6 actionable points.

STRICT JSON OUTPUT FORMAT:
{
  "ats_score": <0-100 integer>,
  "metrics": {
    // Only include keys for sections found in the resume. Examples:
    "Professional Summary": { "score": <0-100>, "issues": <count> },
    "Experience": { "score": <0-100>, "issues": <count> },
    // ... others only if present
  },
  "overall_verdict": {
    "summary": "2-3 sentences executive summary.",
    "strengths": ["List 3 key strengths"],
    "red_flags": ["List 3 critical red flags"],
    "roadmap": ["Step 1", "Step 2", "Step 3"]
  },
  "detailed_analysis": {
    // Keys MUST match those in "metrics". Only include present sections.
    "Professional Summary": {
        "summary": "Brief analysis paragraph.",
        "items": [
             { "label": "Point 1", "status": "pass/warning/fail", "message": "...", "fix": "..." },
             // ... 3 to 6 items
        ]
    },
    // ... other sections ONLY if present in resume
  }
}
`;

        console.log(`[ATS Check API] Sending request to OpenAI model: ${process.env.OPENAI_MODEL}`);

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Analyze this resume:\n\n${resumeText}` },
            ],
            response_format: { type: 'json_object' }
        });

        const result = response.choices[0].message.content;

        console.log("---------------------------------------------------");
        console.log("[ATS AI API RESPONSE RAW JSON]:");
        console.log(result);
        console.log("---------------------------------------------------");

        return res.status(200).json(JSON.parse(result));

    } catch (error) {
        console.error("ATS Check Error:", error);
        return res.status(500).json({ message: "Failed to calculate ATS score", error: error.message });
    }
}