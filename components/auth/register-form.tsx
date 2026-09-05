"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { registerSchema } from "@/lib/validations";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setError(null);
    const parsed = registerSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "name" || key === "email" || key === "password") {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setPending(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Registration failed");
      }

      router.push("/onboarding");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4"
      noValidate
      aria-busy={pending}
    >
      <div>
        <label htmlFor="register-name" className="mb-1.5 block text-sm text-slate-300">
          Name
        </label>
        <input
          id="register-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? "register-name-error" : undefined}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={pending}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none ring-cyan-500/40 focus-visible:ring-2 disabled:opacity-60"
        />
        {fieldErrors.name && (
          <p id="register-name-error" className="mt-1 text-xs text-rose-400" role="alert">
            {fieldErrors.name}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="register-email" className="mb-1.5 block text-sm text-slate-300">
          Email
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={
            fieldErrors.email ? "register-email-error" : undefined
          }
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={pending}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none ring-cyan-500/40 focus-visible:ring-2 disabled:opacity-60"
        />
        {fieldErrors.email && (
          <p id="register-email-error" className="mt-1 text-xs text-rose-400" role="alert">
            {fieldErrors.email}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="register-password"
          className="mb-1.5 block text-sm text-slate-300"
        >
          Password
        </label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,}"
          title="At least 8 characters with a letter and a number"
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={
            fieldErrors.password
              ? "register-password-error register-password-hint"
              : "register-password-hint"
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={pending}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none ring-cyan-500/40 focus-visible:ring-2 disabled:opacity-60"
        />
        <p id="register-password-hint" className="mt-1 text-xs text-slate-500">
          At least 8 characters with a letter and a number.
        </p>
        {fieldErrors.password && (
          <p
            id="register-password-error"
            className="mt-1 text-xs text-rose-400"
            role="alert"
          >
            {fieldErrors.password}
          </p>
        )}
      </div>
      {error && (
        <p className="text-sm text-rose-400" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        aria-disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <Spinner className="h-4 w-4" label="Creating account" />}
        {pending ? "Creating account..." : "Create account"}
      </button>
      <p className="text-center text-sm text-slate-400">
        Already registered?{" "}
        <Link
          href="/login"
          className="text-cyan-300 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
