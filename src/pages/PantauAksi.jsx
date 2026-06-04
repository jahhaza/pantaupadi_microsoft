import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { useData } from '../hooks/useData'
import { riskColor, RISK_LABEL_ID } from '../utils/risk'

const RISK_KEY = { aman: 'low', waspada: 'medium', kritis: 'high' }
const toRiskKey = (label) => RISK_KEY[String(label).toLowerCase()] || 'low'

const URGENSI_COLOR = {
  'Sangat Tinggi': '#dc2626',
  Tinggi: '#ef4444',
  'Observasi Ketat': '#f97316',
  Sedang: '#fbbf24',
  Rendah: '#22c55e',
}

function CardAksi({ d }) {
  const [buka, setBuka] = useState(false)
  const key = toRiskKey(d.risiko_label)
  const langkah = String(d.langkah_aksi_utama || '')
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <div className="aksi-card" style={{ borderLeftColor: riskColor(key) }}>
      <div className="aksi-head">
        <h4>{d.kabupaten_kota}</h4>
        <span className="risk-badge" style={{ background: riskColor(key) }}>
          {RISK_LABEL_ID[key]}
        </span>
      </div>

      <div className="aksi-meta">
        <span className="aksi-periode"><i className="fas fa-calendar-day" /> {d.periode}</span>
        <span className="aksi-urgensi" style={{ color: URGENSI_COLOR[d.urgensi] || 'var(--muted)' }}>
          <i className="fas fa-bolt" /> Urgensi: {d.urgensi}
        </span>
        {d.batas_waktu && (
          <span className="aksi-batas"><i className="fas fa-clock" /> {d.batas_waktu}</span>
        )}
      </div>

      <p className="aksi-faktor"><i className="fas fa-circle-dot" /> {d.faktor_dominan_bahasa}</p>

      {d.kategori_aksi && <div className="aksi-kategori">{d.kategori_aksi}</div>}

      <p className="aksi-rekom">{d.rekomendasi_card}</p>

      {buka && (
        <div className="aksi-detail">
          {d.diagnosis_masalah && (
            <div className="aksi-blok">
              <h5>Diagnosis</h5>
              <p>{d.diagnosis_masalah}</p>
            </div>
          )}
          {langkah.length > 0 && (
            <div className="aksi-blok">
              <h5>Langkah Aksi Utama</h5>
              <ul>{langkah.map((l, i) => <li key={i}>{l}</li>)}</ul>
            </div>
          )}
          {d.aktor_tindak_lanjut && (
            <div className="aksi-blok">
              <h5>Aktor Tindak Lanjut</h5>
              <p>{d.aktor_tindak_lanjut}</p>
            </div>
          )}
          {d.output_diharapkan && (
            <div className="aksi-blok">
              <h5>Output Diharapkan</h5>
              <p>{d.output_diharapkan}</p>
            </div>
          )}
        </div>
      )}

      <button className="aksi-toggle" onClick={() => setBuka((b) => !b)}>
        {buka ? 'Tutup detail' : 'Lihat detail'}
        <i className={`fas fa-chevron-${buka ? 'up' : 'down'}`} />
      </button>
    </div>
  )
}

export default function PantauAksi() {
  const { aksi } = useData()
  const [periode, setPeriode] = useState('')
  const [filter, setFilter] = useState('all')

  const periodeList = useMemo(
    () => [...new Set(aksi.map((d) => d.periode))].filter(Boolean),
    [aksi],
  )
  const periodeAktif = periode || periodeList[0] || ''

  const data = useMemo(() => {
    return aksi
      .filter((d) => d.periode === periodeAktif)
      .filter((d) => filter === 'all' || toRiskKey(d.risiko_label) === filter)
      .sort((a, b) => (Number(b.skor_prioritas_aksi) || 0) - (Number(a.skor_prioritas_aksi) || 0))
  }, [aksi, periodeAktif, filter])

  return (
    <Layout title="PantauAksi" subtitle="Rekomendasi tindakan per wilayah">
      <div className="toolbar standalone">
        <span className="section-note" style={{ margin: 0 }}>
          Rekomendasi diurutkan berdasarkan skor prioritas aksi tiap wilayah.
        </span>
        <div className="toolbar-actions">
          <select value={periodeAktif} onChange={(e) => setPeriode(e.target.value)}>
            {periodeList.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Semua Risiko</option>
            <option value="high">Kritis</option>
            <option value="medium">Waspada</option>
            <option value="low">Aman</option>
          </select>
        </div>
      </div>

      <div className="aksi-grid">
        {data.map((d, i) => <CardAksi key={`${d.kabupaten_kota}-${i}`} d={d} />)}
      </div>
    </Layout>
  )
}
