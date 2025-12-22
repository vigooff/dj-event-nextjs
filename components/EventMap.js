import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import styles from '@/styles/EventMap.module.css'

export default function EventMap({ evt }) {
  // Pastikan window tersedia sebelum mendefinisikan icon
  const icon = typeof window !== 'undefined' ? L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }) : null

  // Ambil data dari attributes jika menggunakan Strapi v4/v5
  const lat = evt.attributes?.lat || evt.lat || -6.200000 
  const lng = evt.attributes?.lng || evt.lng || 106.816666

  // Jika kode dijalankan di server, jangan render Map dulu
  if (typeof window === 'undefined') {
    return null
  }

  return (
    <div className={styles.map}>
      <h3>📍 Event Location</h3>
      <p><strong>Address:</strong> {evt.attributes?.address || evt.address}</p>
      
      <div style={{ height: "400px", width: "100%", marginTop: "20px", borderRadius: "10px", overflow: "hidden" }}>
        <MapContainer 
          center={[lat, lng]} 
          zoom={13} 
          scrollWheelZoom={false} 
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]} icon={icon}>
            <Popup>
              {evt.attributes?.name || evt.name} <br /> {evt.attributes?.address || evt.address}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  )
}