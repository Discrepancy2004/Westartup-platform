"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { notifyUser } from "@/lib/notifications/create";

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

  const { data: assignment } = await supabase
    .from("review_assignments")
    .select("id, founder_id, expert_id")
    .eq("id", assignmentId)
    .maybeSingle();

  if (
    !assignment ||
    (assignment.founder_id !== user.id && assignment.expert_id !== user.id)
  ) {
    return { ok: false as const, error: "Assignment not found" };
  }

  const { error } = await supabase.from("review_messages").insert({
    assignment_id: assignmentId,
    sender_id: user.id,
    content,
  });

  if (error) return { ok: false as const, error: error.message };

  const isFounder = assignment.founder_id === user.id;
  const recipientId = isFounder
    ? assignment.expert_id
    : assignment.founder_id;

  await notifyUser({
    userId: recipientId,
    type: isFounder ? "founder_replied" : "expert_replied",
    title: isFounder ? "Founder replied" : "Expert replied",
    body: content.slice(0, 120),
    link: isFounder
      ? `/expert/assignments/${assignmentId}?tab=chat`
      : `/dashboard`,
  });

  revalidatePath("/expert");
  revalidatePath(`/expert/assignments/${assignmentId}`);
  revalidatePath("/dashboard");
  revalidatePath("/expert/notifications");
  return { ok: true as const };
}

export async function markReviewComplete(assignmentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Not signed in" };
  }

  const { data: assignment } = await supabase
    .from("review_assignments")
    .select("id, founder_id, expert_id, status")
    .eq("id", assignmentId)
    .maybeSingle();

  if (
    !assignment ||
    (assignment.founder_id !== user.id && assignment.expert_id !== user.id)
  ) {
    return { ok: false as const, error: "Assignment not found" };
  }

  if (assignment.status === "completed") {
    return { ok: true as const };
  }

  const { error } = await supabase
    .from("review_assignments")
    .update({ status: "completed" })
    .eq("id", assignmentId);

  if (error) return { ok: false as const, error: error.message };

  await notifyUser({
    userId: assignment.founder_id,
    type: "review_completed",
    title: "Review marked complete",
    body: "You can keep chatting with your expert anytime.",
    link: "/dashboard",
  });
  await notifyUser({
    userId: assignment.expert_id,
    type: "review_completed",
    title: "Review marked complete",
    body: "Chat stays open if the founder needs you.",
    link: `/expert/assignments/${assignmentId}`,
  });

  revalidatePath("/expert");
  revalidatePath(`/expert/assignments/${assignmentId}`);
  revalidatePath("/dashboard");
  revalidatePath("/expert/notifications");
  return { ok: true as const };
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Not signed in" };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/expert/notifications");
  return { ok: true as const };
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Not signed in" };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/expert/notifications");
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
    return {
      ok: false as const,
      error: "You already have a pending review request",
    };
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
