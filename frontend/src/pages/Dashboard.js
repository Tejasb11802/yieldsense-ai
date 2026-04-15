import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

const API = 'http://127.0.0.1:5000';

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [trend, setTrend] = useState([]);
  const [pareto, setPareto] = useState([]);
  const [importance, setImportance] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/kpis`).then(r => r.json()).then(setKpis);
    fetch(`${API}/api/yield-trend?limit=50`).then(r => r.json()).then(setTrend);
    fetch(`${API}/api/pareto`).then(r => r.json()).then(setPareto);
    fetch(`${API}/api/feature-importance`).then(r => r.json()).then(setImportance);
  }, []);

  const COLORS = ['#f87171', '#fbbf24', '#34d399', '#38bdf8', '#818cf8'];

  return (
    <div>
      <div className="page-header">
        <h1>Wafer Yield Intelligence Dashboard</h1>
        <p>Real-time semiconductor manufacturing analytics — Chandler, AZ facility</p>
      </div>

      {kpis ? (
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Total Lots</div>
            <div className="kpi-value">{kpis.total_lots}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Avg Yield</div>
            <div className="kpi-value green">{kpis.avg_yield}%</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Pass Rate</div>
            <div className="kpi-value green">{kpis.pass_rate}%</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Failed Lots</div>
            <div className="kpi-value red">{kpis.failed_lots}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Best Yield</div>
            <div className="kpi-value">{kpis.best_yield}%</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Worst Yield</div>
            <div className="kpi-value yellow">{kpis.worst_yield}%</div>
          </div>
        </div>
      ) : <div className="loading">Loading KPIs...</div>}

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">Yield Trend — Last 50 Lots</div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="lot_id"
                tick={{ fill: '#64748b', fontSize: 10 }}
                interval={9}
              />
              <YAxis
                domain={[60, 100]}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line
                type="monotone"
                dataKey="yield_pct"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                name="Yield %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">Failure Mode Pareto</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pareto} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="failure_mode"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                width={130}
              />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              />
              <Bar dataKey="count" name="Count" radius={[0, 4, 4, 0]}>
                {pareto.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-title">Top Process Parameters Driving Yield Loss</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={importance.slice(0, 6)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="feature"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              width={160}
            />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            />
            <Bar dataKey="importance" fill="#818cf8" radius={[0, 4, 4, 0]} name="Importance" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}