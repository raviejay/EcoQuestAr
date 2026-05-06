import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authService } from "@/modules/auth/services/authService.js";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const profile = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const isAuthenticated = computed(() => !!user.value);
  const displayName = computed(
    () => profile.value?.username ?? user.value?.email ?? "",
  );

  const schoolId = computed(() => profile.value?.school_id);

  async function fetchProfile(userId) {
    try {
      profile.value = await authService.getProfile(userId); // null-safe now
    } catch {
      profile.value = null;
    }
  }

  async function register(credentials) {
    loading.value = true;
    error.value = null;
    try {
      const data = await authService.register(credentials);
      user.value = data.user;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function login(credentials) {
    loading.value = true;
    error.value = null;
    try {
      const data = await authService.login(credentials);
      user.value = data.user;
      await fetchProfile(data.user.id);
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    loading.value = true;
    try {
      await authService.logout();
      user.value = null;
      profile.value = null;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

 async function initAuth() {
  try {
    const session = await authService.getSession()
    if (session?.user) {
      user.value = session.user
      await fetchProfile(session.user.id)
    }
  } catch {
    user.value = null
    profile.value = null
  }
}

function startAuthListener() {
  authService.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      user.value = session?.user ?? null
      if (session?.user) await fetchProfile(session.user.id)
    }
    if (event === 'SIGNED_OUT') {
      user.value = null
      profile.value = null
    }
  })
}

async function loginBySchoolId({ schoolId, password }) {
  loading.value = true
  error.value = null
  try {
    const data = await authService.loginBySchoolId({ schoolId, password })
    user.value = data.user
    await fetchProfile(data.user.id)
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    loading.value = false
  }
}

  function clearError() {
    error.value = null;
  }

  

  return {
    user,
    profile,
    loading,
    error,
    isAuthenticated,
    displayName,
    schoolId,
    register,
    login,
    logout,
    initAuth,
    clearError,
  startAuthListener,
  loginBySchoolId,
  };
});
