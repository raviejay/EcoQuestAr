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

const CSU_CENTER = [8.9535, 125.5975];
const CSU_BOUNDS = L.latLngBounds([8.947, 125.59], [8.961, 125.606]);

// Radar pulse HTML for a given color
function radarPulseHtml(color, size = 20) {
  return `
    <div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center">
      <div style="position:absolute;width:${size * 3}px;height:${size * 3}px;border-radius:50%;background:${color};opacity:0.15;animation:radar-pulse 2s ease-out infinite;top:50%;left:50%;transform:translate(-50%,-50%)"></div>
      <div style="position:absolute;width:${size * 2}px;height:${size * 2}px;border-radius:50%;background:${color};opacity:0.2;animation:radar-pulse 2s ease-out infinite 0.5s;top:50%;left:50%;transform:translate(-50%,-50%)"></div>
      <div style="position:absolute;width:${size * 1.3}px;height:${size * 1.3}px;border-radius:50%;background:${color};opacity:0.25;animation:radar-pulse 2s ease-out infinite 0.9s;top:50%;left:50%;transform:translate(-50%,-50%)"></div>
      <div style="position:relative;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 0 12px ${color},0 2px 8px rgba(0,0,0,0.5);z-index:2"></div>
    </div>
    <style>
      @keyframes radar-pulse {
        0%   { transform:translate(-50%,-50%) scale(0.5); opacity:0.4; }
        100% { transform:translate(-50%,-50%) scale(2.2); opacity:0; }
      }
    </style>`;
}

function hotspotColor(count) {
  if (count >= 7) return "#ef4444"; // red   — high
  if (count >= 4) return "#eab308"; // yellow — medium
  return "#6EAE21"; // green  — low
}

export function useMap() {
  const mapRef = ref(null);
  let mapInstance = null;
  let heatLayer = null;
  let markerGroup = null;
  let userMarker = null;

  function initMap(onClickCb = null) {
    if (!mapRef.value || mapInstance) return null;

    mapInstance = L.map(mapRef.value, {
      center: CSU_CENTER,
      zoom: 17,
      minZoom: 15,
      maxZoom: 19,
      maxBounds: CSU_BOUNDS,
      maxBoundsViscosity: 1.0,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(mapInstance);

    // Campus boundary
    L.rectangle(CSU_BOUNDS, {
      color: "#6EAE21",
      weight: 2,
      fillColor: "#6EAE21",
      fillOpacity: 0.04,
      dashArray: "6,6",
    })
      .addTo(mapInstance)
      .bindPopup("<b>🏫 CSU Main Campus</b><br>Caraga State University");

    markerGroup = L.layerGroup().addTo(mapInstance);

    // Click callback (for admin pin drop)
    if (typeof onClickCb === "function") {
      mapInstance.on("click", (e) => onClickCb(e.latlng.lat, e.latlng.lng));
    }

    return mapInstance;
  }

  function setView(lat, lng, zoom = 17) {
    if (!mapInstance) return;
    const clamped = CSU_BOUNDS.contains([lat, lng]) ? [lat, lng] : CSU_CENTER;
    mapInstance.setView(clamped, zoom);
  }

  function resetView() {
    mapInstance?.setView(CSU_CENTER, 17);
  }

  function invalidateSize() {
    setTimeout(() => mapInstance?.invalidateSize(), 150);
  }

  async function renderHeatmap(points) {
    if (!mapInstance) return;
    if (!window.L?.heatLayer) await import("leaflet.heat");
    if (heatLayer) {
      mapInstance.removeLayer(heatLayer);
      heatLayer = null;
    }
    if (!points.length) return;
    const latlngs = points.map((p) => [
      p.lat,
      p.lng,
      Math.min(p.intensity / 5, 1.0),
    ]);
    heatLayer = L.heatLayer(latlngs, {
      radius: 28,
      blur: 20,
      maxZoom: 19,
      gradient: { 0.0: "#6EAE21", 0.5: "#eab308", 1.0: "#ef4444" },
    }).addTo(mapInstance);
  }

  function renderHotspotMarkers(hotspots) {
    if (!mapInstance || !markerGroup) return;
    markerGroup.clearLayers();
    hotspots.forEach((h) => {
      const count = h.report_count ?? h.detection_count ?? 1;
      const color = hotspotColor(count);
      const size = Math.min(14 + count * 2, 28);
      const icon = L.divIcon({
        className: "",
        html: radarPulseHtml(color, size),
        iconSize: [size * 3, size * 3],
        iconAnchor: [size * 1.5, size * 1.5],
      });
      L.marker([h.lat ?? h.latitude, h.lng ?? h.longitude], { icon }).addTo(
        markerGroup,
      ).bindPopup(`
          <div style="font-family:sans-serif;min-width:140px">
            <p style="font-weight:bold;margin:0 0 4px;color:${color}">
              ${count >= 7 ? "🔴 High" : count >= 4 ? "🟡 Medium" : "🟢 Low"} Density
            </p>
            <p style="margin:0;font-size:12px;color:#555">Reports: <b>${count}</b></p>
          </div>`);
    });
  }

  function addAdminMarker(h, map = null) {
    const target = map ?? mapInstance;
    if (!target) return;
    const color =
      h.severity === "high"
        ? "#ef4444"
        : h.severity === "medium"
          ? "#eab308"
          : "#086A9C";
    const icon = L.divIcon({
      className: "",
      html: radarPulseHtml(color, 12),
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });
    return L.marker([h.latitude, h.longitude], { icon })
      .addTo(target)
      .bindPopup(
        `<b>📍 ${h.name}</b><br><small>${h.description || ""} · ${h.severity} risk</small>`,
      );
  }

  function addUserMarker(lat, lng) {
    if (!mapInstance) return;
    if (userMarker) mapInstance.removeLayer(userMarker);
    const icon = L.divIcon({
      className: "",
      html: `<div style="width:16px;height:16px;background:#086A9C;border-radius:50%;border:3px solid white;box-shadow:0 0 0 5px rgba(8,106,156,0.3)"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    userMarker = L.marker([lat, lng], { icon })
      .addTo(mapInstance)
      .bindPopup("<b>📍 You are here</b>");
  }

  function destroyMap() {
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
      heatLayer = null;
      markerGroup = null;
    }
  }

  onUnmounted(() => destroyMap());

  return {
    mapRef,
    initMap,
    setView,
    resetView,
    invalidateSize,
    renderHeatmap,
    renderHotspotMarkers,
    addAdminMarker,
    addUserMarker,
    destroyMap,
  };
}
