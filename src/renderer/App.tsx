import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import MCPServerPanel from './components/MCPServerPanel';
import ConversationHistory from './components/ConversationHistory';

const App: React.FC = () => {
    const [view, setView] = useState<'chat' | 'history'>('chat');
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [models, setModels] = useState<Array<{ name: string; displayName: string }>>([]);
    const [currentModel, setCurrentModel] = useState('gemini-2.0-flash');

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

        // Fetch models
        window.electronAPI.listModels().then(fetchedModels => {
            if (fetchedModels && fetchedModels.length > 0) {
                console.log('Loaded models:', fetchedModels);
                setModels(fetchedModels);
                // Optional: Set default to first or specific preference
                // setCurrentModel(fetchedModels[0].name); 
            }
        }).catch(err => console.error('Failed to list models:', err));
    }, []);

    return (
        <div className="app-container" style={{ flexDirection: 'row' }}>
            <MCPServerPanel />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100vh' }}>
                <div className="app-header">
                    <h1>Gemini Desktop</h1>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select
                            value={currentModel}
                            onChange={(e) => {
                                const model = e.target.value;
                                setCurrentModel(model);
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
                                marginRight: '8px',
                                maxWidth: '200px'
                            }}
                        >
                            {models.length > 0 ? (
                                models.map(m => (
                                    <option key={m.name} value={m.name}>
                                        {m.displayName}
                                    </option>
                                ))
                            ) : (
                                <>
                                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                </>
                            )}
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
