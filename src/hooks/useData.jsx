import { createContext, useContext, useEffect, useState } from 'react'
import Papa from 'papaparse'

const DataContext = createContext(null)

const SOURCES = {
  current: 'prediksi_bulan_depan.csv',
  aksi: 'PANTAUAKSI_REKOMENDASI_2026.csv',
  horizon: 'prediksi_multi_horizon.csv',
  historis: 'feature_historis.csv',
  evaluasi: 'evaluasi_model.csv',
  distribusiRisiko: 'eda_distribusi_risiko.csv',
  faktorDominan: 'eda_faktor_dominan.csv',
  bulanRawan: 'eda_bulan_rawan.csv',
  risikoPerTahun: 'eda_risiko_per_tahun.csv',
  trenTahunan: 'eda_tren_tahunan.csv',
  topWilayah: 'eda_top_wilayah_high_risk.csv',
  prioritas2026: 'eda_prioritas_2026.csv',
  distribusiPrediksi: 'distribusi_prediksi.csv',
}

function loadCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(`/data/${file}`, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (res) => resolve(res.data),
      error: reject,
    })
  })
}

const FAKTOR_LABEL = {
  probabilitas_risiko_historis: 'Sensitivitas historis wilayah',
  total_hujan_lag2: 'Curah hujan rendah (2 bulan terakhir)',
  total_hujan_lag3: 'Curah hujan rendah (3 bulan terakhir)',
  max_hth_lag2: 'Hari tanpa hujan panjang',
  max_hth_lag3: 'Hari tanpa hujan panjang',
  kat_value_lag2: 'Ketersediaan air rendah',
  rasio_kat_lag2: 'Ketersediaan air rendah',
}

function deriveRisk(probKritis, status) {
  if (probKritis >= 5) return 'high'
  if (typeof status === 'string' && status.includes('WASPADA')) return 'medium'
  return 'low'
}

function rekomendasi(label) {
  if (label === 'high')
    return 'Prioritaskan pemantauan lapangan, cek irigasi/ketersediaan air, dan siapkan intervensi cepat.'
  if (label === 'medium')
    return 'Lakukan monitoring berkala dan validasi kondisi lapangan pada wilayah rentan.'
  return 'Pantau rutin; belum membutuhkan intervensi prioritas.'
}

// File prediksi model baru memakai skema berbeda. Petakan ke field yang dipakai
// aplikasi dan ambil bulan terdekat sebagai kondisi terkini per wilayah.
function normalizeCurrent(rows) {
  if (!rows.length || !('STATUS_PANEN' in rows[0])) return rows

  const terdekat = {}
  for (const r of rows) {
    const w = r.ADM2_NAME
    if (!terdekat[w] || r.bulan < terdekat[w].bulan) terdekat[w] = r
  }

  return Object.values(terdekat).map((r) => {
    const probWaspada = Number(r['Prob_Waspada(%)']) || 0
    const probKritis = Number(r['Prob_Kritis(%)']) || 0
    const label = deriveRisk(probKritis, r.STATUS_PANEN)
    return {
      wilayah: r.ADM2_NAME,
      bulan: r.bulan,
      risk_label: label,
      final_score: probWaspada,
      prob_waspada: probWaspada,
      prob_kritis: probKritis,
      prob_historis: (Number(r.probabilitas_risiko_historis) || 0) * 100,
      max_hth: r.max_hth_vegetatif,
      rasio_kat: r.rasio_kat_lag2,
      rasio_hujan: r.rasio_hujan_lag2,
      status_panen: r.STATUS_PANEN,
      faktor_dominan: FAKTOR_LABEL[r.FAKTOR_DOMINAN] || r.FAKTOR_DOMINAN,
      rekomendasi_aksi: rekomendasi(label),
    }
  })
}

const empty = Object.fromEntries(Object.keys(SOURCES).map((k) => [k, []]))

export function DataProvider({ children }) {
  const [state, setState] = useState({ loading: true, error: null, ...empty })

  useEffect(() => {
    let aktif = true
    const keys = Object.keys(SOURCES)

    Promise.all(keys.map((k) => loadCsv(SOURCES[k])))
      .then((hasil) => {
        if (!aktif) return
        const data = Object.fromEntries(keys.map((k, i) => [k, hasil[i]]))
        data.current = normalizeCurrent(data.current)
        setState({ loading: false, error: null, ...data })
      })
      .catch((err) => {
        if (!aktif) return
        setState((s) => ({ ...s, loading: false, error: err.message || 'Gagal memuat data' }))
      })

    return () => {
      aktif = false
    }
  }, [])

  return <DataContext.Provider value={state}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData harus dipakai di dalam DataProvider')
  return ctx
}
