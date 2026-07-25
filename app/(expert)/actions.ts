"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function submitExpertApplication(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Not signed in" };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const cv = formData.get("cv");

  if (!fullName || !company) {
    return { ok: false as const, error: "Name and company are required" };
  }

  const { data: existing } = await supabase
    .from("expert_applications")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.status === "pending" || existing?.status === "approved") {
    return { ok: false as const, error: "Application already submitted" };
  }

  let cvPath: string | null = null;
  if (cv instanceof File && cv.size > 0) {
    const ext = cv.name.split(".").pop()?.toLowerCase() || "pdf";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("expert-cvs")
      .upload(path, cv, { upsert: true });
    if (uploadError) {
      return { ok: false as const, error: uploadError.message };
    }
    cvPath = path;
  }

  if (existing?.status === "rejected") {
    const { error } = await supabase
      .from("expert_applications")
      .update({
        full_name: fullName,
        company,
        cv_path: cvPath,
        status: "pending",
        reviewed_at: null,
        reviewed_by: null,
        founder_continued_at: null,
      })
      .eq("id", existing.id);
    if (error) return { ok: false as const, error: error.message };
  } else {
    const { error } = await supabase.from("expert_applications").insert({
      user_id: user.id,
      full_name: fullName,
      company,
      cv_path: cvPath,
      status: "pending",
    });
    if (error) return { ok: false as const, error: error.message };
  }

  revalidatePath("/expert/pending");
  redirect("/expert/pending");
}

export async function continueAsFounder() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Not signed in" };
  }

  const { error } = await supabase
    .from("expert_applications")
    .update({ founder_continued_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("status", "rejected");

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/onboarding");
  redirect("/onboarding");
}

export async function sendReviewMessage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Not signed in" };
  }

  const assignmentId = String(formData.get("assignment_id") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  if (!assignmentId || !content) {
    return { ok: false as const, error: "Message required" };
  }

  const { error } = await supabase.from("review_messages").insert({
    assignment_id: assignmentId,
    sender_id: user.id,
    content,
  });

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/expert");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function requestExpertReview(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Not signed in" };
  }

  const note = String(formData.get("note") ?? "").trim() || null;

  const { data: open } = await supabase
    .from("review_requests")
    .select("id")
    .eq("founder_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (open) {
    return { ok: false as const, error: "You already have a pending review request" };
  }

  const { error } = await supabase.from("review_requests").insert({
    founder_id: user.id,
    note,
    status: "pending",
  });

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { ok: true as const };
}
