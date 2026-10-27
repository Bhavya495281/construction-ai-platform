import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { List, Badge, ErrorBox } from './ui';

export default function WeatherAdvisor() {
  const [activity, setActivity] = useState('Slab Concreting');
  const [weather, setWeather] = useState('Rainy');
  const [advice, setAdvice] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/weather-advisor', { activity, weather });
      setAdvice(res.data);
    } catch (err) {
      console.error(err);
      setError('Weather analysis failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Weather Advisor</h1>
      <p className="subtitle">GO / NO-GO guidance for weather-sensitive work.</p>

      <form className="form" onSubmit={handleSubmit}>
        <span className="label">Planned activity</span>
        <input className="input" value={activity}
          onChange={(e) => setActivity(e.target.value)} />
        <span className="label">Current / forecast weather</span>
        <select className="input" value={weather}
          onChange={(e) => setWeather(e.target.value)}>
          <option>Sunny</option>
          <option>Cloudy</option>
          <option>Rainy</option>
          <option>Heavy Rain</option>
          <option>Windy</option>
          <option>Extreme Heat</option>
          <option>Storm</option>
        </select>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Checking...' : 'Check Feasibility'}
        </button>
      </form>

      <ErrorBox message={error} />

      {advice && (
        <div className="card">
          <h3>Decision: <Badge value={advice.decision} /></h3>
          <p>{advice.reason}</p>
          <div className="grid-2">
            <div>
              <h3>Risks</h3>
              <List items={advice.risks} />
            </div>
            <div>
              <h3>Required Precautions</h3>
              <List items={advice.precautions} />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
