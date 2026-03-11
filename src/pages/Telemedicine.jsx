import React, { useState, useRef, useEffect } from 'react';
import BottomNav from '../components/BottomNav';

export default function Telemedicine() {
    const [messages, setMessages] = useState([
        { text: "Hello! I'm Dr. AI, your virtual medical assistant. How can I help you today?", isUser: false, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newMsg = { text: inputValue, isUser: true, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
        setMessages(prev => [...prev, newMsg]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI Response
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, { 
                text: "Thank you for reaching out. Please describe your symptoms in detail.", 
                isUser: false, 
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
            }]);
        }, 1500);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingBottom: '70px' }}>
            <header className="header">
                <div className="header-content">
                    <h1>Medzyme Chat</h1>
                    <div className="status-indicator">
                        <div className="status-dot"></div><span>Online</span>
                    </div>
                </div>
            </header>

            <div className="container" style={{ flex: 1, overflow: 'hidden' }}>
                <main className="chat-section" style={{ height: '100%' }}>
                    <div className="chat-container">
                        <div className="chat-window">
                            {messages.map((msg, i) => (
                                <div key={i} className={`message ${msg.isUser ? 'user' : 'ai'}`} style={{ opacity: 1, transform: 'none' }}>
                                    <div className={`avatar ${msg.isUser ? 'user' : 'ai'}`}>
                                        <i className={`fas fa-${msg.isUser ? 'user' : 'user-md'}`}></i>
                                    </div>
                                    <div className="message-wrapper">
                                        <div className="message-sender">{msg.isUser ? 'You' : 'Dr. AI'}</div>
                                        <div className="message-content">
                                            {msg.text}
                                            <div className="message-timestamp">{msg.time}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && <div className="message-sender">Dr AI is typing...</div>}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="input-area">
                            <div className="input-group">
                                <textarea 
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type your message..." 
                                    rows="1"
                                    onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                />
                                <button className="send-button" onClick={handleSend} disabled={!inputValue.trim()}>
                                    <i className="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <BottomNav />
        </div>
    );
}