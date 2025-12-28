const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const logFile = path.join(__dirname, 'models.log');
const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
};

// Clear log
fs.writeFileSync(logFile, '');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    log('No API Key found in .env');
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

log(`Fetching models...`);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                log('API Error: ' + JSON.stringify(json.error));
            } else if (json.models) {
                log('AVAILABLE MODELS:');
                json.models.forEach(m => {
                    if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                        log(`- ${m.name.replace('models/', '')}`);
                    }
                });
            } else {
                log('Unexpected response: ' + JSON.stringify(json));
            }
        } catch (e) {
            log('Failed to parse response: ' + e.message);
            log('Raw data: ' + data);
        }
    });

}).on('error', (err) => {
    log('Request failed: ' + err.message);
});
