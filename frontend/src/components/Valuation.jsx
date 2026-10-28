import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { ErrorBox, inr, show } from './ui';

export default function Valuation() {
  const [form, setForm] = useState({
    location: '',
    area: '',
    property_type: 'Residential',
    building_age: '',
    amenities: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));
    try {
      const response = await api.post('/api/real-estate-valuation', formData);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError('Valuation failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Real Estate Estimator (INR)</h1>
      <p className="subtitle">Indicative market insight, not an official valuation.</p>

      <form className="form" onSubmit={handleSubmit}>
        <div>
          <div className="label">Location / City *</div>
          <input
            className="input"
            name="location"
            placeholder="e.g. Indore, Bhopal, Mumbai, Bengaluru"
            value={form.location}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <div className="label">Area (Sq. Ft.) *</div>
          <input
            className="input"
            name="area"
            type="number"
            min="100"
            max="1000000"
            placeholder="e.g. 1200"
            value={form.area}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <div className="label">Building Age (years)</div>
          <input
            className="input"
            name="building_age"
            type="number"
            min="0"
            max="100"
            placeholder="e.g. 5 (0 for new construction)"
            value={form.building_age}
            onChange={handleChange}
          />
        </div>

        <div>
          <div className="label">Property Type</div>
          <select
            className="input"
            name="property_type"
            value={form.property_type}
            onChange={handleChange}
          >
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Plot / Land">Plot / Land</option>
            <option value="Industrial">Industrial</option>
          </select>
        </div>

        <div>
          <div className="label">Amenities & Features</div>
          <textarea
            className="input"
            name="amenities"
            placeholder="e.g. Covered car parking, automatic lift, rainwater harvesting, 24/7 security..."
            value={form.amenities}
            onChange={handleChange}
          />
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Calculating Valuation...' : 'Calculate Property Value'}
        </button>
      </form>

      <ErrorBox message={error} />

      {result && (
        <div className="card">
          <h3>Valuation Analysis (Indian Real Estate Market)</h3>
          <table className="table">
            <tbody>
              <tr>
                <td><strong>Estimated Market Range</strong></td>
                <td><strong>{inr(result.estimated_value_min)} - {inr(result.estimated_value_max)}</strong></td>
              </tr>
              <tr>
                <td>Average Price per Sq. Ft.</td>
                <td>{inr(result.price_per_sqft)} / sq.ft</td>
              </tr>
              <tr>
                <td>Expected Monthly Rental Yield</td>
                <td>{inr(result.monthly_rent)} / month</td>
              </tr>
              <tr>
                <td>Estimated Annual ROI</td>
                <td><span className="badge go">{Number(result.roi_percent || 0).toFixed(1)}%</span></td>
              </tr>
              <tr>
                <td>Appreciation Outlook</td>
                <td>{show(result.appreciation_outlook)}</td>
              </tr>
            </tbody>
          </table>
          <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>{result.summary}</p>
        </div>
      )}
    </motion.div>
  );
}
