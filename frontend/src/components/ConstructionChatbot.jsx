import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { asArray, show } from './ui';

export default function ConstructionChatbot() {
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);

  const send = async (question) => {
    if (!question.trim()) return;
    setConversation((prev) => [...prev, { role: 'user', text: question }]);
    setLoading(true);
    setQuery('');
    try {
      const res = await api.post('/api/chatbot', { query: question });
      setConversation((prev) => [...prev, {
        role: 'ai',
        text: show(res.data.reply),
        suggestions: asArray(res.data.action_suggestions),
      }]);
    } catch (err) {
      console.error(err);
      setConversation((prev) => [...prev, {
        role: 'ai',
        text: 'Sorry, I encountered an error. Please try again.',
        suggestions: [],
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(query);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 800 }}>
      <h1>Construction Knowledge Chatbot</h1>
      <div className="chat-box">
        {conversation.length === 0 && (
          <p className="subtitle">Ask about cement grades, curing time, safety rules...</p>
        )}
        {conversation.map((c, i) => (
          <div
            key={i}
            style={{ margin: '0.6rem 0', textAlign: c.role === 'user' ? 'right' : 'left' }}
          >
            <span className={`bubble ${c.role}`}>{c.text}</span>
            <div>
              {asArray(c.suggestions).map((s, j) => (
                <button key={j} className="chip" onClick={() => send(show(s))}>
                  {show(s)}
                </button>
              ))}
            </div>
          </div>
        ))}
        {loading && <p className="subtitle">Thinking...</p>}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask technical queries..."
        />
        <button className="btn" type="submit" disabled={loading}>Send</button>
      </form>
    </motion.div>
  );
}
