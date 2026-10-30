"use client";

import { useActionState } from "react";
import { authenticate } from "@/app/login/actions";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

  return (
    <form action={formAction} className="login-form">
      <input type="hidden" name="redirectTo" value={callbackUrl ?? "/"} />

      <label className="field" htmlFor="login-email">
        Email
      </label>
      <input id="login-email" name="email" type="email" autoComplete="email" required autoFocus />

      <label className="field" htmlFor="login-password">
        Password
      </label>
      <input id="login-password" name="password" type="password" autoComplete="current-password" required />

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <button type="submit" className="primary" disabled={isPending}>
        {isPending ? "A entrar…" : "Entrar"}
      </button>
    </form>
  );
}
