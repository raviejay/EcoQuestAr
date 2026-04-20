// file: src/modules/gamification/services/gamificationService.js
import { supabase } from "@/services/supabase/client.js";

export const gamificationService = {
  async getLeaderboard(limit = 20) {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("rank", { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async getUserRank(userId) {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("rank, points, level")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getRewards() {
    const { data, error } = await supabase
      .from("rewards")
      .select("*")
      .eq("is_active", true)
      .order("cost", { ascending: true });
    if (error) throw error;
    return data;
  },

  async getMyRedemptions(userId) {
    const { data, error } = await supabase
      .from("redemptions")
      .select("*, rewards(*)")
      .eq("user_id", userId)
      .order("redeemed_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async redeemReward(userId, rewardId) {
    const { data, error } = await supabase.rpc("redeem_reward", {
      p_user_id: userId,
      p_reward_id: rewardId,
    });
    if (error) throw error;
    return data;
  },
};
