import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export default function SignupPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-tertiary">Loading…</p>}>
      <AuthForm variant="signup" />
    </Suspense>
  );
}
