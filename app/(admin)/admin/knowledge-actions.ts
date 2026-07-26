"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { archiveDnaCapsuleInIndex } from "@/lib/rag/dna-index";
import { ingestDocument } from "@/lib/rag/ingest";

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

export async function archiveDnaCapsule(capsuleId: string) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const admin = createServiceClient();
  const { error } = await admin
    .from("expert_dna_capsules")
    .update({
      status: "archived",
      updated_at: new Date().toISOString(),
    })
    .eq("id", capsuleId);

  if (error) return { ok: false as const, error: error.message };

  await archiveDnaCapsuleInIndex(admin, capsuleId);

  revalidatePath("/admin/knowledge");
  revalidatePath("/admin/knowledge/dna");
  return { ok: true as const };
}

export async function setKnowledgeDocumentIgnored(
  documentId: string,
  ignored: boolean,
) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const admin = createServiceClient();
  const { error } = await admin
    .from("knowledge_documents")
    .update({
      ignored,
      status: ignored ? "ignored" : "indexed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId);

  if (error) return { ok: false as const, error: error.message };

  // Chunks stay; match_rag_chunks filters ignored docs
  revalidatePath("/admin/knowledge");
  revalidatePath("/admin/knowledge/corpus");
  return { ok: true as const };
}

export async function uploadKnowledgeFiles(formData: FormData) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const startupName = String(formData.get("startup_name") ?? "").trim() || null;
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return { ok: false as const, error: "No files selected" };
  }
  if (files.length > 100) {
    return { ok: false as const, error: "Max 100 files per batch" };
  }

  const admin = createServiceClient();
  const results: Array<{ name: string; ok: boolean; detail: string }> = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await ingestDocument(admin, {
      fileName: file.name,
      buffer,
      startupName,
      metadata: { uploaded_by: gate.userId, via: "admin_upload" },
    });

    if (!result.ok) {
      results.push({ name: file.name, ok: false, detail: result.error });
    } else if (result.skipped) {
      results.push({ name: file.name, ok: true, detail: result.reason });
    } else if (result.duplicate) {
      results.push({ name: file.name, ok: true, detail: "Duplicate — skipped" });
    } else {
      results.push({
        name: file.name,
        ok: true,
        detail: `Indexed (${result.chunkCount} chunks)`,
      });
    }
  }

  revalidatePath("/admin/knowledge");
  revalidatePath("/admin/knowledge/corpus");
  return { ok: true as const, results };
}
