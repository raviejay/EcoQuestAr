// file: src/composables/useGeolocation.js
import { ref } from "vue";

export function useGeolocation() {
  const latitude = ref(null);
  const longitude = ref(null);
  const error = ref(null);

  function getPosition() {
    if (!navigator.geolocation) {
      error.value = "Geolocation not supported";
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        latitude.value = pos.coords.latitude;
        longitude.value = pos.coords.longitude;
      },
      (err) => {
        error.value = err.message;
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return { latitude, longitude, error, getPosition };
}
