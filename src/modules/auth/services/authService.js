import { supabase } from "@/services/supabase/client.js";

export const authService = {
  async register({ email, password, username, schoolId }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, school_id: schoolId } },
    });
    if (error) throw error;
    // school_id saved via trigger metadata — also update profile directly
    if (data.user && schoolId) {
      await supabase
        .from("profiles")
        .update({ school_id: schoolId })
        .eq("id", data.user.id);
    }
    return data;
  },

  async login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Login by school ID — look up email first, then sign in
  async loginBySchoolId({ schoolId, password }) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("school_id", schoolId)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile) throw new Error(`No account found for ID: ${schoolId}`);
    return this.login({ email: profile.email, password });
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

 onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) =>
    callback(event, session)   // ← pass event too
  )
}
};
