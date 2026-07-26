/**
 * Best-effort approval email. Requires RESEND_API_KEY + EMAIL_FROM.
 * Never throws — approval must succeed even if mail fails.
 */
export async function sendExpertApprovedEmail(params: {
  to: string;
  fullName: string;
}): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!apiKey || !from) {
    return { sent: false, error: "Email not configured (RESEND_API_KEY / EMAIL_FROM)" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: params.to,
        subject: "You’re approved as an Industry Expert — WeStartup",
        html: `
          <p>Hi ${escapeHtml(params.fullName)},</p>
          <p>Your Industry Expert application has been approved.</p>
          <p><a href="${appUrl}/expert/dna">Open Expert DNA Studio</a></p>
          <p>— WeStartup</p>
        `,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { sent: false, error: text || res.statusText };
    }
    return { sent: true };
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : "Email send failed",
    };
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
