import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts'
import Layout from '../components/Layout'
import { useData } from '../hooks/useData'
import { riskColor, RISK_LABEL_ID, RISK_COLORS } from '../utils/risk'

export default function PantauRamalan() {
  const { horizon, distribusiPrediksi, evaluasi } = useData()

  const bulanList = useMemo(
    () => [...new Set(horizon.map((d) => d.bulan_prediksi))].filter(Boolean),
    [horizon],
  )
  const [bulan, setBulan] = useState('')
  const bulanAktif = bulan || bulanList[0] || ''

  const rows = useMemo(() => {
    const order = { high: 0, medium: 1, low: 2 }
    return horizon
      .filter((d) => d.bulan_prediksi === bulanAktif)
      .sort((a, b) => order[a.prediksi_risk_label] - order[b.prediksi_risk_label] || b.final_score - a.final_score)
  }, [horizon, bulanAktif])

  const akurasi = useMemo(() => {
    const e = evaluasi.find((x) => x.bulan_prediksi === bulanAktif)
    return e ? (e.accuracy * 100).toFixed(1) : null
  }, [evaluasi, bulanAktif])

  return (
    <Layout title="PantauRamalan" subtitle="Prediksi risiko multi-horizon (Mei–Agustus 2026)">
      <div className="list-container">
        <h3><i className="fas fa-chart-column" /> Distribusi Prediksi per Bulan</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={distribusiPrediksi}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="bulan_prediksi" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="low" name="Aman" fill={RISK_COLORS.low} stackId="a" />
            <Bar dataKey="medium" name="Waspada" fill={RISK_COLORS.medium} stackId="a" />
            <Bar dataKey="high" name="Kritis" fill={RISK_COLORS.high} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="list-container" style={{ marginTop: 20 }}>
        <div className="toolbar">
          <h3><i className="fas fa-calendar-day" /> Detail Prediksi</h3>
          <div className="toolbar-actions">
            {akurasi && (
              <span className="akurasi-chip">
                <i className="fas fa-bullseye" /> Akurasi model: {akurasi}%
              </span>
            )}
            <select value={bulanAktif} onChange={(e) => setBulan(e.target.value)}>
              {bulanList.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Wilayah</th>
              <th>Prediksi Risiko</th>
              <th>Faktor Dominan</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d, i) => (
              <tr key={d.wilayah}>
                <td>{i + 1}</td>
                <td><strong>{d.wilayah}</strong></td>
                <td>
                  <span className="risk-badge" style={{ background: riskColor(d.prediksi_risk_label) }}>
                    {RISK_LABEL_ID[d.prediksi_risk_label] || d.prediksi_risk_label}
                  </span>
                </td>
                <td className="muted-cell">{d.faktor_dominan}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="section-note" style={{ marginTop: 12 }}>
          <i className="fas fa-circle-info" /> Semakin jauh horizon prediksi, semakin rendah akurasi
          model. Gunakan prediksi jangka pendek sebagai acuan utama.
        </p>
      </div>
    </Layout>
  )
}
