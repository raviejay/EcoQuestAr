// file: src/modules/ai/services/detectionService.js
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

// ALL COCO-SSD detectable classes — we score trash-likely ones higher
// but we detect EVERYTHING and let user decide what's litter
const TRASH_CLASSES = {
  // High confidence trash
  bottle: 40,
  cup: 35,
  "wine glass": 30,
  fork: 25,
  knife: 25,
  spoon: 25,
  bowl: 25,
  // Food waste
  banana: 20,
  apple: 20,
  sandwich: 20,
  orange: 20,
  "hot dog": 20,
  pizza: 20,
  donut: 20,
  cake: 20,
  // Packaging / carried items
  backpack: 15,
  handbag: 15,
  suitcase: 15,
  umbrella: 15,
  // Electronics / misc
  "cell phone": 20,
  book: 10,
  scissors: 15,
  toothbrush: 20,
  "hair drier": 15,
  vase: 10,
  // Clothing on ground = litter
  tie: 15,
  // Containers
  "potted plant": 10,
  // General objects that could be litter
  bench: 5,
  chair: 5,
  clock: 10,
  laptop: 10,
  keyboard: 10,
  mouse: 10,
  remote: 15,
  "teddy bear": 10,
  "sports ball": 10,
  kite: 10,
  "baseball bat": 10,
  "baseball glove": 10,
  skateboard: 10,
  surfboard: 10,
  "tennis racket": 10,
  frisbee: 15,
  skis: 10,
  snowboard: 10,
};

let modelInstance = null;
let isLoading = false;
let loadingPromise = null;

export const detectionService = {
  async loadModel(onProgress) {
    if (modelInstance) return modelInstance;

    if (loadingPromise) return loadingPromise;

    loadingPromise = (async () => {
      try {
        onProgress?.("Warming up TensorFlow...");
        await tf.ready();
        onProgress?.("Loading COCO-SSD model...");
        // Use lite_mobilenet_v2 — faster load, still accurate enough
        modelInstance = await cocoSsd.load({ base: "lite_mobilenet_v2" });
        onProgress?.("Model ready!");
        return modelInstance;
      } catch (err) {
        loadingPromise = null;
        throw err;
      }
    })();

    return loadingPromise;
  },

  async detect(videoElement) {
    if (!modelInstance) return [];
    if (!videoElement || videoElement.readyState < 2) return [];
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0)
      return [];

    try {
      // Lower threshold to 0.25 so we catch more
      const predictions = await modelInstance.detect(videoElement, 10, 0.25);

      return predictions.map((p) => ({
        ...p,
        isTrash: p.class in TRASH_CLASSES,
        points: TRASH_CLASSES[p.class] ?? 5,
      }));
    } catch {
      return [];
    }
  },

  isModelLoaded: () => !!modelInstance,
  unload() {
    modelInstance = null;
    loadingPromise = null;
  },
};
