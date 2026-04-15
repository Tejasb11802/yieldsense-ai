import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import Lots from './pages/Lots';
import './styles.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <span className="nav-icon">⚙️</span>
            <span>YieldSense AI</span>
          </div>
          <div className="nav-links">
            <Link to="/">Dashboard</Link>
            <Link to="/predict">Yield Predictor</Link>
            <Link to="/lots">Lot Explorer</Link>
          </div>
          <div className="nav-badge">Microchip Technology</div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/lots" element={<Lots />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;