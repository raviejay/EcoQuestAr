// file: src/services/api/detectionApi.js
import { supabase } from "@/services/supabase/client.js";

export const detectionApi = {
  async saveDetection({ userId, detections, latitude, longitude }) {
    const records = detections.map((d) => ({
      user_id: userId,
      label: d.class,
      confidence: d.score,
      points_awarded: d.points,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      detected_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("detections").insert(records);
    if (error) throw error;
  },

  async addPointsToUser({ userId, points }) {
    const { error } = await supabase.rpc("increment_points", {
      user_id: userId,
      amount: points,
    });
    if (error) throw error;
  },
};
