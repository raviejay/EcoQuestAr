// file: src/modules/camera/composables/useCamera.js
import { ref, onUnmounted } from "vue";

export function useCamera() {
  const videoRef = ref(null);
  const stream = ref(null);
  const error = ref(null);
  const isReady = ref(false);

  async function startCamera() {
    error.value = null;
    try {
      stream.value = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" }, // rear camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.value) {
        videoRef.value.srcObject = stream.value;
        await new Promise((resolve) => {
          videoRef.value.onloadedmetadata = () => {
            videoRef.value.play();
            resolve();
          };
        });
        isReady.value = true;
      }
    } catch (err) {
      error.value =
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access."
          : `Camera error: ${err.message}`;
    }
  }

  function stopCamera() {
    if (stream.value) {
      stream.value.getTracks().forEach((track) => track.stop());
      stream.value = null;
    }
    isReady.value = false;
  }

  onUnmounted(() => stopCamera());

  return { videoRef, stream, error, isReady, startCamera, stopCamera };
}
