"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { SupabaseAuthPanel } from "@/components/auth/SupabaseAuthPanel";

export function MarketplaceEntry() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(Boolean(supabase));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(sessionError.message);
      setUserId(data.session?.user.id ?? null);
      setCheckingSession(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setError("");
      setUserId(session?.user.id ?? null);
      setCheckingSession(false);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !userId) return;
    let active = true;
    void supabase.from("profiles").select("role").eq("id", userId).single().then(({ data, error: profileError }) => {
      if (!active) return;
      if (profileError) {
        setError(`No pudimos leer el rol de tu cuenta. Verifica que la migración de Supabase esté aplicada. ${profileError.message}`);
        return;
      }
      router.replace(data.role === "technician" ? "/tecnico" : "/cliente");
    });
    return () => {
      active = false;
    };
  }, [router, supabase, userId]);

  if (!isSupabaseConfigured()) return <SupabaseAuthPanel configured={false} />;
  if (checkingSession || userId) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-5 text-sm text-[#6f8178]">{error || "Revisando tu cuenta…"}</main>;
  }
  return <div>{error && <p role="alert" className="fixed left-1/2 top-5 z-10 w-[min(92vw,430px)] -translate-x-1/2 rounded-xl bg-[#fff0ed] px-4 py-3 text-xs text-[#a34b3a]">{error}</p>}<SupabaseAuthPanel configured /></div>;
}
