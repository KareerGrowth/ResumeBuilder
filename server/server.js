import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import requestIp from 'request-ip';
import mysqlAuthService from './services/mysqlAuthService.js';
import "dotenv/config";
import connectDB from "./configs/db.js";
import { testConnection } from "./configs/mysql.js";
import { initializeData } from "./services/initializationService.js";
import userRouter from "./routes/userRoutes.js";
import resumeRouter from "./routes/resumeRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
import creditRoutes from './routes/creditRoutes.js';
import paymentRouter from './routes/paymentRoutes.js';
import http from 'http';
import { WebSocketServer } from 'ws';
// OpenAI import removed (using shared instance)

const app = express();
const PORT = process.env.PORT || 5000;

// Database connections
await connectDB();
await initializeData();

try {
    const mysqlConnected = await testConnection();
    if (mysqlConnected) {
        console.log('MySQL connection available for candidate authentication');
    } else {
        console.warn('MySQL connection not available - candidate authentication disabled');
    }
} catch (error) {
    console.warn('MySQL connection test failed:', error.message);
}

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://resume-builder-production.up.railway.app',
    'https://systemmindz-rb.vercel.app'
];

app.set('trust proxy', 1); // Trust Render/Cloudflare proxy
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            // Origin is allowed
            return callback(null, true);
        } else {
            // Origin is not allowed
            console.warn(`Blocked CORS request from origin: ${origin}`);
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.get('/', (req, res) => res.send("Server is live..."))
app.use('/api/users', userRouter)
app.use('/api/resumes', resumeRouter)
app.use('/api/ai', aiRouter)
app.use('/api/credits', creditRoutes)
app.use('/api/payment', paymentRouter)

if (process.env.MYSQL_HOST) {
    mysqlAuthService.initializeTables().catch(err => console.error(err));
}

// HTTP Server & WebSocket Setup
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

import ai from "./configs/ai.js";

const client = ai;

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'ats_check') {
                const { resumeText } = data;

                const systemPrompt = `You are a Senior Executive Talent Acquisition Partner and ATS Architect. 
Your goal is to perform a high-impact, architectural audit of a resume to identify structural integrity, formatting professionality, and profile alignment.

PHASE 1: CATEGORIZATION
Identify if the candidate is a "Fresher" (entry-level, student, career changer with < 2 years experience) or an "Experienced Professional" (solid career track, 2+ years).

PHASE 2: STRUCTURE & FORMATTING AUDIT
1. Audit the physical sections found in the resume from start to end.
2. Extract the COMPLETE, VERBATIM content for each section as it appears in the resume.
   CRITICAL: Copy the ENTIRE text from each section WITHOUT any truncation, summarization, or paraphrasing.
   Include ALL sentences, ALL details, and ALL information exactly as written.
   PRESERVE LINE BREAKS: If the section has multiple bullet points or entries, put each on a NEW LINE.
   Use "\\n" (newline character) to separate different bullet points, entries, or paragraphs.
3. Audit Formatting: Identify current Font Family, Size, and Alignment. Recommend professional industry standards.

PHASE 3: SECTION-WISE SCORING & ANALYSIS
CRITICAL SCORING REQUIREMENTS:
- For EVERY section identified in Phase 2, you MUST assign a numeric score from 0-100
- Score each section based on: completeness (30%), relevance (30%), formatting (20%), ATS-friendliness (20%)
- The "metrics" object MUST contain an entry for EACH section from "current_resume_sections"
- Each section score should reflect the actual quality of that specific section

CRITICAL ANALYSIS REQUIREMENTS:
- For EVERY SINGLE section you identified in Phase 2 (current_resume_sections), you MUST provide 3-4 granular analysis points.
- The "detailed_analysis" object MUST contain an entry for EACH section name from "current_resume_sections".
- Categorize each point as "good" (strength), "average" (needs minor tweak), or "bad" (critical fix needed).

Example: If current_resume_sections = ["Profile Summary", "Education", "Skills", "Experience", "Projects", "Certifications"]
Then:
- metrics MUST have keys for ALL 6 sections with numeric scores
- detailed_analysis MUST have keys for ALL 6 sections with 3-4 points each

PHASE 4: OVERALL ATS SCORE CALCULATION
CRITICAL: Calculate the overall ATS score (0-100) as a weighted average of ALL section scores:
- Profile/Summary: 20% weight
- Experience/Work History: 25% weight
- Skills: 20% weight
- Education: 15% weight
- Other sections (Projects, Certifications, etc.): 20% weight combined
The final ats_score MUST be a realistic number between 0-100 that accurately reflects the resume quality.

PHASE 5: EXECUTIVE EVALUATION
Generate a 2-3 sentence high-impact narrative summary of the candidate's entire profile.

PHASE 6: MASTER DRAFT
Generate a fully optimized, markdown-formatted version of the resume that follows the identified profile's optimal section hierarchy.

OUTPUT REQUIREMENTS:
Return valid JSON matching this schema:
{
  "profile_type": "Fresher" | "Experienced",
  "ats_score": number (0-100, calculated as weighted average of section scores),
  "score_justification": "1 sentence explanation of the score",
  "executive_summary": "2-3 high-impact sentences describing the profile",
  "formatting_audit": {
    "current_font": "string",
    "recommended_font": "string",
    "current_size": "string",
    "recommended_size": "string",
    "current_alignment": "string",
    "recommended_alignment": "string"
  },
  "current_resume_sections": ["Section 1", "Section 2", ...],
  "section_content": {
    "Section 1": "Actual text content from this section in the resume",
    "Section 2": "Actual text content from this section in the resume",
    ... (MUST include content for ALL sections from current_resume_sections)
  },
  "detailed_analysis": {
    "Section 1": [
      { "label": "Point title", "status": "good" | "average" | "bad", "message": "Feedback" },
      { "label": "Point title", "status": "good" | "average" | "bad", "message": "Feedback" },
      { "label": "Point title", "status": "good" | "average" | "bad", "message": "Feedback" }
    ],
    "Section 2": [...],
    ... (MUST include ALL sections from current_resume_sections)
  },
  "metrics": {
    "Section 1": { "score": number (0-100), "feedback": "Brief feedback on this section" },
    "Section 2": { "score": number (0-100), "feedback": "Brief feedback on this section" },
    ... (MUST include ALL sections from current_resume_sections with their individual scores)
  },
  "optimized_resume_markdown": "Complete professional resume draft in Markdown"
}`;

                console.log(`[ATS Check] Sending request to OpenAI model: ${process.env.OPENAI_MODEL}`);
                const completion = await client.chat.completions.create({
                    model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `Analyze this resume:\n\n${resumeText}` },
                    ],
                    response_format: { type: "json_object" },
                    stream: false,
                });

                console.log(`[ATS Check] Received response from AI`);
                const result = completion.choices[0].message.content;

                console.log("---------------------------------------------------");
                console.log("[ATS AI RESPONSE RAW JSON]:");
                console.log(result);
                console.log("---------------------------------------------------");

                ws.send(JSON.stringify({ type: 'json_result', content: JSON.parse(result) }));
                ws.send(JSON.stringify({ type: 'done' }));

            } else if (data.type === 'optimize_resume') {
                const { resumeText } = data;
                const optimizationPrompt = `
                You are an expert Resume Writer & ATS Specialist.
                Refine and rewrite the following resume to be perfectly optimized for ATS systems.
                
                Rules:
                1. Fix all spelling, grammar, and formatting issues.
                2. Improve strong action verbs and impact statements.
                3. Ensure all critical sections (Summary, Experience, Education, Skills) are present and well-structured.
                4. Output ONLY the rewritten resume content in clean, professional Markdown.
                5. Do NOT include any conversational filler ("Here is the optimized resume..."). Just the resume.
                `;

                const stream = await client.chat.completions.create({
                    model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: optimizationPrompt },
                        { role: "user", content: `Optimize this resume:\n\n${resumeText}` },
                    ],
                    stream: true,
                });

                for await (const chunk of stream) {
                    if (chunk.choices[0]?.delta?.content) {
                        ws.send(JSON.stringify({ type: 'token', content: chunk.choices[0].delta.content }));
                    }
                }

                ws.send(JSON.stringify({ type: 'done' }));
            }
        } catch (error) {
            console.error('WebSocket Error:', error);
            ws.send(JSON.stringify({ type: 'error', message: error.message }));
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


