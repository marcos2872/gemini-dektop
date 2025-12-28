const util = require('util');
const { execFile } = require('child_process');
const execFilePromise = util.promisify(execFile);

class MCPExecutor {
    /**
     * @param {import('./mcp-manager')} mcpManager
     */
    constructor(mcpManager) {
        this.mcpManager = mcpManager;
        this.timeout = 10000; // 10s
    }

    /**
     * Process prompt, execute detected MCP calls, and return enriched context.
     * @param {string} prompt
     * @returns {Promise<{original: string, enriched: string, mcpCalls: Array}>}
     */
    async executeMCPInPrompt(prompt) {
        const mcpCalls = [];
        let enriched = prompt;

        // Regex to find @serverName [args...]
        // Matches: @name followed by optional space and arguments until end of line or next @?
        // Actually, usually users type specific commands. Let's assume @server rest_of_line OR until another token?
        // Simplest: @token [rest of command]
        // To support multiple in one prompt, we can split by line or look for specific pattern.
        // Requirement says: "Qual é o uso de CPU agora?" -> Gemini identifies needed MCP.
        // WAIT. The requirements changed slightly in the user example vs usage.
        // User usage: "@servidor_mcp comando aqui" 
        // AND "Example: Gemini identifies it needs prometheus" -> This implies AI autonomous calling (Agentic).
        // BUT the requirement explicit structure is `invokeMCP(server, input)`.
        // AND "Support syntax: @server_mcp command here". 
        // I will implement the EXPLICIT syntax parsing FIRST. Autonomous calling is a different beast (requiring tool definitions passed to LLM).
        // The requirement says "Detect @nomeMCPServer in prompt".

        const regex = /@(\w+)(?:\s+([^\n]+))?/g;
        let match;
        const servers = await this.mcpManager.loadServers();

        // We collect replacements to make.
        // Better: We append the output to the prompt context.

        // reset regex lastIndex just in case
        regex.lastIndex = 0;

        while ((match = regex.exec(prompt)) !== null) {
            const fullMatch = match[0];
            const serverName = match[1];
            const inputArgs = match[2] || '';

            const server = servers.find(s => s.name === serverName);

            if (server && server.enabled !== false) {
                console.log(`[MCP Executor] Found call to @${serverName}`);
                const start = Date.now();
                let output = '';
                let error = false;

                try {
                    const result = await this._runServer(server, inputArgs);
                    output = result;
                } catch (err) {
                    console.error(`[MCP Executor] Error calling ${serverName}:`, err);
                    output = `Error: ${err.message}`;
                    error = true;
                }

                const duration = Date.now() - start;

                mcpCalls.push({
                    server: serverName,
                    input: inputArgs,
                    output: output,
                    duration,
                    error
                });

                // Append output to enriched prompt
                enriched += `\n\n--- [MCP Execution: @${serverName} ${inputArgs}] ---\n${output}\n-------------------------------------`;
            }
        }

        return {
            original: prompt,
            enriched,
            mcpCalls
        };
    }

    async invokeMCP(serverName, input) {
        const servers = await this.mcpManager.loadServers();
        const server = servers.find(s => s.name === serverName);
        if (!server) throw new Error(`Server ${serverName} not found`);

        return this._runServer(server, input);
    }

    async _runServer(server, input) {
        // Split input into args (basic space splitting, respecting quotes would be better but simple for now)
        // Actually, many CLI tools accept arguments as list.
        const args = input ? input.split(' ').filter(a => a.length > 0) : [];

        // Combine config args + input args
        const finalArgs = [...(server.args || []), ...args]; // Config args first? Or last? Usually config args are e.g. script path.

        console.log(`[MCP Executor] Executing: ${server.command} ${finalArgs.join(' ')}`);

        const { stdout, stderr } = await execFilePromise(server.command, finalArgs, {
            timeout: this.timeout,
            env: { ...process.env, ...(server.env || {}) },
            maxBuffer: 1024 * 1024 // 1MB output limit
        });

        if (stderr && stderr.trim().length > 0) {
            // Some tools output to stderr for info. We return both?
            // Let's return stdout + stderr if stderr exists.
            return `${stdout}\n[STDERR]\n${stderr}`;
        }

        return stdout;
    }
}

module.exports = MCPExecutor;
