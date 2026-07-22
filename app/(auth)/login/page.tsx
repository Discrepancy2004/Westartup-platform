import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-tertiary">Loading…</p>}>
      <AuthForm variant="login" />
    </Suspense>
  );
}
