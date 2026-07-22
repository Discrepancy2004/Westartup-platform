import { NextResponse } from "next/server";
import { dashboardUpdateProposalSchema } from "@/lib/chat/dashboard-update";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = dashboardUpdateProposalSchema.parse(await request.json());
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const rows = body.artifacts.map((artifact) => ({
      user_id: user.id,
      conversation_id: conversation?.id ?? null,
      kind: artifact.kind,
      title: artifact.title,
      summary: artifact.summary ?? null,
      chart_data: artifact.chartData,
      updated_at: new Date().toISOString(),
    }));

    let { error } = await supabase.from("artifacts").upsert(rows, {
      onConflict: "user_id,kind",
    });

    if (error) {
      const admin = createServiceClient();
      const adminResult = await admin.from("artifacts").upsert(rows, {
        onConflict: "user_id,kind",
      });
      error = adminResult.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Invalid update payload",
      },
      { status: 400 },
    );
  }
}
