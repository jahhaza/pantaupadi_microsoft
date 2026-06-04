import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DataProvider } from './hooks/useData'
import Dashboard from './pages/Dashboard'
import PantauMap from './pages/PantauMap'
import PantauTrend from './pages/PantauTrend'
import PantauRamalan from './pages/PantauRamalan'
import PantauFaktor from './pages/PantauFaktor'
import PantauRawan from './pages/PantauRawan'
import PantauAksi from './pages/PantauAksi'

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<PantauMap />} />
          <Route path="/trend" element={<PantauTrend />} />
          <Route path="/ramalan" element={<PantauRamalan />} />
          <Route path="/faktor" element={<PantauFaktor />} />
          <Route path="/rawan" element={<PantauRawan />} />
          <Route path="/aksi" element={<PantauAksi />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  )
}
