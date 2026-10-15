"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, BriefcaseBusiness, ClipboardList, LogOut, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

type AdminProfile = { id: string; display_name: string; role: string; rating: number; verified: boolean; is_available: boolean; created_at: string };
type AdminRequest = { id: string; title: string; category: string; sector: string; budget_cop: number; status: string; payment_method: string; created_at: string };
type AdminService = { id: string; status: string; agreed_price_cop: number; commission_cop: number; created_at: string };
type AdminData = { profiles: AdminProfile[]; requests: AdminRequest[]; services: AdminService[] };

const EMPTY_DATA: AdminData = { profiles: [], requests: [], services: [] };
const formatCOP = (amount: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);
const formatDate = (value: string) => new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const roleLabel = (role: string) => ({ admin: "Administrador", technician: "Técnico", client: "Cliente" })[role] ?? role;

function Metric({ label, value, icon: Icon, note }: { label: string; value: string | number; icon: typeof Users; note: string }) {
  return <article className="rounded-2xl border border-[#e2e8e6] bg-white p-5 shadow-[0_8px_28px_rgba(31,54,48,0.04)]"><div className="flex items-center justify-between"><p className="text-xs font-medium text-[#778780]">{label}</p><Icon size={18} className="text-[#4d69d8]" /></div><p className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#19242d]">{value}</p><p className="mt-1 text-[11px] text-[#9aa6a0]">{note}</p></article>;
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

  const refresh = useCallback(async () => {
    if (!supabase || role !== "admin") return;
    setLoading(true);
    const [profileResult, requestResult, serviceResult] = await Promise.all([
      supabase.from("profiles").select("id, display_name, role, rating, verified, is_available, created_at").order("created_at", { ascending: false }),
      supabase.from("service_requests").select("id, title, category, sector, budget_cop, status, payment_method, created_at").order("created_at", { ascending: false }).limit(20),
      supabase.from("services").select("id, status, agreed_price_cop, commission_cop, created_at").order("created_at", { ascending: false }).limit(20),
    ]);
    const queryError = profileResult.error ?? requestResult.error ?? serviceResult.error;
    if (queryError) setError(queryError.message);
    else {
      setError("");
      setData({
        profiles: (profileResult.data ?? []) as AdminProfile[],
        requests: (requestResult.data ?? []) as AdminRequest[],
        services: (serviceResult.data ?? []) as AdminService[],
      });
    }
    setLoading(false);
  }, [role, supabase]);

  useEffect(() => {
    if (!supabase || role !== "admin") return;
    void Promise.resolve().then(refresh);
    const channel = supabase.channel("admin-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => { void refresh(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "service_requests" }, () => { void refresh(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "services" }, () => { void refresh(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "offers" }, () => { void refresh(); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [refresh, role, supabase]);

  if (!isSupabaseConfigured() || authLoading || !userId || !role || role !== "admin") {
    return <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-5 text-sm text-[#6f8178]">{error || "Verificando acceso de administración…"}</main>;
  }

  const activeRequests = data.requests.filter((request) => ["published", "awaiting_balance"].includes(request.status)).length;
  const activeServices = data.services.filter((service) => !["completed", "cancelled"].includes(service.status)).length;
  const techniciansAvailable = data.profiles.filter((profile) => profile.role === "technician" && profile.is_available).length;

  return <main className="min-h-screen bg-[#f6f8fa] text-[#19242d]">
    <header className="border-b border-[#e4e9e8] bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8"><div className="flex items-center gap-3"><ShieldCheck className="text-[#4d69d8]" size={22} /><div><p className="text-sm font-semibold">Manos a la obra</p><p className="text-[11px] text-[#82908b]">Consola de administración</p></div></div><div className="flex items-center gap-3"><span className="hidden items-center gap-1.5 text-xs text-[#5a9667] sm:flex"><Activity size={14} />Panel privado</span><button type="button" onClick={() => { void supabase?.auth.signOut(); }} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#64746e] hover:bg-[#f2f4f4]"><LogOut size={15} />Salir</button></div></div></header>
    <div className="mx-auto max-w-7xl space-y-8 px-5 py-8 md:px-8">
      <section className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4d69d8]">Panel del propietario</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.055em]">Resumen del marketplace</h1><p className="mt-2 text-sm text-[#81908a]">Actividad y cuentas actualizadas en tiempo real.</p></div><button type="button" disabled={loading} onClick={() => { void refresh(); }} className="flex items-center gap-2 rounded-xl border border-[#dfe6e3] bg-white px-4 py-2.5 text-xs font-semibold text-[#52655e] hover:bg-[#f8faf9] disabled:opacity-60"><RefreshCw size={14} className={loading ? "animate-spin" : ""} />Actualizar</button></section>
      {error && <p role="alert" className="rounded-xl border border-[#f0d8d0] bg-[#fff3ef] px-4 py-3 text-xs text-[#a34b3a]">{error}</p>}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Cuentas" value={data.profiles.length} icon={Users} note={`${data.profiles.filter((profile) => profile.role === "client").length} clientes · ${data.profiles.filter((profile) => profile.role === "technician").length} técnicos`} /><Metric label="Técnicos disponibles" value={techniciansAvailable} icon={ShieldCheck} note="Con el radar activado" /><Metric label="Solicitudes abiertas" value={activeRequests} icon={ClipboardList} note="Publicadas o pendientes de saldo" /><Metric label="Servicios activos" value={activeServices} icon={BriefcaseBusiness} note="Aún no completados ni cancelados" /></section>
      <section className="grid gap-6 xl:grid-cols-[1fr_1.1fr]"><div className="overflow-hidden rounded-2xl border border-[#e2e8e6] bg-white"><div className="border-b border-[#edf0ef] px-5 py-4"><h2 className="text-sm font-semibold">Cuentas recientes</h2></div><div className="divide-y divide-[#f0f2f1]">{data.profiles.slice(0, 8).map((profile) => <div key={profile.id} className="flex items-center justify-between gap-3 px-5 py-3"><div><p className="text-xs font-semibold">{profile.display_name}</p><p className="mt-1 text-[10px] text-[#93a09a]">{formatDate(profile.created_at)}</p></div><span className="rounded-full bg-[#f0f3ff] px-2.5 py-1 text-[10px] font-semibold text-[#4d69d8]">{roleLabel(profile.role)}</span></div>)}{!loading && data.profiles.length === 0 && <p className="p-5 text-xs text-[#82908b]">No hay cuentas para mostrar.</p>}</div></div>
        <div className="overflow-hidden rounded-2xl border border-[#e2e8e6] bg-white"><div className="border-b border-[#edf0ef] px-5 py-4"><h2 className="text-sm font-semibold">Solicitudes recientes</h2></div><div className="divide-y divide-[#f0f2f1]">{data.requests.slice(0, 8).map((request) => <div key={request.id} className="flex items-center justify-between gap-4 px-5 py-3"><div className="min-w-0"><p className="truncate text-xs font-semibold">{request.title}</p><p className="mt-1 text-[10px] text-[#93a09a]">{request.category} · {request.sector} · {formatDate(request.created_at)}</p></div><div className="shrink-0 text-right"><p className="text-xs font-semibold">{formatCOP(Number(request.budget_cop))}</p><p className="mt-1 text-[10px] capitalize text-[#82908b]">{request.status.replaceAll("_", " ")}</p></div></div>)}{!loading && data.requests.length === 0 && <p className="p-5 text-xs text-[#82908b]">Aún no hay solicitudes.</p>}</div></div></section>
      <p className="flex items-center gap-2 text-[10px] text-[#9aa6a0]"><ShieldCheck size={13} />Las direcciones exactas no se muestran en este panel.</p>
    </div>
  </main>;
}
