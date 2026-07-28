import { NextResponse } from "next/server";
import {
  buildAttachmentPromptBlock,
  parseChatAttachments,
} from "@/lib/chat/attachments";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((value): value is File => value instanceof File && value.size > 0);

    if (files.length === 0) {
      return NextResponse.json({ attachments: [], promptBlock: "" });
    }

    const attachments = await parseChatAttachments(files);

    return NextResponse.json({
      attachments,
      promptBlock: buildAttachmentPromptBlock(attachments),
    });
  } catch (err) {
    console.error("[chat][attachments] failed", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not process attachments",
      },
      { status: 500 },
    );
  }
}
