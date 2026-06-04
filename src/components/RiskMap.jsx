import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { KOORDINAT_WILAYAH, CENTER_JATIM } from '../data/coordinates'
import { riskColor, RISK_LABEL_ID } from '../utils/risk'

const radius = (label) => (label === 'high' ? 12 : label === 'medium' ? 9 : 7)

export default function RiskMap({ data, height = 560, zoom = 8, onSelect }) {
  return (
    <MapContainer center={CENTER_JATIM} zoom={zoom} style={{ height, borderRadius: 14 }}>
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {data.map((d) => {
        const pos = KOORDINAT_WILAYAH[d.wilayah]
        if (!pos) return null
        const warna = riskColor(d.risk_label)
        return (
          <CircleMarker
            key={d.wilayah}
            center={pos}
            radius={radius(d.risk_label)}
            pathOptions={{ color: warna, fillColor: warna, fillOpacity: 0.75, weight: 2 }}
            eventHandlers={onSelect ? { click: () => onSelect(d) } : undefined}
          >
            <Tooltip>{d.wilayah}</Tooltip>
            <Popup>
              <b>{d.wilayah}</b>
              <br />
              <span style={{ color: warna }}>{RISK_LABEL_ID[d.risk_label] || d.risk_label}</span>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
