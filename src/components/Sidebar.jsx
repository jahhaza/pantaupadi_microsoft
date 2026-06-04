import { NavLink } from 'react-router-dom'

const MENU = [
  { to: '/', label: 'Dashboard', icon: 'fa-tachometer-alt', end: true },
  { to: '/map', label: 'PantauMap', icon: 'fa-map-marked-alt' },
  { to: '/trend', label: 'PantauTrend', icon: 'fa-chart-line' },
  { to: '/ramalan', label: 'PantauRamalan', icon: 'fa-cloud-sun-rain' },
  { to: '/faktor', label: 'PantauFaktor', icon: 'fa-magnifying-glass-chart' },
  { to: '/rawan', label: 'PantauRawan', icon: 'fa-exclamation-triangle' },
  { to: '/aksi', label: 'PantauAksi', icon: 'fa-hands-helping' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">
          <i className="fas fa-seedling" />
          <span>PantauPadi</span>
        </div>
        <div className="instansi">
          <img src="/logo.png" alt="Logo Provinsi Jawa Timur" className="instansi-logo" />
          <div className="instansi-text">
            <span>Dinas Pertanian dan Ketahanan Pangan</span>
            <span>Provinsi Jawa Timur</span>
          </div>
        </div>
      </div>
      <nav className="nav-menu">
        {MENU.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            end={m.end}
            className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
          >
            <i className={`fas ${m.icon}`} />
            <span>{m.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="status-badge">
          <i className="fas fa-circle" />
          <span>Sistem Aktif</span>
        </div>
        <div className="version">v2.0 Intelligence</div>
      </div>
    </aside>
  )
}
