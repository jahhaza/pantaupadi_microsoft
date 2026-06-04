import { useMemo, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts'
import Layout from '../components/Layout'
import { useData } from '../hooks/useData'
import { RISK_COLORS } from '../utils/risk'

const NAMA_BULAN = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export default function PantauTrend() {
  const { risikoPerTahun, trenTahunan, bulanRawan, historis } = useData()

  const dataBulan = bulanRawan.map((d) => ({
    bulan: NAMA_BULAN[d.bulan] || d.bulan,
    persen: d.persen_high_risk,
  }))

  const wilayahList = useMemo(
    () => [...new Set(historis.map((d) => d.wilayah))].filter(Boolean).sort(),
    [historis],
  )
  const [wilayah, setWilayah] = useState('')
  const wAktif = wilayah || wilayahList[0] || ''

  const trenWilayah = useMemo(() => {
    return historis
      .filter((d) => d.wilayah === wAktif)
      .sort((a, b) => (a.tahun - b.tahun) || (a.bulan - b.bulan))
      .map((d) => ({
        periode: `${NAMA_BULAN[d.bulan] || d.bulan} ${String(d.tahun).slice(2)}`,
        climate: Number(d.climate_score),
        final: Number(d.final_score),
        hth: Number(d.HTH_hari),
      }))
  }, [historis, wAktif])

  return (
    <Layout title="PantauTrend" subtitle="Analisis tren historis 2018–2026">
      <div className="list-container">
        <div className="toolbar">
          <h3><i className="fas fa-location-dot" /> Tren Spesifik per Wilayah</h3>
          <select value={wAktif} onChange={(e) => setWilayah(e.target.value)}>
            {wilayahList.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trenWilayah}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="periode" tick={{ fontSize: 10 }} interval={5} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="climate" name="Skor Iklim" stroke="#2e7d32" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="final" name="Skor Final" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="hth" name="HTH (hari)" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className="section-note">
          <i className="fas fa-circle-info" /> Pola skor risiko <strong>{wAktif}</strong> dari Januari
          2018 hingga 2026 — untuk membedakan kondisi anomali dari pola berulang.
        </p>
      </div>
      <div className="list-container" style={{ marginTop: 20 }}>
        <h3><i className="fas fa-chart-column" /> Komposisi Risiko per Tahun (%)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={risikoPerTahun}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="tahun" />
            <YAxis unit="%" />
            <Tooltip />
            <Legend />
            <Bar dataKey="low" name="Aman" stackId="a" fill={RISK_COLORS.low} />
            <Bar dataKey="medium" name="Waspada" stackId="a" fill={RISK_COLORS.medium} />
            <Bar dataKey="high" name="Kritis" stackId="a" fill={RISK_COLORS.high} />
          </BarChart>
        </ResponsiveContainer>
        <p className="section-note">
          <i className="fas fa-arrow-trend-down" /> Tren membaik: proporsi wilayah high-risk turun
          signifikan dari 2018 (51%) menuju 2026.
        </p>
      </div>

      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="list-container">
          <h3><i className="fas fa-temperature-half" /> Tren Tekanan Iklim Tahunan</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trenTahunan}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tahun" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avg_climate_score" name="Skor Iklim" stroke="#2e7d32" strokeWidth={2} />
              <Line type="monotone" dataKey="avg_final_score" name="Skor Final" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="list-container">
          <h3><i className="fas fa-calendar-days" /> Pola Musiman Bulan Rawan</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dataBulan}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="bulan" />
              <YAxis unit="%" />
              <Tooltip />
              <Bar dataKey="persen" name="% High-Risk" fill="#fbbf24" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="section-note">
            <i className="fas fa-triangle-exclamation" /> Puncak kerawanan terjadi pada Mei–Juni
            (±50% wilayah high-risk). Waktu kritis untuk antisipasi dini.
          </p>
        </div>
      </div>
    </Layout>
  )
}
