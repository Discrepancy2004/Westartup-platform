import { AuthForm } from "@/components/auth/auth-form";
import { firstSearchParam } from "@/lib/http/search-params";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <AuthForm
      variant="login"
      nextPath={firstSearchParam(params.next) ?? "/chat"}
      callbackError={firstSearchParam(params.error)}
      errorDetail={firstSearchParam(params.detail)}
    />
  );
}
