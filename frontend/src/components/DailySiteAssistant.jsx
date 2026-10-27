import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { List, ErrorBox } from './ui';

export default function DailySiteAssistant() {
  const [activity, setActivity] = useState('Concreting');
  const [labour, setLabour] = useState(10);
  const [condition, setCondition] = useState('Normal');
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/site-assistant', {
        activity: activity,
        labour_count: parseInt(labour, 10) || 1,
        site_condition: condition,
      });
      setPlan(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to generate the daily plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Daily Site Assistant</h1>
      <p className="subtitle">Turn today's inputs into a task list with safety checks.</p>

      <form className="form" onSubmit={handleSubmit}>
        <span className="label">Planned activity</span>
        <input className="input" value={activity}
          onChange={(e) => setActivity(e.target.value)} />
        <span className="label">Labour count</span>
        <input className="input" type="number" min="1" value={labour}
          onChange={(e) => setLabour(e.target.value)} />
        <span className="label">Site condition</span>
        <select className="input" value={condition}
          onChange={(e) => setCondition(e.target.value)}>
          <option>Normal</option>
          <option>Muddy</option>
          <option>Congested</option>
          <option>Night work</option>
        </select>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Generating...' : "Generate Today's Plan"}
        </button>
      </form>

      <ErrorBox message={error} />

      {plan && (
        <div className="card">
          <h3>Today's Execution Plan</h3>
          <div className="grid-2">
            <div>
              <h3>Tasks</h3>
              <List items={plan.tasks} />
              <h3>Materials and Equipment</h3>
              <List items={plan.materials_equipment} />
            </div>
            <div>
              <h3>Safety Checks</h3>
              <List items={plan.safety_checks} />
              <h3>Risk Alerts</h3>
              <List items={plan.risk_alerts} />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
