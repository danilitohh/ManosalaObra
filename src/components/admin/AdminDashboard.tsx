"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, BriefcaseBusiness, ClipboardList, LogOut, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

type AdminProfile = { id: string; display_name: string; role: string; rating: number; verified: boolean; is_available: boolean; created_at: string };
type AdminRequest = { id: string; title: string; category: string; sector: string; budget_cop: number; status: string; payment_method: string; created_at: string };
type AdminData = { profiles: AdminProfile[]; requests: AdminRequest[]; totalProfiles: number; totalRequests: number; activeRequests: number; activeServices: number; availableTechnicians: number };
type AdminRefreshTarget = "profiles" | "requests" | "services";

const PAGE_SIZE = 8;
const EMPTY_DATA: AdminData = { profiles: [], requests: [], totalProfiles: 0, totalRequests: 0, activeRequests: 0, activeServices: 0, availableTechnicians: 0 };
const formatCOP = (amount: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);
const formatDate = (value: string) => new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const roleLabel = (role: string) => ({ admin: "Administrador", technician: "Técnico", client: "Cliente" })[role] ?? role;

function Metric({ label, value, icon: Icon, note }: { label: string; value: string | number; icon: typeof Users; note: string }) {
  return <article className="rounded-2xl border border-[#e2e8e6] bg-white p-5 shadow-[0_8px_28px_rgba(31,54,48,0.04)]"><div className="flex items-center justify-between"><p className="text-xs font-medium text-[#778780]">{label}</p><Icon size={18} className="text-[#4d69d8]" /></div><p className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#19242d]">{value}</p><p className="mt-1 text-[11px] text-[#9aa6a0]">{note}</p></article>;
}

function PageControls({ page, total, loading, label, onChange }: { page: number; total: number; loading: boolean; label: string; onChange: (page: number) => void }) {
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return <div className="flex items-center justify-between gap-3 border-t border-[#edf0ef] px-5 py-3">
    <p className="text-[10px] text-[#87938d]">Página {page + 1} de {pageCount} · {total} {label}</p>
    <div className="flex gap-2">
      <button type="button" aria-label={`Ver ${label} anteriores`} disabled={page === 0 || loading} onClick={() => onChange(page - 1)} className="rounded-lg border border-[#dfe6e3] px-3 py-1.5 text-[10px] font-semibold text-[#53677a] disabled:cursor-not-allowed disabled:opacity-45">Anterior</button>
      <button type="button" aria-label={`Ver ${label} siguientes`} disabled={(page + 1) * PAGE_SIZE >= total || loading} onClick={() => onChange(page + 1)} className="rounded-lg border border-[#dfe6e3] px-3 py-1.5 text-[10px] font-semibold text-[#53677a] disabled:cursor-not-allowed disabled:opacity-45">Siguiente</button>
    </div>
  </div>;
}

export function AdminDashboard() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(Boolean(supabase));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<AdminData>(EMPTY_DATA);
  const [profilePage, setProfilePage] = useState(0);
  const [requestPage, setRequestPage] = useState(0);
  const refreshRef = useRef<(targets?: AdminRefreshTarget[]) => Promise<void>>(async () => {});

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.auth.getSession().then(({ data: sessionData }) => {
      if (!active) return;
      setUserId(sessionData.session?.user.id ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setRole(null);
      setUserId(session?.user.id ?? null);
      setAuthLoading(false);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [supabase]);

  useEffect(() => {
    if (!isSupabaseConfigured() || (!authLoading && !userId)) router.replace("/");
  }, [authLoading, router, userId]);

  useEffect(() => {
    if (!supabase || !userId) return;
    let active = true;
    void supabase.from("profiles").select("role").eq("id", userId).single().then(({ data: profile, error: profileError }) => {
      if (!active) return;
      if (profileError) setError(`No pudimos comprobar tu rol de administrador. ¿Ejecutaste la migración admin? ${profileError.message}`);
      else {
        setRole(profile.role);
        if (profile.role !== "admin") router.replace(profile.role === "technician" ? "/tecnico" : "/cliente");
      }
    });
    return () => { active = false; };
  }, [router, supabase, userId]);

  const refresh = useCallback(async (targets?: AdminRefreshTarget[]) => {
    if (!supabase || role !== "admin") return;
    const requested = new Set(targets ?? ["profiles", "requests", "services"]);
    const includeProfiles = requested.has("profiles");
    const includeRequests = requested.has("requests");
    const includeServices = requested.has("services");
    if (includeProfiles || includeRequests) setLoading(true);
    const [profileResult, requestResult, activeRequestResult, activeServiceResult, availableTechnicianResult] = await Promise.all([
      includeProfiles ? supabase.from("profiles").select("id, display_name, role, rating, verified, is_available, created_at", { count: "exact" }).order("created_at", { ascending: false }).order("id", { ascending: false }).range(profilePage * PAGE_SIZE, profilePage * PAGE_SIZE + PAGE_SIZE - 1) : Promise.resolve(null),
      includeRequests ? supabase.from("service_requests").select("id, title, category, sector, budget_cop, status, payment_method, created_at", { count: "exact" }).order("created_at", { ascending: false }).order("id", { ascending: false }).range(requestPage * PAGE_SIZE, requestPage * PAGE_SIZE + PAGE_SIZE - 1) : Promise.resolve(null),
      includeRequests ? supabase.from("service_requests").select("id", { count: "exact", head: true }).in("status", ["published", "awaiting_balance"]) : Promise.resolve(null),
      includeServices ? supabase.from("services").select("id", { count: "exact", head: true }).neq("status", "completed").neq("status", "cancelled") : Promise.resolve(null),
      includeProfiles ? supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "technician").eq("is_available", true) : Promise.resolve(null),
    ]);
    const queryError = profileResult?.error ?? requestResult?.error ?? activeRequestResult?.error ?? activeServiceResult?.error ?? availableTechnicianResult?.error;
    if (queryError) setError(queryError.message);
    else {
      setError("");
      setData((current) => ({
        ...current,
        ...(profileResult && { profiles: (profileResult.data ?? []) as AdminProfile[], totalProfiles: profileResult.count ?? 0 }),
        ...(requestResult && { requests: (requestResult.data ?? []) as AdminRequest[], totalRequests: requestResult.count ?? 0 }),
        ...(activeRequestResult && { activeRequests: activeRequestResult.count ?? 0 }),
        ...(activeServiceResult && { activeServices: activeServiceResult.count ?? 0 }),
        ...(availableTechnicianResult && { availableTechnicians: availableTechnicianResult.count ?? 0 }),
      }));
    }
    if (includeProfiles || includeRequests) setLoading(false);
  }, [profilePage, requestPage, role, supabase]);
  useEffect(() => { refreshRef.current = refresh; }, [refresh]);

  useEffect(() => {
    if (role === "admin") void Promise.resolve().then(() => refresh());
  }, [refresh, role]);

  useEffect(() => {
    if (!supabase || role !== "admin") return;
    let refreshTimer: number | undefined;
    const pendingTargets = new Set<AdminRefreshTarget>();
    const scheduleRefresh = (target: AdminRefreshTarget) => {
      pendingTargets.add(target);
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        const targets = [...pendingTargets];
        pendingTargets.clear();
        void refreshRef.current(targets);
      }, 300);
    };
    let hasConnectedOnce = false;
    const channel = supabase.channel("admin-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => scheduleRefresh("profiles"))
      .on("postgres_changes", { event: "*", schema: "public", table: "service_requests" }, () => scheduleRefresh("requests"))
      .on("postgres_changes", { event: "*", schema: "public", table: "services" }, () => scheduleRefresh("services"))
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          if (hasConnectedOnce) void refreshRef.current();
          hasConnectedOnce = true;
        }
      });
    return () => {
      window.clearTimeout(refreshTimer);
      void supabase.removeChannel(channel);
    };
  }, [role, supabase]);

  if (!isSupabaseConfigured() || authLoading || !userId || !role || role !== "admin") {
    return <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-5 text-sm text-[#6f8178]">{error || "Verificando acceso de administración…"}</main>;
  }

  return <main className="min-h-screen bg-[#f6f8fa] text-[#19242d]">
    <header className="border-b border-[#e4e9e8] bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8"><div className="flex items-center gap-3"><ShieldCheck className="text-[#4d69d8]" size={22} /><div><p className="text-sm font-semibold">Manos a la obra</p><p className="text-[11px] text-[#82908b]">Consola de administración</p></div></div><div className="flex items-center gap-3"><span className="hidden items-center gap-1.5 text-xs text-[#5a9667] sm:flex"><Activity size={14} />Panel privado</span><button type="button" onClick={() => { void supabase?.auth.signOut(); }} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#64746e] hover:bg-[#f2f4f4]"><LogOut size={15} />Salir</button></div></div></header>
    <div className="mx-auto max-w-7xl space-y-8 px-5 py-8 md:px-8">
      <section className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4d69d8]">Panel del propietario</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.055em]">Resumen del marketplace</h1><p className="mt-2 text-sm text-[#81908a]">Actividad y cuentas actualizadas en tiempo real.</p></div><button type="button" disabled={loading} onClick={() => { void refresh(); }} className="flex items-center gap-2 rounded-xl border border-[#dfe6e3] bg-white px-4 py-2.5 text-xs font-semibold text-[#52655e] hover:bg-[#f8faf9] disabled:opacity-60"><RefreshCw size={14} className={loading ? "animate-spin" : ""} />Actualizar</button></section>
      {error && <p role="alert" className="rounded-xl border border-[#f0d8d0] bg-[#fff3ef] px-4 py-3 text-xs text-[#a34b3a]">{error}</p>}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Cuentas" value={data.totalProfiles} icon={Users} note="Clientes, técnicos y administración" /><Metric label="Técnicos disponibles" value={data.availableTechnicians} icon={ShieldCheck} note="Con el radar activado" /><Metric label="Solicitudes abiertas" value={data.activeRequests} icon={ClipboardList} note="Publicadas o pendientes de saldo" /><Metric label="Servicios activos" value={data.activeServices} icon={BriefcaseBusiness} note="Aún no completados ni cancelados" /></section>
      <section className="grid gap-6 xl:grid-cols-[1fr_1.1fr]"><div className="overflow-hidden rounded-2xl border border-[#e2e8e6] bg-white"><div className="border-b border-[#edf0ef] px-5 py-4"><h2 className="text-sm font-semibold">Cuentas recientes</h2></div><div className="divide-y divide-[#f0f2f1]">{data.profiles.map((profile) => <div key={profile.id} className="flex items-center justify-between gap-3 px-5 py-3"><div><p className="text-xs font-semibold">{profile.display_name}</p><p className="mt-1 text-[10px] text-[#93a09a]">{formatDate(profile.created_at)}</p></div><span className="rounded-full bg-[#f0f3ff] px-2.5 py-1 text-[10px] font-semibold text-[#4d69d8]">{roleLabel(profile.role)}</span></div>)}{!loading && data.profiles.length === 0 && <p className="p-5 text-xs text-[#82908b]">No hay cuentas para mostrar.</p>}<PageControls page={profilePage} total={data.totalProfiles} loading={loading} label="cuentas" onChange={setProfilePage} /></div></div>
        <div className="overflow-hidden rounded-2xl border border-[#e2e8e6] bg-white"><div className="border-b border-[#edf0ef] px-5 py-4"><h2 className="text-sm font-semibold">Solicitudes recientes</h2></div><div className="divide-y divide-[#f0f2f1]">{data.requests.map((request) => <div key={request.id} className="flex items-center justify-between gap-4 px-5 py-3"><div className="min-w-0"><p className="truncate text-xs font-semibold">{request.title}</p><p className="mt-1 text-[10px] text-[#93a09a]">{request.category} · {request.sector} · {formatDate(request.created_at)}</p></div><div className="shrink-0 text-right"><p className="text-xs font-semibold">{formatCOP(Number(request.budget_cop))}</p><p className="mt-1 text-[10px] capitalize text-[#82908b]">{request.status.replaceAll("_", " ")}</p></div></div>)}{!loading && data.requests.length === 0 && <p className="p-5 text-xs text-[#82908b]">Aún no hay solicitudes.</p>}<PageControls page={requestPage} total={data.totalRequests} loading={loading} label="solicitudes" onChange={setRequestPage} /></div></div></section>
      <p className="flex items-center gap-2 text-[10px] text-[#9aa6a0]"><ShieldCheck size={13} />Las direcciones exactas no se muestran en este panel.</p>
    </div>
  </main>;
}
