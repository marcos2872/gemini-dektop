const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
    if (!process.env.GEMINI_API_KEY) {
        console.error('ERROR: GEMINI_API_KEY is missing in .env file');
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Uses the API to list models
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Dummy model init to get to client? 
        // Actually the SDK doesn't expose listModels directly on the main class easily in all versions, 
        // but let's try to access the underlying API or just tell the user standard models.
        // Wait, the error message literally says "Call ListModels".
        // In the Node SDK, it's usually separate management API or not clearly exposed.
        // Let's use the standard fetch implementation to be sure because SDK versions vary.

        // Actually, let's just stick to the known working models 
        // but creating a script that tries the user's config is better.

        console.log("Checking commonly available models...");
        const modelsToCheck = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

        for (const m of modelsToCheck) {
            process.stdout.write(`Checking ${m}... `);
            try {
                const model = genAI.getGenerativeModel({ model: m });
                await model.generateContent('Hi');
                console.log('✅ Available');
            } catch (e) {
                console.log('❌ ' + e.message.split('[')[0]); // simplified error
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

listModels();
