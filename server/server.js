import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import requestIp from 'request-ip';
import mysqlAuthService from './services/mysqlAuthService.js';
import "dotenv/config";
import connectDB from "./configs/db.js";
import { testConnection } from "./configs/mysql.js";
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

                const systemPrompt = `You are an expert ATS (Applicant Tracking System) Analyzer & Resume Coach.
Analyze the resume deeply and provided a structured JSON response.

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


