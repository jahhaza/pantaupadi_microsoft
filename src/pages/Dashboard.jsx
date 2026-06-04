import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from 'recharts'
import Layout from '../components/Layout'
import RiskMap from '../components/RiskMap'
import { useData } from '../hooks/useData'
import { hitungRisiko, riskColor, RISK_LABEL_ID, RISK_COLORS } from '../utils/risk'

export default function Dashboard() {
  const { current, distribusiPrediksi, faktorDominan, trenTahunan } = useData()

  const stats = useMemo(() => {
    if (!current.length) return null
    const r = hitungRisiko(current)
    const sorted = [...current].sort((a, b) => b.final_score - a.final_score)
    const avg = (current.reduce((a, b) => a + Number(b.final_score || 0), 0) / current.length).toFixed(1)
    return { ...r, sorted, avg, total: current.length }
  }, [current])

  const topFaktor = useMemo(
    () => faktorDominan.slice(0, 6).map((d) => ({
      faktor: d.faktor_dominan.length > 28 ? d.faktor_dominan.slice(0, 28) + '…' : d.faktor_dominan,
      jumlah: d.jumlah,
    })),
    [faktorDominan],
  )

  const miniTren = useMemo(
    () => trenTahunan.map((d) => ({ tahun: d.tahun, final: d.avg_final_score, iklim: d.avg_climate_score })),
    [trenTahunan],
  )

  if (!stats) return <Layout title="Dashboard" subtitle="Pusat kendali monitoring kerawanan padi" />

  const top5 = stats.sorted.slice(0, 5)
  const aksiPrioritas = stats.sorted.filter((d) => d.risk_label !== 'low').slice(0, 3)
  const donutData = [
    { name: 'Aman', value: stats.low, key: 'low' },
    { name: 'Waspada', value: stats.medium, key: 'medium' },
    { name: 'Kritis', value: stats.high, key: 'high' },
  ]

  return (
    <Layout title="Dashboard" subtitle="Pusat kendali monitoring kerawanan padi">
      {stats.high > 0 && (
        <div className="alert-banner">
          <i className="fas fa-bell" />
          <span>
            <strong>Peringatan:</strong> {stats.high} wilayah berada pada kondisi KRITIS dan memerlukan
            perhatian segera.
          </span>
        </div>
      )}

      <div className="dashboard-cards">
        <div className="stat-card low">
          <h3><i className="fas fa-shield-alt" /> AMAN</h3>
          <div className="stat-number">{stats.low}</div>
          <div className="stat-label">Wilayah Risiko Rendah</div>
        </div>
        <div className="stat-card medium">
          <h3><i className="fas fa-exclamation-circle" /> WASPADA</h3>
          <div className="stat-number">{stats.medium}</div>
          <div className="stat-label">Wilayah Risiko Sedang</div>
        </div>
        <div className="stat-card high">
          <h3><i className="fas fa-triangle-exclamation" /> KRITIS</h3>
          <div className="stat-number">{stats.high}</div>
          <div className="stat-label">Wilayah Risiko Tinggi</div>
        </div>
      </div>

      <div className="map-layout" style={{ marginBottom: 20 }}>
        <div className="map-container">
          <div className="card-head-inline">
            <h3><i className="fas fa-map-marked-alt" /> Sebaran Risiko</h3>
            <Link to="/map" className="more-link">Buka peta <i className="fas fa-arrow-right" /></Link>
          </div>
          <RiskMap data={current} height={420} onSelect={undefined} />
        </div>
        <div className="detail-panel">
          <h3><i className="fas fa-chart-pie" /> Distribusi</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                {donutData.map((d) => (
                  <Cell key={d.key} fill={RISK_COLORS[d.key]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <ul className="custom-list">
            <li><span>Total Wilayah</span><strong>{stats.total}</strong></li>
            <li><span>Tertinggi</span><strong>{stats.sorted[0]?.wilayah || '-'}</strong></li>
            <li><span>Rata-rata Prob. Waspada</span><strong>{stats.avg}%</strong></li>
          </ul>
        </div>
      </div>

      <div className="grid-2">
        <div className="list-container">
          <h3><i className="fas fa-exclamation-triangle" /> Wilayah Prioritas</h3>
          <ul className="custom-list">
            {top5.map((d, i) => (
              <li key={d.wilayah}>
                <span><span className="rank">{i + 1}</span> {d.wilayah}</span>
                <span className="risk-badge" style={{ background: riskColor(d.risk_label) }}>
                  {RISK_LABEL_ID[d.risk_label] || d.risk_label} ({Number(d.prob_waspada).toFixed(0)}%)
                </span>
              </li>
            ))}
          </ul>
          <Link to="/rawan" className="more-link">Lihat semua <i className="fas fa-arrow-right" /></Link>
        </div>

        <div className="list-container">
          <h3><i className="fas fa-hands-helping" /> Rekomendasi Tindakan Utama</h3>
          {aksiPrioritas.length === 0 ? (
            <p className="section-note">Tidak ada wilayah yang membutuhkan intervensi prioritas saat ini.</p>
          ) : (
            aksiPrioritas.map((d) => (
              <div className="aksi-mini" key={d.wilayah}>
                <div className="aksi-mini-head">
                  <strong>{d.wilayah}</strong>
                  <span className="risk-badge" style={{ background: riskColor(d.risk_label) }}>
                    {RISK_LABEL_ID[d.risk_label]}
                  </span>
                </div>
                <p>{d.rekomendasi_aksi}</p>
              </div>
            ))
          )}
          <Link to="/aksi" className="more-link">Semua rekomendasi <i className="fas fa-arrow-right" /></Link>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="list-container">
          <h3><i className="fas fa-magnifying-glass-chart" /> Faktor Risiko Dominan</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topFaktor} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="faktor" width={160} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="jumlah" name="Kejadian" fill="#2e7d32" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <Link to="/faktor" className="more-link">Analisis faktor <i className="fas fa-arrow-right" /></Link>
        </div>

        <div className="list-container">
          <h3><i className="fas fa-chart-line" /> Tren Skor Risiko (2018–2026)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={miniTren}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tahun" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="final" name="Skor Final" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="iklim" name="Skor Iklim" stroke="#2e7d32" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <Link to="/trend" className="more-link">Analisis tren <i className="fas fa-arrow-right" /></Link>
        </div>
      </div>

      <div className="list-container" style={{ marginTop: 20 }}>
        <h3><i className="fas fa-cloud-sun-rain" /> Proyeksi Bulan Mendatang</h3>
        <ul className="custom-list">
          {distribusiPrediksi.map((d) => (
            <li key={d.bulan_prediksi}>
              <span>{d.bulan_prediksi}</span>
              <span className="mini-dist">
                <span style={{ color: RISK_COLORS.low }}>{d.low} aman</span>
                <span style={{ color: RISK_COLORS.medium }}>{d.medium} waspada</span>
                <span style={{ color: RISK_COLORS.high }}>{d.high} kritis</span>
              </span>
            </li>
          ))}
        </ul>
        <Link to="/ramalan" className="more-link">Detail prediksi <i className="fas fa-arrow-right" /></Link>
      </div>
    </Layout>
  )
}
