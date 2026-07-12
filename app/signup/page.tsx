import Link from "next/link";
import { CredentialsForm } from "@/components/credentials-form";
import { signupAction, googleSignIn } from "@/lib/actions/auth";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Create account</h1>

      <CredentialsForm action={signupAction} submitLabel="Sign up" showName />

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
        Have an account?{" "}
        <Link href="/login" className="font-medium underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
