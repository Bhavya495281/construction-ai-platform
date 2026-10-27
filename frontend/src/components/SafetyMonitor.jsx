import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { List, Badge, ErrorBox } from './ui';

export default function SafetyMonitor() {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [doc, setDoc] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('text', text);
    if (image) formData.append('image', image);
    if (doc) formData.append('document', doc);
    try {
      const res = await api.post('/api/safety-monitor', formData);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError('Safety analysis failed. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Site Safety Monitor</h1>
      <p className="subtitle">Upload a site photo and/or describe the situation.</p>

      <form className="form" onSubmit={handleSubmit}>
        <textarea
          className="input"
          placeholder="Describe the site context or what you observe..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <span className="label">Site photo (optional)</span>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        <span className="label">Safety report (optional)</span>
        <input type="file" onChange={(e) => setDoc(e.target.files[0])} />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Analyzing Safety...' : 'Run Safety Analysis'}
        </button>
      </form>

      <ErrorBox message={error} />

      {result && (
        <div className="card">
          <h3>Analysis Results</h3>
          <p><strong>Risk Level:</strong> <Badge value={result.risk_level} /></p>
          <p>{result.summary}</p>
          <div className="grid-2">
            <div>
              <h3>Hazards</h3>
              <List items={result.hazards} />
              <h3>Missing PPE</h3>
              <List items={result.missing_ppe} />
            </div>
            <div>
              <h3>Recommended PPE</h3>
              <List items={result.recommended_ppe} />
              <h3>Standards</h3>
              <List items={result.osha_standards} />
              <h3>Corrective Actions</h3>
              <List items={result.corrective_actions} />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
