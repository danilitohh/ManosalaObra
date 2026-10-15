"use client";

import { useState, type FormEvent } from "react";
import { ShieldCheck, Wrench } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthRole = "client" | "technician";

export function SupabaseAuthPanel({ configured }: { configured: boolean }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<AuthRole>("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!configured || busy) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setBusy(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name.trim(), role },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        if (!data.session) setSuccessMessage("Cuenta creada. Revisa tu correo para confirmar el registro y luego inicia sesión.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No pudimos completar el acceso.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-5 py-12 text-[#19242d]">
      <section className="w-full max-w-[430px] rounded-3xl border border-[#e3e8ec] bg-white p-7 shadow-[0_18px_55px_rgba(40,52,68,0.08)] sm:p-9">
        <div className="flex items-center gap-3 text-[#4d69d8]"><Wrench size={21} /><span className="text-xs font-semibold uppercase tracking-[0.16em]">Manos a la obra</span></div>
        <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71808f]">Marketplace de servicios</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.045em]">{isSignUp ? "Crea tu cuenta" : "Inicia sesión"}</h1>
        <p className="mt-2 text-sm leading-6 text-[#7b8985]">{isSignUp ? "Elige cómo usarás Manos a la obra. Después podrás entrar desde este mismo acceso." : "Usa tu correo y contraseña. Te llevaremos al espacio correspondiente a tu cuenta."}</p>

        {!configured ? (
          <div className="mt-6 rounded-2xl border border-[#eadfbd] bg-[#fff9eb] p-4 text-xs leading-5 text-[#7b6840]">
            <p className="font-semibold">Falta conectar las variables de Supabase</p>
            <p className="mt-2">Agrega <code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> a <code>.env.local</code> y a los entornos de Vercel. No uses la clave <code>service_role</code> en el navegador.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {isSignUp && <label className="block text-xs font-semibold text-[#5d6f69]">Nombre completo<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="input-style mt-2" placeholder="Tu nombre" /></label>}
            {isSignUp && <label className="block text-xs font-semibold text-[#5d6f69]">Quiero usar la app como<select value={role} onChange={(event) => setRole(event.target.value as AuthRole)} className="input-style mt-2"><option value="client">Cliente</option><option value="technician">Técnico</option></select></label>}
            <label className="block text-xs font-semibold text-[#5d6f69]">Correo electrónico<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input-style mt-2" placeholder="tu@correo.com" /></label>
            <label className="block text-xs font-semibold text-[#5d6f69]">Contraseña<input required type="password" minLength={8} autoComplete={isSignUp ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="input-style mt-2" placeholder="Mínimo 8 caracteres" /></label>
            <div className="flex gap-2 rounded-xl bg-[#f1f3f8] px-3 py-2.5 text-[11px] leading-4 text-[#586a9a]"><ShieldCheck size={15} className="mt-0.5 shrink-0" />Tu sesión se valida con Supabase Auth y cada dato se protege con políticas RLS.</div>
            {errorMessage && <p role="alert" className="rounded-xl bg-[#fff0ed] px-3 py-2.5 text-xs text-[#a34b3a]">{errorMessage}</p>}
            {successMessage && <p role="status" className="rounded-xl bg-[#eef7f0] px-3 py-2.5 text-xs text-[#3c7650]">{successMessage}</p>}
            <button type="submit" disabled={busy} className="flex w-full items-center justify-center rounded-xl bg-[#19242d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2a3a49] disabled:opacity-60">{busy ? "Un momento…" : isSignUp ? "Crear cuenta" : "Iniciar sesión"}</button>
          </form>
        )}

        {configured && <button type="button" onClick={() => { setIsSignUp((value) => !value); setErrorMessage(""); setSuccessMessage(""); }} className="mt-5 w-full text-center text-xs font-semibold text-[#4d69d8]">{isSignUp ? "Ya tengo una cuenta · Iniciar sesión" : "¿Primera vez aquí? · Crear cuenta"}</button>}
      </section>
    </main>
  );
}
