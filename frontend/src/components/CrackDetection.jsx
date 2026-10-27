import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { List, Badge, ErrorBox } from './ui';

export default function CrackDetection() {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
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
    try {
      const response = await api.post('/api/crack-detection', formData);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError('Crack analysis failed. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Structural Crack Diagnosis</h1>
      <p className="subtitle">
        AI assistance for early inspection - not a replacement for an engineer.
      </p>

      <form className="form" onSubmit={handleSubmit}>
        <textarea
          className="input"
          placeholder="Crack location / structural member (beam, column, wall...)"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <span className="label">Crack photo</span>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Diagnosing...' : 'Analyze Crack'}
        </button>
      </form>

      <ErrorBox message={error} />

      {result && (
        <div className="card">
          <h3>Diagnosis</h3>
          <p><strong>Type:</strong> {result.crack_type}</p>
          <p><strong>Severity:</strong> <Badge value={result.severity} /></p>
          <p>{result.summary}</p>
          <div className="grid-2">
            <div>
              <h3>Probable Causes</h3>
              <List items={result.probable_causes} />
              <h3>Risks</h3>
              <List items={result.risks} />
            </div>
            <div>
              <h3>Repair Methods</h3>
              <List items={result.repair_methods} />
              <h3>Preventive Measures</h3>
              <List items={result.preventive_measures} />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
