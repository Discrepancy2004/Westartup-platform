import { AuthForm } from "@/components/auth/auth-form";
import { firstSearchParam } from "@/lib/http/search-params";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <AuthForm
      variant="signup"
      nextPath={firstSearchParam(params.next) ?? "/chat"}
      callbackError={firstSearchParam(params.error)}
      errorDetail={firstSearchParam(params.detail)}
    />
  );
}
