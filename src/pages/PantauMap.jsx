import { useState } from 'react'
import Layout from '../components/Layout'
import RiskMap from '../components/RiskMap'
import { useData } from '../hooks/useData'
import { riskColor, RISK_LABEL_ID } from '../utils/risk'

const METRIK = [
  {
    label: 'Status Panen',
    nilai: (d) => d.status_panen,
    info: 'Status prediksi panen wilayah pada bulan terdekat.',
  },
  {
    label: 'Prob. Waspada',
    nilai: (d) => `${Number(d.prob_waspada).toFixed(1)}%`,
    info: 'Probabilitas wilayah masuk kategori waspada menurut model.',
  },
  {
    label: 'Prob. Kritis',
    nilai: (d) => `${Number(d.prob_kritis).toFixed(1)}%`,
    info: 'Probabilitas wilayah masuk kategori kritis menurut model.',
  },
  {
    label: 'Risiko Historis',
    nilai: (d) => `${Number(d.prob_historis).toFixed(0)}%`,
    info: 'Kerentanan berdasarkan pola produksi dan luas panen sebelumnya.',
  },
  {
    label: 'Maks. HTH',
    nilai: (d) => d.max_hth != null ? Number(d.max_hth).toFixed(0) : '-',
    info: 'Perkiraan hari tanpa hujan terpanjang pada masa vegetatif.',
  },
  {
    label: 'Rasio KAT/Normal',
    nilai: (d) => d.rasio_kat != null ? Number(d.rasio_kat).toFixed(2) : '-',
    info: 'Perbandingan air tanah saat ini terhadap kondisi normal.',
  },
  {
    label: 'Rasio Hujan/Normal',
    nilai: (d) => d.rasio_hujan != null ? Number(d.rasio_hujan).toFixed(2) : '-',
    info: 'Perbandingan curah hujan saat ini terhadap kondisi normal.',
  },
]

export default function PantauMap() {
  const { current } = useData()
  const [dipilih, setDipilih] = useState(null)
  const [terbuka, setTerbuka] = useState(null)

  const pilihWilayah = (d) => {
    setDipilih(d)
    setTerbuka(null)
  }

  const toggle = (label) => setTerbuka((t) => (t === label ? null : label))

  return (
    <Layout title="PantauMap" subtitle="Visualisasi sebaran kerawanan padi">
      <div className="map-layout">
        <div className="map-container">
          <RiskMap data={current} height={560} onSelect={pilihWilayah} />
        </div>

        <div className="detail-panel">
          {!dipilih ? (
            <div className="detail-empty">
              <i className="fas fa-hand-pointer" />
              <p>Klik salah satu titik pada peta untuk melihat detail wilayah.</p>
            </div>
          ) : (
            <>
              <h3>{dipilih.wilayah}</h3>
              <span
                className="risk-badge big"
                style={{ background: riskColor(dipilih.risk_label) }}
              >
                {RISK_LABEL_ID[dipilih.risk_label] || dipilih.risk_label}
              </span>
              <p className="detail-hint">
                <i className="fas fa-circle-info" /> Klik tiap baris untuk melihat keterangan.
              </p>
              <ul className="metrik-list">
                {METRIK.map((m) => (
                  <li key={m.label} className={terbuka === m.label ? 'open' : ''}>
                    <button className="metrik-row" onClick={() => toggle(m.label)}>
                      <span>{m.label}</span>
                      <span className="metrik-val">
                        <strong>{m.nilai(dipilih)}</strong>
                        <i className="fas fa-chevron-down" />
                      </span>
                    </button>
                    {terbuka === m.label && <p className="metrik-info">{m.info}</p>}
                  </li>
                ))}
              </ul>
              <div className="detail-block">
                <h4>Faktor Dominan</h4>
                <p>{dipilih.faktor_dominan}</p>
              </div>
              <div className="detail-block">
                <h4>Rekomendasi</h4>
                <p>{dipilih.rekomendasi_aksi}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
