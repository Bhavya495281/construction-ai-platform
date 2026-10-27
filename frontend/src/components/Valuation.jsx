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
        <input className="input" name="location" placeholder="Location / City"
          value={form.location} onChange={handleChange} required />
        <input className="input" name="area" type="number" placeholder="Area (Sq. Ft.)"
          value={form.area} onChange={handleChange} required />
        <input className="input" name="building_age" type="number"
          placeholder="Building age (years)"
          value={form.building_age} onChange={handleChange} />
        <select className="input" name="property_type"
          value={form.property_type} onChange={handleChange}>
          <option>Residential</option>
          <option>Commercial</option>
          <option>Plot / Land</option>
        </select>
        <textarea className="input" name="amenities"
          placeholder="Amenities (parking, lift, garden...)"
          value={form.amenities} onChange={handleChange} />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate Value'}
        </button>
      </form>

      <ErrorBox message={error} />

      {result && (
        <div className="card">
          <h3>Valuation Result</h3>
          <table className="table">
            <tbody>
              <tr>
                <td>Estimated value range</td>
                <td>{inr(result.estimated_value_min)} - {inr(result.estimated_value_max)}</td>
              </tr>
              <tr><td>Price per sq. ft.</td><td>{inr(result.price_per_sqft)}</td></tr>
              <tr><td>Monthly rent potential</td><td>{inr(result.monthly_rent)}</td></tr>
              <tr><td>ROI (per year)</td><td>{Number(result.roi_percent || 0)} %</td></tr>
              <tr><td>Appreciation outlook</td><td>{show(result.appreciation_outlook)}</td></tr>
            </tbody>
          </table>
          <p>{result.summary}</p>
        </div>
      )}
    </motion.div>
  );
}
