// file: src/modules/ai/services/detectionService.js
const API_KEY = import.meta.env.VITE_ROBOFLOW_API_KEY;
const WORKSPACE = import.meta.env.VITE_ROBOFLOW_WORKSPACE;
const WORKFLOW_ID = import.meta.env.VITE_ROBOFLOW_WORKFLOW_ID;

// In dev: use Vite proxy (/roboflow) to avoid CORS
// In production build: call Roboflow directly (CORS is allowed on deployed domains)
const BASE = import.meta.env.DEV
  ? "/roboflow"
  : "https://serverless.roboflow.com";

const ENDPOINT = `${BASE}/${WORKSPACE}/workflows/${WORKFLOW_ID}`;

function calcPoints(confidence) {
  if (confidence >= 0.85) return 40;
  if (confidence >= 0.7) return 30;
  if (confidence >= 0.55) return 20;
  return 10;
}

function captureFrame(video, quality = 0.75) {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  return canvas.toDataURL("image/jpeg", quality).split(",")[1];
}

export const detectionService = {
  isModelLoaded: () => !!API_KEY,

  async loadModel(onProgress) {
    onProgress?.("Connecting to Roboflow...");
    if (!API_KEY) throw new Error("VITE_ROBOFLOW_API_KEY missing in .env");
    onProgress?.("Custom trash model ready ✅");
  },

  async detect(videoElement) {
    if (!videoElement || videoElement.readyState < 2)
      return { predictions: [], count: 0 };
    if (videoElement.videoWidth === 0) return { predictions: [], count: 0 };

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: API_KEY,
          inputs: {
            image: { type: "base64", value: captureFrame(videoElement) },
          },
        }),
      });

      if (!response.ok) {
        console.warn("Roboflow error:", response.status, await response.text());
        return { predictions: [], count: 0 };
      }

      const result = await response.json();
      const outputs = result?.outputs?.[0] ?? {};
      const raw = outputs?.predictions?.predictions ?? [];
      const count = outputs?.count_objects ?? raw.length;

      return {
        predictions: raw.map((p) => this.normalizePrediction(p)),
        count,
      };
    } catch (err) {
      console.warn("Detection fetch error:", err.message);
      return { predictions: [], count: 0 };
    }
  },

  normalizePrediction(p) {
    return {
      bbox: [p.x - p.width / 2, p.y - p.height / 2, p.width, p.height],
      class: p.class ?? p.class_name ?? "trash",
      score: p.confidence ?? 1,
      isTrash: true,
      points: calcPoints(p.confidence ?? 1),
    };
  },

  unload() {},
};
