import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import {
  ShieldAlert, Activity, Building2, ClipboardList,
  BookOpen, HardHat, MessageSquare, CloudRain,
} from 'lucide-react';

import SafetyMonitor from './components/SafetyMonitor';
import CrackDetection from './components/CrackDetection';
import Valuation from './components/Valuation';
import ProjectPlanner from './components/ProjectPlanner';
import KnowledgeBase from './components/KnowledgeBase';
import ConstructionChatbot from './components/ConstructionChatbot';
import DailySiteAssistant from './components/DailySiteAssistant';
import WeatherAdvisor from './components/WeatherAdvisor';

const navLinkStyle = ({ isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  borderRadius: '0.5rem',
  color: isActive ? '#fff' : '#94a3b8',
  background: isActive ? '#f97316' : 'transparent',
  textDecoration: 'none',
  fontWeight: 500,
});

function App() {
  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar">
          <div className="brand">
            <HardHat size={32} color="#f97316" />
            <h2>Construct<span className="text-orange">AI</span></h2>
          </div>
          <nav className="nav">
            <NavLink to="/" style={navLinkStyle}>
              <ShieldAlert size={18} /> Safety Monitor
            </NavLink>
            <NavLink to="/cracks" style={navLinkStyle}>
              <Activity size={18} /> Crack Detection
            </NavLink>
            <NavLink to="/valuation" style={navLinkStyle}>
              <Building2 size={18} /> Real Estate Valuation
            </NavLink>
            <NavLink to="/planner" style={navLinkStyle}>
              <ClipboardList size={18} /> Project Planner
            </NavLink>
            <NavLink to="/knowledge" style={navLinkStyle}>
              <BookOpen size={18} /> Knowledge Base
            </NavLink>
            <NavLink to="/chatbot" style={navLinkStyle}>
              <MessageSquare size={18} /> Chatbot
            </NavLink>
            <NavLink to="/assistant" style={navLinkStyle}>
              <HardHat size={18} /> Daily Site Assistant
            </NavLink>
            <NavLink to="/weather" style={navLinkStyle}>
              <CloudRain size={18} /> Weather Advisor
            </NavLink>
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<SafetyMonitor />} />
            <Route path="/cracks" element={<CrackDetection />} />
            <Route path="/valuation" element={<Valuation />} />
            <Route path="/planner" element={<ProjectPlanner />} />
            <Route path="/knowledge" element={<KnowledgeBase />} />
            <Route path="/chatbot" element={<ConstructionChatbot />} />
            <Route path="/assistant" element={<DailySiteAssistant />} />
            <Route path="/weather" element={<WeatherAdvisor />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
