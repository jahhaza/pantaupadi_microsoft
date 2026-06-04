import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import { useData } from '../hooks/useData'

function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])
  const tanggal = now.toLocaleDateString('id-ID')
  const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  return (
    <div className="date-time">
      {tanggal} | {jam}
    </div>
  )
}

export default function Layout({ title, subtitle, children }) {
  const { loading, error } = useData()
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <header className="content-header">
          <div className="header-title">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="header-actions">
            <Clock />
            <button className="refresh-btn" onClick={() => window.location.reload()}>
              <i className="fas fa-sync-alt" />
            </button>
          </div>
        </header>
        <div className="page-content">
          {loading && (
            <div className="state-msg">
              <i className="fas fa-spinner fa-spin" /> Memuat data...
            </div>
          )}
          {error && (
            <div className="state-msg error">
              <i className="fas fa-triangle-exclamation" /> Gagal memuat data: {error}
            </div>
          )}
          {!loading && !error && children}
        </div>
      </main>
    </div>
  )
}
