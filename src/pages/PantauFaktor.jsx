import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'
import Layout from '../components/Layout'
import { useData } from '../hooks/useData'

const KOMPONEN = [
  { key: 'hujan_score', label: 'Curah Hujan', desc: 'Sifat hujan bawah normal (BN)', icon: 'fa-cloud-rain' },
  { key: 'HTH_score', label: 'Hari Tanpa Hujan', desc: 'Durasi kekeringan (HTH panjang)', icon: 'fa-sun' },
  { key: 'KAT_score', label: 'Ketersediaan Air', desc: 'Rasio air tanah terhadap normal', icon: 'fa-droplet' },
  { key: 'historical_score', label: 'Sensitivitas Historis', desc: 'Volatilitas produksi masa lalu', icon: 'fa-clock-rotate-left' },
]

export default function PantauFaktor() {
  const { faktorDominan, historis } = useData()

  const wilayahData = useMemo(() => {
    const data2026 = historis.filter((d) => d.tahun === 2026)
    const map = {}
    data2026.forEach((d) => {
      if (!map[d.wilayah] || d.bulan > map[d.wilayah].bulan) map[d.wilayah] = d
    })
    return Object.values(map).sort((a, b) => a.wilayah.localeCompare(b.wilayah))
  }, [historis])

  const [wilayah, setWilayah] = useState('')
  const wAktif = wilayah || wilayahData[0]?.wilayah || ''
  const detail = wilayahData.find((d) => d.wilayah === wAktif)

  const breakdown = useMemo(() => {
    if (!detail) return []
    return KOMPONEN.map((k) => ({ ...k, nilai: Number(detail[k.key]) || 0 }))
  }, [detail])

  const topFaktor = useMemo(
    () => faktorDominan.slice(0, 8).map((d) => ({
      faktor: d.faktor_dominan.length > 32 ? d.faktor_dominan.slice(0, 32) + '…' : d.faktor_dominan,
      jumlah: d.jumlah,
    })),
    [faktorDominan],
  )

  return (
    <Layout title="PantauFaktor" subtitle="Analisis penyebab risiko">
      <div className="list-container">
        <div className="toolbar">
          <h3><i className="fas fa-magnifying-glass-chart" /> Kontribusi Faktor per Wilayah</h3>
          <select value={wAktif} onChange={(e) => setWilayah(e.target.value)}>
            {wilayahData.map((d) => (
              <option key={d.wilayah} value={d.wilayah}>{d.wilayah}</option>
            ))}
          </select>
        </div>
        {detail && (
          <>
            <div className="faktor-cards">
              {breakdown.map((k) => (
                <div className="faktor-card" key={k.key} data-level={k.nilai}>
                  <i className={`fas ${k.icon}`} />
                  <div>
                    <div className="faktor-label">{k.label}</div>
                    <div className="faktor-desc">{k.desc}</div>
                  </div>
                  <div className="faktor-nilai">{k.nilai}</div>
                </div>
              ))}
            </div>
            <p className="section-note">
              Skor final wilayah <strong>{detail.wilayah}</strong>: {detail.final_score}
              {' '}(iklim {detail.climate_score} + historis {detail.historical_score}) →
              kategori <strong>{detail.risk_label}</strong>.
            </p>
          </>
        )}
      </div>

      <div className="list-container" style={{ marginTop: 20 }}>
        <h3><i className="fas fa-ranking-star" /> Faktor Penyebab Paling Sering Muncul</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={topFaktor} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="faktor" width={220} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="jumlah" name="Jumlah kejadian" radius={[0, 6, 6, 0]}>
              {topFaktor.map((_, i) => (
                <Cell key={i} fill="#2e7d32" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Layout>
  )
}
