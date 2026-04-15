import React, { useEffect, useState } from 'react';

const API = 'http://127.0.0.1:5000';

export default function Lots() {
  const [lots, setLots] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/lots?limit=100`)
      .then(r => r.json())
      .then(data => {
        setLots(data.lots);
        setTotal(data.total);
        setLoading(false);
      });
  }, []);

  const filtered = filter === 'ALL'
    ? lots
    : lots.filter(l => l.pass_fail === filter);

  return (
    <div>
      <div className="page-header">
        <h1>Lot Explorer</h1>
        <p>Browse all {total} wafer lots — click any lot to see full process parameters.</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {['ALL', 'PASS', 'FAIL'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? '#1d4ed8' : '#334155',
              border: 'none',
              borderRadius: 8,
              padding: '8px 20px',
              color: 'white',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {f} {f === 'ALL' ? `(${total})` : `(${lots.filter(l => l.pass_fail === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading lots...</div>
      ) : (
        <div className="table-card">
          <div className="table-header">
            Showing {filtered.length} lots
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Lot ID</th>
                  <th>Date</th>
                  <th>Yield %</th>
                  <th>Status</th>
                  <th>Failure Mode</th>
                  <th>Particles</th>
                  <th>Litho CD (nm)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(lot => (
                  <tr key={lot.lot_id}>
                    <td style={{ color: '#38bdf8', fontWeight: 600 }}>
                      {lot.lot_id}
                    </td>
                    <td>{lot.date}</td>
                    <td style={{
                      color: lot.yield_pct >= 85 ? '#34d399' :
                             lot.yield_pct >= 75 ? '#fbbf24' : '#f87171',
                      fontWeight: 600
                    }}>
                      {lot.yield_pct}%
                    </td>
                    <td>
                      <span className={lot.pass_fail === 'PASS' ? 'badge-pass' : 'badge-fail'}>
                        {lot.pass_fail}
                      </span>
                    </td>
                    <td style={{ color: lot.failure_mode === 'None' ? '#64748b' : '#fbbf24' }}>
                      {lot.failure_mode}
                    </td>
                    <td>{lot.particle_count}</td>
                    <td>{lot.litho_cd_nm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}