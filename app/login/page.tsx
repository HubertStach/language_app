import Link from "next/link";
import { CredentialsForm } from "@/components/credentials-form";
import { loginAction, googleSignIn } from "@/lib/actions/auth";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Log in</h1>

      <CredentialsForm action={loginAction} submitLabel="Log in" />

      {process.env.AUTH_GOOGLE_ID && (
        <form action={googleSignIn}>
          <button
            type="submit"
            className="w-full rounded-lg border border-gray-300 py-2 font-medium"
          >
            Continue with Google
          </button>
        </form>
      )}

      <p className="text-center text-sm text-gray-600">
        No account?{" "}
        <Link href="/signup" className="font-medium underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
