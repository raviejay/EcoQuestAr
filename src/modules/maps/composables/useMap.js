// file: src/modules/maps/composables/useMap.js
import { ref, onUnmounted } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// CSU Main Campus — Butuan City, Caraga
const CSU_CENTER = [8.9535, 125.5975];
const CSU_BOUNDS = L.latLngBounds(
  [8.947, 125.59], // SW corner
  [8.961, 125.606], // NE corner
);

export function useMap() {
  const mapRef = ref(null);
  let mapInstance = null;
  let heatLayer = null;
  let markerGroup = null;
  let userMarker = null;

  function initMap() {
    if (!mapRef.value || mapInstance) return null;

    mapInstance = L.map(mapRef.value, {
      center: CSU_CENTER,
      zoom: 17,
      minZoom: 15, // can't zoom out past campus view
      maxZoom: 19,
      maxBounds: CSU_BOUNDS, // can't pan outside campus
      maxBoundsViscosity: 1.0, // hard lock — no elasticity
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(mapInstance);

    // CSU campus boundary polygon (approximate)
    L.rectangle(CSU_BOUNDS, {
      color: "#6EAE21",
      weight: 2,
      fillColor: "#6EAE21",
      fillOpacity: 0.05,
      dashArray: "6,6",
    })
      .addTo(mapInstance)
      .bindPopup("<b>🏫 CSU Main Campus</b><br>Caraga State University");

    markerGroup = L.layerGroup().addTo(mapInstance);
    window._ecoMap = mapInstance;
    return mapInstance;
  }

  function setView(lat, lng, zoom = 17) {
    if (!mapInstance) return;
    // Clamp to campus bounds before flying
    const clamped = CSU_BOUNDS.contains([lat, lng])
      ? [lat, lng]
      : [CSU_CENTER[0], CSU_CENTER[1]];
    mapInstance.setView(clamped, zoom);
  }

  async function renderHeatmap(points) {
    if (!mapInstance || !points.length) return;
    if (!window.L?.heatLayer) await import("leaflet.heat");
    if (heatLayer) mapInstance.removeLayer(heatLayer);
    const latlngs = points.map((p) => [
      p.lat,
      p.lng,
      Math.min(p.intensity / 5, 1.0),
    ]);
    heatLayer = L.heatLayer(latlngs, {
      radius: 25,
      blur: 18,
      maxZoom: 19,
      gradient: { 0.2: "#6EAE21", 0.5: "#eab308", 0.8: "#ef4444" },
    }).addTo(mapInstance);
  }

  function renderHotspotMarkers(hotspots) {
    if (!mapInstance || !markerGroup) return;
    markerGroup.clearLayers();
    hotspots.forEach((h) => {
      const n = Math.min(h.detection_count ?? h.report_count ?? 1, 10);
      const color = n >= 7 ? "#ef4444" : n >= 4 ? "#eab308" : "#6EAE21";
      const size = 20 + n * 3;
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:bold">${n}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
      L.marker([h.lat ?? h.latitude, h.lng ?? h.longitude], { icon })
        .addTo(markerGroup)
        .bindPopup(
          `<b>🗑️ Trash Hotspot</b><br>Reports: <b>${h.report_count ?? h.detection_count}</b>`,
        );
    });
  }

  function addAdminMarker(hotspot) {
    if (!mapInstance) return;
    const color =
      hotspot.severity === "high"
        ? "#ef4444"
        : hotspot.severity === "medium"
          ? "#eab308"
          : "#086A9C";
    const icon = L.divIcon({
      className: "",
      html: `<div style="width:14px;height:14px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px ${color}55"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    L.marker([hotspot.latitude, hotspot.longitude], { icon })
      .addTo(mapInstance)
      .bindPopup(
        `<b>📍 ${hotspot.name}</b><br><small>${hotspot.description || ""}</small>`,
      );
  }

  function addUserMarker(lat, lng) {
    if (!mapInstance) return;
    if (userMarker) mapInstance.removeLayer(userMarker);
    const icon = L.divIcon({
      className: "",
      html: `<div style="width:16px;height:16px;background:#086A9C;border-radius:50%;border:3px solid white;box-shadow:0 0 0 5px rgba(8,106,156,0.25)"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    userMarker = L.marker([lat, lng], { icon })
      .addTo(mapInstance)
      .bindPopup("<b>📍 You are here</b>");
  }

  function resetView() {
    mapInstance?.setView(CSU_CENTER, 17);
  }

  function destroyMap() {
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }
  }

  onUnmounted(() => destroyMap());

  return {
    mapRef,
    initMap,
    setView,
    resetView,
    renderHeatmap,
    renderHotspotMarkers,
    addAdminMarker,
    addUserMarker,
    destroyMap,
  };
}
