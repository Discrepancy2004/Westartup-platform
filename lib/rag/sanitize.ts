/**
 * Normalize text for embedding + Postgres/JSON transport.
 * Malformed PDF extracts sometimes include invalid `\uXXXX` sequences or
 * lone surrogates that break Gemini request JSON or jsonb inserts.
 */
export function sanitizeRagText(input: string): string {
  let text = input.normalize("NFC");

  // Replace lone surrogates
  text = text.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, "\uFFFD");
  text = text.replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "\uFFFD");

  // Neutralize invalid Unicode escape-looking sequences in raw text
  // (e.g. "\users" or "\uZZZZ") that some JSON layers mis-handle.
  text = text.replace(/\\u([0-9a-fA-F]{0,3}([^0-9a-fA-F]|$))/g, "\\\\u$1");

  // Strip most control chars except tab/newline/carriage return
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ");

  return text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
