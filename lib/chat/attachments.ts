import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import pdf from "pdf-parse";

const MAX_ATTACHMENT_TEXT_CHARS = 8_000;

export type ParsedChatAttachment = {
  kind: "pdf" | "image";
  name: string;
  summary: string;
};

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncateText(value: string, maxChars = MAX_ATTACHMENT_TEXT_CHARS): string {
  if (value.length <= maxChars) {
    return value;
  }

  return `${value.slice(0, maxChars).trim()}\n\n[Attachment truncated for length]`;
}

async function summarizeImage(file: File): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Image attachments require GEMINI_API_KEY for vision support.");
  }

  const google = createGoogleGenerativeAI({ apiKey });
  const image = new Uint8Array(await file.arrayBuffer());

  const result = await generateText({
    model: google("gemini-2.0-flash"),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Describe this image for a startup advisor chat. Capture all visible text, charts, UI, documents, numbers, and notable visual signals. Keep it factual and concise.",
          },
          {
            type: "image",
            image,
            mediaType: file.type || "image/png",
          },
        ],
      },
    ],
  });

  const text = normalizeText(result.text);
  if (!text) {
    throw new Error(`Could not read ${file.name}.`);
  }

  return truncateText(text, 3_500);
}

async function extractPdfText(file: File): Promise<string> {
  const parsed = await pdf(Buffer.from(await file.arrayBuffer()));
  const text = normalizeText(parsed.text ?? "");

  if (!text) {
    throw new Error(`No readable text found in ${file.name}.`);
  }

  return truncateText(text);
}

export async function parseChatAttachments(
  files: File[],
): Promise<ParsedChatAttachment[]> {
  return Promise.all(
    files.map(async (file) => {
      if (file.type === "application/pdf") {
        return {
          kind: "pdf" as const,
          name: file.name,
          summary: await extractPdfText(file),
        };
      }

      if (file.type.startsWith("image/")) {
        return {
          kind: "image" as const,
          name: file.name,
          summary: await summarizeImage(file),
        };
      }

      throw new Error(`${file.name} is not supported yet. Use PDF or image files.`);
    }),
  );
}

export function buildAttachmentPromptBlock(
  attachments: ParsedChatAttachment[],
): string {
  if (attachments.length === 0) {
    return "";
  }

  return attachments
    .map(
      (attachment) =>
        `Attachment (${attachment.kind.toUpperCase()}): ${attachment.name}\n${attachment.summary}`,
    )
    .join("\n\n");
}
