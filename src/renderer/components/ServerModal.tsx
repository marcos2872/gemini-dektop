import React, { useState } from 'react';

interface MCPServer {
    name: string;
    command: string;
    args?: string[];
    enabled?: boolean;
}

interface ServerModalProps {
    server?: MCPServer;
    onClose: () => void;
    onSave: (server: MCPServer) => void;
}

const ServerModal: React.FC<ServerModalProps> = ({ server, onClose, onSave }) => {
    const [name, setName] = useState(server?.name || '');
    const [command, setCommand] = useState(server?.command || '');
    const [args, setArgs] = useState(server?.args?.join(' ') || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            command,
            args: args.split(' ').filter(a => a.length > 0),
            enabled: true
        });
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#252526', padding: '1.5rem', borderRadius: '8px',
                width: '400px', border: '1px solid #3E3E42'
            }}>
                <h3 style={{ marginTop: 0 }}>{server ? 'Edit Server' : 'Add Server'}</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
                        <input
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', backgroundColor: '#1E1E1E', border: '1px solid #3E3E42', color: 'white' }}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Command (Executable)</label>
                        <input
                            required
                            value={command}
                            onChange={e => setCommand(e.target.value)}
                            placeholder="e.g. npx, python3, /usr/bin/git"
                            style={{ width: '100%', padding: '0.5rem', backgroundColor: '#1E1E1E', border: '1px solid #3E3E42', color: 'white' }}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Arguments (space separated)</label>
                        <input
                            value={args}
                            onChange={e => setArgs(e.target.value)}
                            placeholder="-y @modelcontextprotocol/server-filesystem"
                            style={{ width: '100%', padding: '0.5rem', backgroundColor: '#1E1E1E', border: '1px solid #3E3E42', color: 'white' }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#9DA5B4', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" className="primary-btn">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ServerModal;
