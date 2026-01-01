import Template from '../models/Template.js';

const templates = [
    { templateId: "classic-88231", name: "Classic", description: "Standard professional layout", status: "RECOMMENDED" },
    { templateId: "modern-12456", name: "Modern", description: "Clean and contemporary design", status: "PRO" },
    { templateId: "minimal-image-99821", name: "Minimal Image", description: "Sleek with profile photo", status: "PREMIUM" },
    { templateId: "minimal-33421", name: "Minimal", description: "Simple and elegant", status: null },
    { templateId: "executive-77612", name: "Executive", description: "High-level professional style", status: "PRO" },
    { templateId: "academic-55432", name: "Academic", description: "Structured for researchers", status: null },
    { templateId: "ats-88765", name: "ATS Friendly", description: "Optimized for scanning systems", status: "RECOMMENDED" },
    { templateId: "ats-compact-22109", name: "ATS Compact", description: "Dense ATS-optimized layout", status: "PREMIUM" }
];

/**
 * Initialize essential database records
 */
export const initializeData = async () => {
    try {
        const count = await Template.countDocuments();
        if (count === 0) {
            console.log("[INIT] Seeding templates into MongoDB...");
            await Template.insertMany(templates);
            console.log(`[INIT] Successfully seeded ${templates.length} templates.`);
        } else {
            console.log("[INIT] Templates already exist, skipping seed.");
        }
    } catch (error) {
        console.error("[INIT] Error during data initialization:", error);
    }
};
