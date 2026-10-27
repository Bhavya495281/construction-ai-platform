import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { List, ErrorBox, asArray, show, inr } from './ui';

export default function ProjectPlanner() {
  const [desc, setDesc] = useState('');
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('desc', desc);
    try {
      const res = await api.post('/api/project-planner', formData);
      setPlan(res.data);
    } catch (err) {
      console.error(err);
      setError('Project Planner failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const m = (plan && plan.materials) || {};
  const c = (plan && plan.cost) || {};
  const rows = [
    ['Cement (bags)', m.cement_bags],
    ['Sand (cft)', m.sand_cft],
    ['Aggregate (cft)', m.aggregate_cft],
    ['Steel (kg)', m.steel_kg],
    ['Bricks (nos)', m.bricks],
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Construction Project Planner</h1>
      <p className="subtitle">Materials, cost in INR and a phase-wise schedule.</p>

      <form className="form" onSubmit={handleSubmit}>
        <textarea
          className="input"
          placeholder="e.g. 30x40 ft plot, G+1 residential house, Bhopal"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
        />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Planning...' : 'Generate Plan'}
        </button>
      </form>

      <ErrorBox message={error} />

      {plan && (
        <>
          <div className="card"><p>{plan.summary}</p></div>
          <div className="grid-2">
            <div className="card">
              <h3>Material Estimator</h3>
              <table className="table">
                <tbody>
                  {rows.map(([name, qty]) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>{Number(qty || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card">
              <h3>Cost Estimator (INR)</h3>
              <table className="table">
                <tbody>
                  <tr><td>Materials</td><td>{inr(c.materials)}</td></tr>
                  <tr><td>Labour</td><td>{inr(c.labour)}</td></tr>
                  <tr><td>Finishing</td><td>{inr(c.finishing)}</td></tr>
                  <tr><th>Total</th><th>{inr(c.total)}</th></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <h3>Time Schedule</h3>
            {asArray(plan.schedule).length === 0 && <p>No schedule returned.</p>}
            {asArray(plan.schedule).map((s, i) => (
              <div key={i}>
                <strong>
                  {typeof s === 'object' ? show(s.phase) : show(s)}
                  {typeof s === 'object' && s.duration ? ` (${show(s.duration)})` : ''}
                </strong>
                {typeof s === 'object' && <List items={s.tasks} />}
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
