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
                    <div style={{ marginLeft: 'auto' }}>
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
