import { supabase } from "@/services/supabase/client.js";

export const submissionApi = {
  async uploadProofPhoto(userId, blob) {
    const filename = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
    const { error } = await supabase.storage
      .from("proof-photos")
      .upload(filename, blob, { contentType: "image/jpeg" });
    if (error) throw error;
    const {
      data: { publicUrl },
    } = supabase.storage.from("proof-photos").getPublicUrl(filename);
    return publicUrl;
  },

  async submitForReview({
    userId,
    items,
    proofPhotoUrl,
    selfiePhotoUrl,
    latitude,
    longitude,
    submissionType = "ai",
  }) {
    const totalPoints =
      submissionType === "manual" ? 0 : items.reduce((s, i) => s + i.points, 0);
    const { data, error } = await supabase
      .from("submissions")
      .insert({
        user_id: userId,
        detected_items: items,
        proof_photo_url: proofPhotoUrl,
        selfie_photo_url: selfiePhotoUrl ?? null,
        latitude,
        longitude,
        total_points: totalPoints,
        submission_type: submissionType,
        status: "pending",
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getMySubmissions(userId) {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAllSubmissions() {
    // Step 1: get all submissions
    const { data: subs, error } = await supabase
      .from("submissions")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (error) throw error;

    // Step 2: get all unique user profiles separately (avoids FK join issue)
    const userIds = [...new Set(subs.map((s) => s.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, email")
      .in("id", userIds);

    const profileMap = Object.fromEntries(
      (profiles ?? []).map((p) => [p.id, p]),
    );

    // Step 3: merge
    return subs.map((s) => ({ ...s, profiles: profileMap[s.user_id] ?? null }));
  },

  async approveSubmission(submissionId, adminId, note = "", points = null) {
  const updateData = {
    status: "approved",
    reviewed_by: adminId,
    admin_note: note,
    reviewed_at: new Date().toISOString(),
  };

  if (points !== null) {
    updateData.total_points = points; // 🔥 THIS FIXES YOUR ISSUE
  }

  const { data, error } = await supabase
    .from("submissions")
    .update(updateData)
    .eq("id", submissionId)
    .select()
    .single();

  if (error) throw error;
  return data;
},

  async rejectSubmission(submissionId, adminId, note = "") {
    const { data, error } = await supabase.rpc("reject_submission", {
      p_submission_id: submissionId,
      p_admin_id: adminId,
      p_note: note,
    });
    if (error) throw error;
    return data;
  },
};
