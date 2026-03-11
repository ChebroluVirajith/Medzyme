import React, { useEffect, useRef, useState } from 'react';
import BottomNav from '../components/BottomNav';
import '../styles/Diagnosis.css';
import { getLocalDiagnosisResponse } from '../services/localDiagnosis.js';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const DIAGNOSIS_API_URL = API_BASE_URL
    ? `${API_BASE_URL}/api/diagnosis/chat`
    : '/api/diagnosis/chat';
const API_TARGET_LABEL = API_BASE_URL || 'current app origin (/api via Vite proxy)';
const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;

const createMessage = (role, text, extras = {}) => ({
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    text,
    timestamp: new Date().toISOString(),
    ...extras,
});

const initialAssistantMessage = createMessage(
    'assistant',
    'Share your symptoms in text and attach an image if relevant (for example a rash, eye redness, or throat photo). I will return a preliminary diagnosis, home remedies, and medicines to discuss with a clinician.'
);

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Unable to read image file'));
        reader.readAsDataURL(file);
    });
}

function toDisplayTime(isoDate) {
    return new Date(isoDate).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getDiagnosisRequestErrorMessage(error) {
    const rawMessage = String(error?.message || '');
    const lowerMessage = rawMessage.toLowerCase();

    if (
        lowerMessage.includes('failed to fetch') ||
        lowerMessage.includes('networkerror') ||
        lowerMessage.includes('fetch failed') ||
        lowerMessage.includes('network request failed')
    ) {
        return `Cannot reach diagnosis API at ${API_TARGET_LABEL}. Start backend with: cd backend && npm run dev`;
    }

    if (lowerMessage.includes('unexpected end of json') || lowerMessage.includes('json')) {
        return 'Diagnosis API returned an invalid response. Please retry in a moment.';
    }

    return rawMessage || 'Failed to contact diagnosis service.';
}

function buildAssistantLeadText(payload) {
    if (!payload) {
        return 'Here is your preliminary diagnosis summary.';
    }

    const topMatch = payload?.diagnosis?.[0];
    const triageLevel = payload?.triage?.level
        ? String(payload.triage.level).toUpperCase()
        : null;

    const leadParts = [];

    if (topMatch?.name && topMatch?.confidence) {
        leadParts.push(`Top match: ${topMatch.name} (${topMatch.confidence}% match).`);
    } else if (topMatch?.name) {
        leadParts.push(`Top match: ${topMatch.name}.`);
    }

    if (triageLevel) {
        leadParts.push(`Triage: ${triageLevel}.`);
    }

    leadParts.push('Detailed diagnosis, remedies, and medicine suggestions are shown below.');

    return leadParts.join(' ');
}

function AssistantAnalysis({ payload }) {
    const diagnosis = payload?.diagnosis || [];
    const remedies = payload?.remedies || [];
    const drugs = payload?.drugs || [];

    return (
        <div className="assistant-analysis">
            {diagnosis.length > 0 && (
                <div className="analysis-block">
                    <h4>Likely Conditions</h4>
                    <ul className="analysis-list">
                        {diagnosis.map((item) => (
                            <li key={item.name}>
                                <strong>{item.name}</strong> ({item.confidence}% match, {item.severity})
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {remedies.length > 0 && (
                <div className="analysis-block">
                    <h4>Home Remedies</h4>
                    <ul className="analysis-list">
                        {remedies.map((remedy) => (
                            <li key={remedy}>{remedy}</li>
                        ))}
                    </ul>
                </div>
            )}

            {drugs.length > 0 && (
                <div className="analysis-block">
                    <h4>Medicines To Discuss</h4>
                    <ul className="analysis-list">
                        {drugs.map((drug) => (
                            <li key={`${drug.name}-${drug.type}`}>
                                <strong>{drug.name}</strong> ({drug.type}) - {drug.purpose}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {payload?.triage && (
                <div className="analysis-block">
                    <h4>Triage</h4>
                    <div className="analysis-chip-row">
                        <span className="analysis-chip">{payload.triage.level.toUpperCase()}</span>
                    </div>
                    <p className="message-text" style={{ marginTop: '0.5rem' }}>{payload.triage.reason}</p>
                </div>
            )}
        </div>
    );
}

export default function Diagnosis() {
    const [messages, setMessages] = useState([initialAssistantMessage]);
    const [input, setInput] = useState('');
    const [pendingImage, setPendingImage] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');

    const fileInputRef = useRef(null);
    const messagesRef = useRef(null);
    const sendLockRef = useRef(false);

    useEffect(() => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [messages, isSending]);

    const handleImageSelect = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file.');
            return;
        }

        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            setError('Image must be below 4 MB.');
            return;
        }

        try {
            const dataUrl = await fileToDataUrl(file);
            setPendingImage({
                name: file.name,
                type: file.type,
                size: file.size,
                dataUrl,
            });
            setError('');
        } catch (imageError) {
            setError(imageError.message || 'Failed to process selected image.');
        }
    };

    const handleSend = async () => {
        if (isSending || sendLockRef.current) return;

        sendLockRef.current = true;

        const text = input.trim();

        if (!text && !pendingImage) {
            setError('Type a symptom message or attach an image before sending.');
            return;
        }

        const imagePayload = pendingImage ? { ...pendingImage } : null;

        const userMessage = createMessage(
            'user',
            text || 'Image attached for symptom analysis.',
            imagePayload
                ? {
                      imageDataUrl: imagePayload.dataUrl,
                      imageName: imagePayload.name,
                  }
                : {}
        );

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setPendingImage(null);
        setIsSending(true);
        setError('');

        const historyPayload = messages.slice(-8).map((item) => ({
            role: item.role,
            content: item.text,
        }));

        try {

            const response = await fetch(DIAGNOSIS_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: text,
                    history: historyPayload,
                    image: imagePayload,
                }),
            });

            const rawResponse = await response.text();
            let payload = null;

            try {
                payload = rawResponse ? JSON.parse(rawResponse) : {};
            } catch {
                payload = null;
            }

            if (!response.ok) {
                throw new Error(payload?.error || `Diagnosis request failed with status ${response.status}`);
            }

            const assistantMessage = createMessage(
                'assistant',
                buildAssistantLeadText(payload),
                { payload }
            );

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (requestError) {
            const friendlyError = getDiagnosisRequestErrorMessage(requestError);

            const useOfflineFallback = friendlyError.includes('Cannot reach diagnosis API');

            if (useOfflineFallback) {
                const fallbackPayload = getLocalDiagnosisResponse({
                    message: text,
                    history: historyPayload,
                    imageName: imagePayload?.name || '',
                });

                setError('Backend is offline. Offline local diagnosis mode was used.');
                setMessages((prev) => [
                    ...prev,
                    createMessage('assistant', buildAssistantLeadText(fallbackPayload), { payload: fallbackPayload }),
                ]);
            } else {
                setError(friendlyError);
                setMessages((prev) => [
                    ...prev,
                    createMessage('assistant', friendlyError),
                ]);
            }
        } finally {
            setIsSending(false);
            sendLockRef.current = false;
        }
    };

    const handleInputKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            <header className="diagnosis-chat-header">
                <div className="container">
                    <h1>AI Diagnosis Chat</h1>
                    <p>Text your symptoms, attach an image, and receive triage guidance instantly.</p>
                </div>
            </header>

            <main className="container diagnosis-chat-page">
                <section className="card diagnosis-chat-wrapper">
                    <div className="diagnosis-chat-warning">
                        This is a preliminary AI triage assistant and not a replacement for professional medical diagnosis.
                    </div>

                    <div className="diagnosis-chat-messages" ref={messagesRef}>
                        {messages.map((message) => (
                            <div className={`message-row ${message.role}`} key={message.id}>
                                <article className="message-bubble">
                                    <p className="message-text">{message.text}</p>

                                    {message.imageDataUrl && (
                                        <img
                                            src={message.imageDataUrl}
                                            alt={message.imageName || 'Uploaded symptom'}
                                            className="message-image"
                                        />
                                    )}

                                    {message.role === 'assistant' && message.payload && (
                                        <AssistantAnalysis payload={message.payload} />
                                    )}

                                    <div className="message-meta">{toDisplayTime(message.timestamp)}</div>
                                </article>
                            </div>
                        ))}

                        {isSending && (
                            <div className="message-row assistant">
                                <article className="message-bubble">
                                    <div>
                                        <span className="typing-dot"></span>
                                        <span className="typing-dot"></span>
                                        <span className="typing-dot"></span>
                                    </div>
                                    <p className="message-text" style={{ marginTop: '0.4rem' }}>
                                        Analyzing your symptoms...
                                    </p>
                                </article>
                            </div>
                        )}
                    </div>

                    <div className="diagnosis-chat-composer">
                        {pendingImage && (
                            <div className="pending-image">
                                <img src={pendingImage.dataUrl} alt={pendingImage.name} />
                                <div className="pending-image-bar">
                                    <span>{pendingImage.name}</span>
                                    <button
                                        type="button"
                                        className="diagnosis-action-btn danger"
                                        onClick={() => setPendingImage(null)}
                                        disabled={isSending}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        )}

                        <textarea
                            className="diagnosis-input"
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            onKeyDown={handleInputKeyDown}
                            placeholder="Example: I have fever for 2 days, dry cough, and chest tightness."
                            disabled={isSending}
                        />

                        <div className="composer-actions">
                            <div className="composer-actions-left">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleImageSelect}
                                />
                                <button
                                    type="button"
                                    className="diagnosis-action-btn secondary"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isSending}
                                >
                                    Attach Image
                                </button>
                            </div>
                            <div className="composer-actions-right">
                                <button
                                    type="button"
                                    className="diagnosis-action-btn primary"
                                    onClick={handleSend}
                                    disabled={isSending}
                                >
                                    {isSending ? 'Analyzing...' : 'Send'}
                                </button>
                            </div>
                        </div>

                        {error && <p className="diagnosis-error">{error}</p>}
                    </div>
                </section>
            </main>

            <BottomNav />
        </>
    );
}