import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  Bot,
  User,
  AlertCircle
} from 'lucide-react';

const MediChainChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm MedLink AI, your AI-powered medical assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const API_BASE_URL = 'http://localhost:8000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text, sender, audioUrl = null) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date().toISOString(),
      audioUrl
    };

    setMessages(prev => [...prev, newMessage]);

    if (sender === 'bot' && audioUrl) {
      setTimeout(() => playAudio(audioUrl), 500);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage(userMessage, 'user');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          user_id: `user-${Date.now()}`,
          language: 'en'
        })
      });

      if (!response.ok) throw new Error('Server error');

      const data = await response.json();
      addMessage(data.text_response, 'bot', data.audio_file_path);
    } catch (err) {
      console.error(err);
      addMessage(
        'Sorry, I encountered an error. Please try again.',
        'bot'
      );
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = e =>
        audioChunksRef.current.push(e.data);

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch {
      addMessage('Microphone access denied.', 'bot');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceMessage = async (audioBlob) => {
    setIsLoading(true);
    setIsTyping(true);
    addMessage('Voice message sent', 'user');

    try {
      const formData = new FormData();
      formData.append('file', audioBlob);

      const response = await fetch(`${API_BASE_URL}/voice-input`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error();

      const data = await response.json();

      if (data.transcribed_text) {
        addMessage(`Transcribed: "${data.transcribed_text}"`, 'user');
      }

      addMessage(data.text_response, 'bot', data.audio_file_path);
    } catch {
      addMessage('Voice processing failed.', 'bot');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const playAudio = async (filename) => {
    try {
      const audio = new Audio(`${API_BASE_URL}/audio/${filename}`);
      await audio.play();
    } catch (err) {
      console.error(err);
    }
  };

  const isEmergencyMessage = (text) => {
    const keywords = [
      'emergency',
      'urgent',
      'severe',
      'critical',
      'chest pain',
      'difficulty breathing',
      'stroke',
      'heart attack'
    ];
    return keywords.some(k => text.toLowerCase().includes(k));
  };

  return (
    <div>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)}>
          <MessageCircle />
        </button>
      )}

      {isOpen && (
        <div>
          {/* Header */}
          <div>
            <div>
              <Bot />
              <div>
                <h3>MedLink AI</h3>
                <p>Medical Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <X />
            </button>
          </div>

          {/* Messages */}
          <div>
            {messages.map(msg => (
              <div key={msg.id}>
                <div>
                  {msg.sender === 'user' ? <User /> : <Bot />}
                </div>

                <div>
                  {isEmergencyMessage(msg.text) && msg.sender === 'bot' && (
                    <div>
                      <AlertCircle />
                      <span>MEDICAL ALERT</span>
                    </div>
                  )}

                  <p>{msg.text}</p>

                  {msg.audioUrl && (
                    <button onClick={() => playAudio(msg.audioUrl)}>
                      <Volume2 /> Replay Audio
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div>
                <Bot />
                <span>Typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div>
            <textarea
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              placeholder="Describe your symptoms..."
            />

            <button onClick={isRecording ? stopRecording : startRecording}>
              {isRecording ? <MicOff /> : <Mic />}
            </button>

            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
            >
              <Send />
            </button>

            <p>
              ⚠️ This is for informational purposes only. Consult healthcare
              professionals for medical advice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediChainChatbot;
