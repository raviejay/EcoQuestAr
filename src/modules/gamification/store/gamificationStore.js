// file: src/modules/gamification/store/gamificationStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { gamificationService } from "@/modules/gamification/services/gamificationService.js";

export const useGamificationStore = defineStore("gamification", () => {
  const leaderboard = ref([]);
  const rewards = ref([]);
  const myRedemptions = ref([]);
  const userRank = ref(null);
  const loading = ref(false);
  const error = ref(null);

  async function fetchLeaderboard() {
    loading.value = true;
    try {
      leaderboard.value = await gamificationService.getLeaderboard();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchUserRank(userId) {
    try {
      userRank.value = await gamificationService.getUserRank(userId);
    } catch (err) {
      error.value = err.message;
    }
  }

  async function fetchRewards() {
    loading.value = true;
    try {
      rewards.value = await gamificationService.getRewards();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMyRedemptions(userId) {
    try {
      myRedemptions.value = await gamificationService.getMyRedemptions(userId);
    } catch (err) {
      error.value = err.message;
    }
  }

  async function redeemReward(userId, rewardId) {
    const result = await gamificationService.redeemReward(userId, rewardId);
    if (result?.success) {
      await fetchRewards();
      await fetchMyRedemptions(userId);
    }
    return result;
  }

  return {
    leaderboard,
    rewards,
    myRedemptions,
    userRank,
    loading,
    error,
    fetchLeaderboard,
    fetchUserRank,
    fetchRewards,
    fetchMyRedemptions,
    redeemReward,
  };
});
