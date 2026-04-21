// file: src/modules/maps/services/hotspotService.js
import { supabase } from "@/services/supabase/client.js";

export const hotspotService = {
  async getHotspots() {
    const { data, error } = await supabase
      .from("hotspots")
      .select("*")
      .order("detection_count", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getHeatmapPoints() {
    const { data, error } = await supabase.from("heatmap_points").select("*");
    if (error) throw error;
    return data;
  },

  async getMyDetections(userId) {
    const { data, error } = await supabase
      .from("detections")
      .select("latitude, longitude, label, points_awarded, detected_at")
      .eq("user_id", userId)
      .not("latitude", "is", null)
      .order("detected_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data;
  },
};
