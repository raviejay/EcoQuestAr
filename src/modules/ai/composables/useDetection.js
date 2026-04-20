// file: src/modules/ai/composables/useDetection.js
import { ref, onUnmounted } from "vue";
import { detectionService } from "@/modules/ai/services/detectionService.js";

export function useDetection() {
  const canvasRef = ref(null);
  const detections = ref([]);
  const isDetecting = ref(false);
  const modelLoading = ref(false);
  const modelReady = ref(false);
  const loadingMessage = ref("");
  const totalDetected = ref(0);
  const sessionPoints = ref(0);

  let animationId = null;
  let lastDetectionTime = 0;
  const DETECTION_INTERVAL_MS = 500;

  async function loadModel() {
    if (modelReady.value) return;
    modelLoading.value = true;
    loadingMessage.value = "Initializing AI...";
    try {
      await detectionService.loadModel((msg) => {
        loadingMessage.value = msg;
      });
      modelReady.value = true;
    } catch (err) {
      loadingMessage.value = `Failed: ${err.message}`;
    } finally {
      modelLoading.value = false;
    }
  }

  function drawDetections(canvas, video, results) {
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");

    // CRITICAL: match canvas to video's RENDERED size, not stream resolution
    const rect = video.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Scale factor: stream resolution → rendered size
    const scaleX = rect.width / video.videoWidth;
    const scaleY = rect.height / video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    results.forEach(({ bbox, class: label, score, isTrash, points }) => {
      const [bx, by, bw, bh] = bbox;
      const x = bx * scaleX;
      const y = by * scaleY;
      const w = bw * scaleX;
      const h = bh * scaleY;

      // Box color: green for trash, yellow for other detected objects
      const color = isTrash ? "#22c55e" : "#eab308";
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);

      // Corner accents
      const cs = 16;
      ctx.lineWidth = 5;
      [
        [x, y, x + cs, y, x, y + cs],
        [x + w - cs, y, x + w, y, x + w, y + cs],
        [x, y + h - cs, x, y + h, x + cs, y + h],
        [x + w - cs, y + h, x + w, y + h, x + w, y + h - cs],
      ].forEach(([x1, y1, x2, y2, x3, y3]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x3, y3);
        ctx.stroke();
      });

      // Label
      const pct = Math.round(score * 100);
      const text = isTrash
        ? `🗑 ${label} ${pct}% +${points}pts`
        : `${label} ${pct}%`;
      ctx.font = "bold 13px sans-serif";
      const tw = ctx.measureText(text).width;
      ctx.fillStyle = isTrash ? "rgba(22,163,74,0.9)" : "rgba(161,98,7,0.9)";
      ctx.beginPath();
      ctx.roundRect(x, y > 28 ? y - 28 : y + h + 4, tw + 14, 24, 5);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillText(text, x + 7, y > 28 ? y - 10 : y + h + 21);
    });
  }

  async function startDetection(videoElement, onDetected) {
    if (!modelReady.value) await loadModel();
    if (!modelReady.value) return;
    isDetecting.value = true;
    let lastResults = [];

    async function loop(timestamp) {
      if (!isDetecting.value) return;

      if (timestamp - lastDetectionTime >= DETECTION_INTERVAL_MS) {
        lastDetectionTime = timestamp;
        const results = await detectionService.detect(videoElement);
        lastResults = results;
        detections.value = results;

        const trashOnly = results.filter((r) => r.isTrash);
        if (trashOnly.length > 0) {
          totalDetected.value += trashOnly.length;
          sessionPoints.value += trashOnly.reduce((s, d) => s + d.points, 0);
          onDetected?.(trashOnly);
        }
      }

      drawDetections(canvasRef.value, videoElement, lastResults);
      animationId = requestAnimationFrame(loop);
    }

    animationId = requestAnimationFrame(loop);
  }

  function stopDetection() {
    isDetecting.value = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (canvasRef.value) {
      const ctx = canvasRef.value.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    }
    detections.value = [];
  }

  onUnmounted(() => stopDetection());

  return {
    canvasRef,
    detections,
    isDetecting,
    modelLoading,
    modelReady,
    loadingMessage,
    totalDetected,
    sessionPoints,
    loadModel,
    startDetection,
    stopDetection,
  };
}
