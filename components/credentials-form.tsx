"use client";

import { useActionState } from "react";
import type { AuthState } from "@/lib/actions/auth";

type Props = {
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  submitLabel: string;
  showName?: boolean;
};

export function CredentialsForm({ action, submitLabel, showName }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {showName && (
        <input
          name="name"
          type="text"
          placeholder="Name (optional)"
          autoComplete="name"
          className="rounded-lg border border-gray-300 px-3 py-2"
        />
      )}
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        autoComplete="email"
        className="rounded-lg border border-gray-300 px-3 py-2"
      />
      <input
        name="password"
        type="password"
        required
        placeholder="Password"
        autoComplete={showName ? "new-password" : "current-password"}
        className="rounded-lg border border-gray-300 px-3 py-2"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-black py-2 font-medium text-white disabled:opacity-50"
      >
        {pending ? "…" : submitLabel}
      </button>
    </form>
  );
}
