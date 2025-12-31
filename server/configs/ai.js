import "dotenv/config";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const baseUrl = process.env.OPENAI_BASE_URL;

console.log("--- AI CONFIG DEBUG ---");
console.log("OPENAI_BASE_URL:", baseUrl ? baseUrl : "(MISSING/UNDEFINED)");
console.log("OPENAI_API_KEY:", apiKey ? `${apiKey.substring(0, 5)}...` : "(MISSING)");
console.log("-----------------------");

const ai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseUrl,
});

export default ai