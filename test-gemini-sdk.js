const GeminiClient = require('./src/boot/gemini-client');
require('dotenv').config();

async function test() {
    console.log('Testing Gemini SDK Integration...');

    if (!process.env.GEMINI_API_KEY) {
        console.error('ERROR: GEMINI_API_KEY is missing in .env file');
        process.exit(1);
    }

    const client = new GeminiClient();
    try {
        await client.initialize();
        console.log('Initialization: SUCCESS');

        console.log('Sending prompt: "Hello, tell me a joke."');
        const response = await client.sendPrompt('Hello, tell me a joke.');
        console.log('\nResponse received:');
        console.log('-----------------------------------');
        console.log(response);
        console.log('-----------------------------------');
        console.log('Test PASSED');
    } catch (error) {
        console.error('Test FAILED:', error);
    }
}

test();
