"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { sendExpertApprovedEmail } from "@/lib/email/expert-approved";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { ok: false as const, error: "Admin only" };
  }

  return { ok: true as const, userId: user.id, supabase };
}

export async function approveExpertApplication(applicationId: string) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const admin = createServiceClient();
  const { data: app, error: fetchError } = await admin
    .from("expert_applications")
    .select("id, user_id, full_name, status")
    .eq("id", applicationId)
    .maybeSingle();

  if (fetchError || !app) {
    return { ok: false as const, error: fetchError?.message ?? "Not found" };
  }
  if (app.status !== "pending") {
    return { ok: false as const, error: "Application is not pending" };
  }

  const { error: appError } = await admin
    .from("expert_applications")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: gate.userId,
    })
    .eq("id", applicationId);

  if (appError) return { ok: false as const, error: appError.message };

  const { error: roleError } = await admin
    .from("profiles")
    .update({ role: "expert", first_login: false })
    .eq("id", app.user_id);

  if (roleError) return { ok: false as const, error: roleError.message };

  const { data: profile } = await admin
    .from("profiles")
    .select("email")
    .eq("id", app.user_id)
    .maybeSingle();

  if (profile?.email) {
    await sendExpertApprovedEmail({
      to: profile.email,
      fullName: app.full_name,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/experts");
  revalidatePath("/admin/experts/applications");
  revalidatePath("/admin/experts/reviews");
  revalidatePath("/admin/experts/assignments");
  revalidatePath("/admin/founders");
  return { ok: true as const };
}

export async function rejectExpertApplication(applicationId: string) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const admin = createServiceClient();
  const { data: app, error: fetchError } = await admin
    .from("expert_applications")
    .select("id, status")
    .eq("id", applicationId)
    .maybeSingle();

  if (fetchError || !app) {
    return { ok: false as const, error: fetchError?.message ?? "Not found" };
  }
  if (app.status !== "pending") {
    return { ok: false as const, error: "Application is not pending" };
  }

  const { error } = await admin
    .from("expert_applications")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: gate.userId,
    })
    .eq("id", applicationId);

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/experts/applications");
  return { ok: true as const };
}

export async function assignExpertToRequest(params: {
  requestId: string;
  expertId: string;
}) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const admin = createServiceClient();
  const { data: request, error: reqError } = await admin
    .from("review_requests")
    .select("id, founder_id, status")
    .eq("id", params.requestId)
    .maybeSingle();

  if (reqError || !request) {
    return { ok: false as const, error: reqError?.message ?? "Request not found" };
  }
  if (request.status !== "pending") {
    return { ok: false as const, error: "Request is not pending" };
  }

  const { data: expert } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", params.expertId)
    .maybeSingle();

  if (!expert || expert.role !== "expert") {
    return { ok: false as const, error: "Selected user is not an expert" };
  }

  const { error: assignError } = await admin.from("review_assignments").insert({
    request_id: request.id,
    founder_id: request.founder_id,
    expert_id: params.expertId,
    status: "active",
  });

  if (assignError) return { ok: false as const, error: assignError.message };

  const { error: statusError } = await admin
    .from("review_requests")
    .update({ status: "assigned" })
    .eq("id", request.id);

  if (statusError) return { ok: false as const, error: statusError.message };

  revalidatePath("/admin");
  revalidatePath("/admin/experts/reviews");
  revalidatePath("/admin/experts/assignments");
  revalidatePath("/admin/founders");
  revalidatePath("/expert");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

/** Manual assign: create review request + assignment for an unassigned founder. */
export async function assignFounderToExpert(params: {
  founderId: string;
  expertId: string;
}) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const admin = createServiceClient();

  const { data: founder } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", params.founderId)
    .maybeSingle();

  if (!founder || founder.role !== "founder") {
    return { ok: false as const, error: "Selected user is not a founder" };
  }

  const { data: expert } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", params.expertId)
    .maybeSingle();

  if (!expert || expert.role !== "expert") {
    return { ok: false as const, error: "Selected user is not an expert" };
  }

  const { data: existing } = await admin
    .from("review_assignments")
    .select("id")
    .eq("founder_id", params.founderId)
    .eq("status", "active")
    .maybeSingle();

  if (existing) {
    return {
      ok: false as const,
      error: "Founder already has an active assignment",
    };
  }

  const { data: request, error: reqError } = await admin
    .from("review_requests")
    .insert({
      founder_id: params.founderId,
      note: "Assigned by admin",
      status: "assigned",
    })
    .select("id")
    .single();

  if (reqError || !request) {
    return {
      ok: false as const,
      error: reqError?.message ?? "Could not create review request",
    };
  }

  const { error: assignError } = await admin.from("review_assignments").insert({
    request_id: request.id,
    founder_id: params.founderId,
    expert_id: params.expertId,
    status: "active",
  });

  if (assignError) {
    await admin.from("review_requests").delete().eq("id", request.id);
    return { ok: false as const, error: assignError.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/experts/reviews");
  revalidatePath("/admin/experts/assignments");
  revalidatePath("/admin/founders");
  revalidatePath(`/admin/founders/${params.founderId}`);
  revalidatePath("/expert");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
