"use server";

import { revalidatePath } from "next/cache";
import { getCachedUser } from "@/lib/auth/get-user";
import { createServiceClient } from "@/lib/supabase/admin";

export async function updateDirectoryListing(input: {
  name: string;
  tagline: string;
}) {
  const name = input.name.trim();
  const tagline = input.tagline.trim();

  if (!name || !tagline) {
    return { error: "Name and one-liner are required." };
  }
  if (name.length > 80) {
    return { error: "Name must be 80 characters or fewer." };
  }
  if (tagline.length > 180) {
    return { error: "One-liner must be 180 characters or fewer." };
  }

  const user = await getCachedUser();
  if (!user) {
    return { error: "You must be signed in." };
  }

  try {
    const admin = createServiceClient();
    const { data, error } = await admin
      .from("startup_listings")
      .update({ name, tagline })
      .eq("founder_id", user.id)
      .select("slug")
      .maybeSingle();

    if (error) return { error: error.message };
    if (!data) return { error: "Your company is not in the directory yet." };

    revalidatePath("/companies");
    revalidatePath(`/companies/${data.slug}`);
    revalidatePath("/dashboard");
    return { ok: true as const };
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "Could not update your listing.",
    };
  }
}
