import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { useData } from '../hooks/useData'
import { riskColor, RISK_LABEL_ID } from '../utils/risk'

export default function PantauRawan() {
  const { current, topWilayah } = useData()
  const [filter, setFilter] = useState('all')
  const [sortDesc, setSortDesc] = useState(true)

  const baris = useMemo(() => {
    let arr = [...current]
    if (filter !== 'all') arr = arr.filter((d) => d.risk_label === filter)
    arr.sort((a, b) => (sortDesc ? b.final_score - a.final_score : a.final_score - b.final_score))
    return arr
  }, [current, filter, sortDesc])

  return (
    <Layout title="PantauRawan" subtitle="Wilayah prioritas berisiko tinggi">
      <div className="grid-2">
        <div className="list-container" style={{ gridColumn: '1 / -1' }}>
          <div className="toolbar">
            <h3><i className="fas fa-exclamation-triangle" /> Prioritas Bulan Ini</h3>
            <div className="toolbar-actions">
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">Semua Risiko</option>
                <option value="high">Kritis</option>
                <option value="medium">Waspada</option>
                <option value="low">Aman</option>
              </select>
              <button className="btn-ghost" onClick={() => setSortDesc((s) => !s)}>
                <i className={`fas fa-sort-amount-${sortDesc ? 'down' : 'up'}`} /> Skor
              </button>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Wilayah</th>
                <th>Risiko</th>
                <th>Prob. Waspada</th>
                <th>Faktor Dominan</th>
              </tr>
            </thead>
            <tbody>
              {baris.map((d, i) => (
                <tr key={d.wilayah}>
                  <td>{i + 1}</td>
                  <td><strong>{d.wilayah}</strong></td>
                  <td>
                    <span className="risk-badge" style={{ background: riskColor(d.risk_label) }}>
                      {RISK_LABEL_ID[d.risk_label] || d.risk_label}
                    </span>
                  </td>
                  <td>{Number(d.prob_waspada).toFixed(1)}%</td>
                  <td className="muted-cell">{d.faktor_dominan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="list-container" style={{ gridColumn: '1 / -1' }}>
          <h3><i className="fas fa-clock-rotate-left" /> Rawan Struktural (Historis 2018–2026)</h3>
          <p className="section-note">
            Wilayah yang paling sering masuk kategori high-risk sepanjang sejarah — indikator risiko
            jangka panjang, bukan sesaat.
          </p>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Wilayah</th>
                <th>Jumlah High-Risk</th>
                <th>Frekuensi</th>
              </tr>
            </thead>
            <tbody>
              {topWilayah.map((d, i) => (
                <tr key={d.wilayah}>
                  <td>{i + 1}</td>
                  <td><strong>{d.wilayah}</strong></td>
                  <td>{d.jumlah_high_risk} / {d.total_observasi}</td>
                  <td>
                    <div className="bar-wrap">
                      <div className="bar-fill" style={{ width: `${d.persen_high_risk}%` }} />
                      <span>{d.persen_high_risk}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
