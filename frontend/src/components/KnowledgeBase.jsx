import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { List, ErrorBox } from './ui';

const CATEGORIES = ['Safety', 'Technique', 'SOP'];

export default function KnowledgeBase() {
  const [category, setCategory] = useState('Safety');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('category', category);
    formData.append('query', query);
    try {
      const res = await api.post('/api/knowledge', formData);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError('Knowledge request failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Construction Knowledge Base</h1>
      <p className="subtitle">Safety rules, techniques and SOP documents on demand.</p>

      <div className="tabs">
        {CATEGORIES.map((c) => (
          <button key={c} type="button"
            className={`tab ${category === c ? 'active' : ''}`}
            onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <textarea className="input" value={query} required
          placeholder="e.g. Tips for scaffolding / Draft an SOP for excavation"
          onChange={(e) => setQuery(e.target.value)} />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Ask Assistant'}
        </button>
      </form>

      <ErrorBox message={error} />

      {result && (
        <div className="card">
          <h3>{result.title}</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{result.content}</p>
          <h3>Key Points</h3>
          <List items={result.key_points} />
        </div>
      )}
    </motion.div>
  );
}
