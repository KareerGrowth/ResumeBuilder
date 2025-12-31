import "dotenv/config";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : "";
const baseUrl = process.env.OPENAI_BASE_URL ? process.env.OPENAI_BASE_URL.trim() : "";

console.log("--- AI CONFIG DEBUG ---");
console.log("OPENAI_BASE_URL:", baseUrl ? baseUrl : "(MISSING/UNDEFINED)");
console.log("OPENAI_API_KEY len:", apiKey ? apiKey.length : 0); // Log length to check for hidden chars
console.log("-----------------------");

const ai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseUrl,
});

export default ai