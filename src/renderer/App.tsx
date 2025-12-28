import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import MCPServerPanel from './components/MCPServerPanel';
import ConversationHistory from './components/ConversationHistory';

const App: React.FC = () => {
    const [view, setView] = useState<'chat' | 'history'>('chat');
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

    const handleNewConversation = async () => {
        const conv = await window.electronAPI.conversationNew();
        setCurrentConversationId(conv.id);
        setView('chat');
    };

    const handleSelectConversation = (id: string) => {
        setCurrentConversationId(id);
        setView('chat');
    };

    useEffect(() => {
        // Initialize with new conversation if none
        handleNewConversation();
    }, []);

    return (
        <div className="app-container" style={{ flexDirection: 'row' }}>
            <MCPServerPanel />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100vh' }}>
                <div className="app-header">
                    <h1>Gemini Desktop</h1>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select
                            onChange={(e) => {
                                const model = e.target.value;
                                window.electronAPI.setModel(model)
                                    .then(() => console.log('Model changed to', model))
                                    .catch(err => console.error('Failed to change model', err));
                            }}
                            style={{
                                padding: '0.4rem',
                                borderRadius: '4px',
                                border: '1px solid #444',
                                backgroundColor: '#2D2D2D',
                                color: '#fff',
                                marginRight: '8px'
                            }}
                            defaultValue="gemini-2.0-flash"
                        >
                            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                            <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Exp)</option>
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Preview)</option>
                            <option value="gemini-pro-latest">Gemini Pro (Latest)</option>
                            <option value="gemini-flash-latest">Gemini Flash (Latest)</option>
                            <option value="gemini-2.0-flash-lite-preview-02-05">Gemini 2.0 Flash Lite</option>
                        </select>
                        <button onClick={handleNewConversation} className="primary-btn" style={{ marginRight: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>New Chat</button>
                        <button onClick={() => setView('history')} className="primary-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>History</button>
                    </div>
                </div>
                {view === 'chat' ? (
                    <ChatInterface conversationId={currentConversationId} />
                ) : (
                    <ConversationHistory onSelect={handleSelectConversation} />
                )}
            </div>
        </div>
    );
};

export default App;
