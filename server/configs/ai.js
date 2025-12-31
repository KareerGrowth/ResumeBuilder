import "dotenv/config";
import OpenAI from "openai";

let baseUrl = process.env.OPENAI_BASE_URL ? process.env.OPENAI_BASE_URL.trim() : "";
const apiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : "";

// Feature: Auto-detect Groq keys and set URL if missing
if (!baseUrl && apiKey.startsWith("gsk_")) {
    console.log("-> Auto-detected Groq Key. Forcing Base URL to Groq API.");
    baseUrl = "https://api.groq.com/openai/v1";
}

console.log("--- AI CONFIG DEBUG ---");
console.log("OPENAI_BASE_URL:", baseUrl ? baseUrl : "(MISSING/UNDEFINED)");
console.log("OPENAI_API_KEY len:", apiKey ? apiKey.length : 0);
console.log("-----------------------");

const ai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseUrl,
});

export default ai