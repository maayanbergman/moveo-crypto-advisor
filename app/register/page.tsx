import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 p-6 md:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400">
          Moveo Crypto Advisor
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-50">
          Create account
        </h1>
        <p className="mt-1 mb-6 text-sm text-slate-400">
          Register with email, name, and a secure password.
        </p>
        <RegisterForm />
      </div>
    </main>
  );
}
