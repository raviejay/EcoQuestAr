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
  const liveCount = ref(0);

  // 1 request/sec — serverless Roboflow has cold-start latency
  const DETECTION_INTERVAL_MS = 1000;

  let animationId = null;
  let lastDetectionTime = 0;
  let inFlight = false;

  async function loadModel() {
    if (modelReady.value) return;
    modelLoading.value = true;
    loadingMessage.value = "Connecting to Roboflow...";
    try {
      await detectionService.loadModel((msg) => {
        loadingMessage.value = msg;
      });
      modelReady.value = true;
    } catch (err) {
      loadingMessage.value = `Error: ${err.message}`;
    } finally {
      modelLoading.value = false;
    }
  }

  function drawDetections(canvas, video, results) {
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");

    const rect = video.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const scaleX = rect.width / video.videoWidth;
    const scaleY = rect.height / video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    results.forEach(({ bbox, class: label, score, points }) => {
      const [bx, by, bw, bh] = bbox;
      const x = bx * scaleX;
      const y = by * scaleY;
      const w = bw * scaleX;
      const h = bh * scaleY;

      // Glow
      ctx.shadowColor = "#22c55e";
      ctx.shadowBlur = 14;
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);

      // Corner accents
      const cs = 18;
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

      ctx.shadowBlur = 0;

      // Label
      const pct = Math.round(score * 100);
      const text = `🗑 ${label}  ${pct}%  +${points}pts`;
      ctx.font = "bold 13px sans-serif";
      const tw = ctx.measureText(text).width;
      const lx = x;
      const ly = y > 32 ? y - 30 : y + h + 4;
      ctx.fillStyle = "rgba(22,163,74,0.92)";
      ctx.beginPath();
      ctx.roundRect(lx, ly, tw + 14, 26, 6);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillText(text, lx + 7, ly + 17);
    });
  }

  async function startDetection(videoElement, onDetected) {
    if (!modelReady.value) await loadModel();
    if (!modelReady.value) return;
    isDetecting.value = true;
    let lastResults = [];

    async function loop(timestamp) {
      if (!isDetecting.value) return;

      if (!inFlight && timestamp - lastDetectionTime >= DETECTION_INTERVAL_MS) {
        lastDetectionTime = timestamp;
        inFlight = true;
        try {
          const { predictions, count } =
            await detectionService.detect(videoElement);
          lastResults = predictions;
          detections.value = predictions;
          liveCount.value = count;

          if (predictions.length > 0) {
            totalDetected.value += predictions.length;
            sessionPoints.value += predictions.reduce(
              (s, d) => s + d.points,
              0,
            );
            onDetected?.(predictions);
          }
        } catch {
          /* keep looping */
        } finally {
          inFlight = false;
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
      canvasRef.value
        .getContext("2d")
        .clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    }
    detections.value = [];
    liveCount.value = 0;
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
    liveCount,
    loadModel,
    startDetection,
    stopDetection,
  };
}
