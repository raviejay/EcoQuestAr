const API_KEY = import.meta.env.VITE_ROBOFLOW_API_KEY;
const WORKSPACE = import.meta.env.VITE_ROBOFLOW_WORKSPACE;
const WORKFLOW_ID = import.meta.env.VITE_ROBOFLOW_WORKFLOW_ID;

const ENDPOINT = import.meta.env.DEV
  ? `/roboflow/${WORKSPACE}/workflows/${WORKFLOW_ID}`
  : `/api/detect`;

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
const API_KEY2 = true;

export const detectionService = {
  isModelLoaded: () => !!API_KEY2,

  async loadModel(onProgress) {
    onProgress?.("Connecting to Roboflow...");
    if (!API_KEY2) throw new Error("VITE_ROBOFLOW_API_KEY missing in .env");
    onProgress?.("Custom trash model ready ✅");
  },

  async detect(videoElement) {
    if (!videoElement || videoElement.readyState < 2)
      return { predictions: [], count: 0, annotatedImage: null };
    if (videoElement.videoWidth === 0)
      return { predictions: [], count: 0, annotatedImage: null };

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          import.meta.env.DEV
            ? {
                api_key: API_KEY,
                inputs: {
                  image: { type: "base64", value: captureFrame(videoElement) },
                },
              }
            : {
                inputs: {
                  image: { type: "base64", value: captureFrame(videoElement) },
                },
              },
        ),
      });

      if (!response.ok) {
        console.warn("Roboflow error:", response.status, await response.text());
        return { predictions: [], count: 0, annotatedImage: null };
      }

      const result = await response.json();

      // response is wrapped in outputs[0]
      const output = result?.outputs?.[0] ?? {};

      // annotated_image is { type: "base64", value: "..." }
      const annotatedImage = output?.annotated_image?.value ?? null;

      // tracked_detections.predictions
      const raw = output?.tracked_detections?.predictions ?? [];

      return {
        predictions: raw.map((p) => this.normalizePrediction(p)),
        count: raw.length,
        annotatedImage,
      };
    } catch (err) {
      console.warn("Detection fetch error:", err.message);
      return { predictions: [], count: 0, annotatedImage: null };
    }
  },

  normalizePrediction(p) {
    return {
      bbox: [p.x - p.width / 2, p.y - p.height / 2, p.width, p.height],
      class: p.class ?? p.class_name ?? "trash",
      score: p.confidence ?? 1,
      trackerId: p.tracker_id ?? null,
      isTrash: true,
      points: calcPoints(p.confidence ?? 1),
    };
  },

  unload() {},
};
