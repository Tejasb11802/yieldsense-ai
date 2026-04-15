import React, { useState } from 'react';

const API = 'http://127.0.0.1:5000';

const DEFAULT_PARAMS = {
  oxide_thickness_nm: 100.0,
  litho_cd_nm: 65.0,
  etch_rate_aps: 500.0,
  deposition_rate_nm: 200.0,
  implant_dose: 10000000000000,
  anneal_temp_c: 900.0,
  particle_count: 5.0,
  alignment_error_nm: 3.0,
};

const FIELD_LABELS = {
  oxide_thickness_nm: 'Oxide Thickness (nm)',
  litho_cd_nm: 'Litho Critical Dimension (nm)',
  etch_rate_aps: 'Etch Rate (Å/min)',
  deposition_rate_nm: 'Deposition Rate (nm/min)',
  implant_dose: 'Implant Dose (ions/cm²)',
  anneal_temp_c: 'Anneal Temperature (°C)',
  particle_count: 'Particle Count (per wafer)',
  alignment_error_nm: 'Alignment Error (nm)',
};

const SCENARIOS = {
  'Healthy Lot': {
    oxide_thickness_nm: 100,
    litho_cd_nm: 65,
    etch_rate_aps: 500,
    deposition_rate_nm: 200,
    implant_dose: 10000000000000,
    anneal_temp_c: 900,
    particle_count: 4,
    alignment_error_nm: 2,
  },
  'High Particle Count': {
    oxide_thickness_nm: 101,
    litho_cd_nm: 65,
    etch_rate_aps: 498,
    deposition_rate_nm: 200,
    implant_dose: 10000000000000,
    anneal_temp_c: 900,
    particle_count: 28,
    alignment_error_nm: 3,
  },
  'CD Variation Issue': {
    oxide_thickness_nm: 100,
    litho_cd_nm: 74,
    etch_rate_aps: 500,
    deposition_rate_nm: 200,
    implant_dose: 10000000000000,
    anneal_temp_c: 900,
    particle_count: 5,
    alignment_error_nm: 3,
  },
};

export default function Predict() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const loadScenario = (name) => {
    setParams(SCENARIOS[name]);
    setResult(null);
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert('Could not connect to backend. Make sure uvicorn is running on port 5000.');
    }
    setLoading(false);
  };

  const getRiskClass = (risk) => {
    if (risk === 'LOW') return 'low-risk';
    if (risk === 'MEDIUM') return 'medium-risk';
    return 'high-risk';
  };

  return (
    <div>
      <div className="page-header">
        <h1>Yield Predictor</h1>
        <p>Enter FDC process parameters to predict yield before end-of-line testing.</p>
      </div>

      <div className="api-note">
        Model accuracy: MAE ~1.74% | R² 0.943 — predicts yield from inline process parameters,
        enabling early intervention before costly end-of-line test failures.
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
        {Object.keys(SCENARIOS).map(name => (
          <button
            key={name}
            onClick={() => loadScenario(name)}
            style={{
              background: '#334155', border: 'none', borderRadius: 8,
              padding: '8px 16px', color: '#94a3b8', cursor: 'pointer',
              fontSize: 13
            }}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="predict-grid">
        <div className="form-card">
          <div className="form-title">Process Parameters (FDC Readings)</div>
          {Object.entries(FIELD_LABELS).map(([key, label]) => (
            <div className="form-group" key={key}>
              <label>{label}</label>
              <input
                type="number"
                value={params[key]}
                onChange={e => handleChange(key, e.target.value)}
                step="any"
              />
            </div>
          ))}
          <button
            className="predict-btn"
            onClick={handlePredict}
            disabled={loading}
          >
            {loading ? 'Predicting...' : 'Predict Yield'}
          </button>
        </div>

        <div className="result-card">
          {!result ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚙️</div>
              <div>Enter process parameters and click Predict Yield</div>
              <div style={{ marginTop: 8, fontSize: 12 }}>
                Or load a scenario from the buttons above
              </div>
            </div>
          ) : (
            <div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
                  Predicted Yield
                </div>
                <div className={`result-yield ${getRiskClass(result.risk_level)}`}>
                  {result.predicted_yield}%
                </div>
                <span className={`risk-badge ${result.risk_level}`}>
                  {result.risk_level} RISK
                </span>
              </div>
              <div className="result-action">
                <strong style={{ color: '#94a3b8' }}>Recommended Action:</strong>
                <br />
                {result.recommended_action}
              </div>
              <div style={{
                marginTop: 16, padding: '12px',
                background: '#0f172a', borderRadius: 8,
                fontSize: 12, color: '#64748b'
              }}>
                Model MAE: ±{result.model_mae}% &nbsp;|&nbsp; R²: {result.model_r2}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}