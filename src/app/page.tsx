"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileText,
  Home as HomeIcon,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserRound,
  Wallet,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

type Mode = "tecnico" | "cliente";

type Request = {
  id: string;
  category: string;
  title: string;
  description: string;
  location: string;
  distance: string;
  budget: number;
  time: string;
  applicants: number;
  color: string;
};

type NavItem = {
  label: string;
  icon: LucideIcon;
  badge?: string;
};

const technicianNav: NavItem[] = [
  { label: "Radar", icon: Zap, badge: "12" },
  { label: "Mis servicios", icon: BriefcaseBusiness },
  { label: "Mensajes", icon: MessageCircle, badge: "3" },
  { label: "Mi saldo", icon: Wallet },
];

const clientNav: NavItem[] = [
  { label: "Inicio", icon: HomeIcon },
  { label: "Mis solicitudes", icon: FileText, badge: "2" },
  { label: "Mensajes", icon: MessageCircle, badge: "3" },
  { label: "Pagos", icon: Wallet },
];

const requests: Request[] = [
  {
    id: "fuga-cocina",
    category: "Plomería",
    title: "Reparar fuga de agua en cocina",
    description: "La llave debajo del lavaplatos está goteando y necesito revisar también la conexión del sifón.",
    location: "El Poblado",
    distance: "2.4 km",
    budget: 250000,
    time: "Hoy, 2:00 p. m.",
    applicants: 4,
    color: "bg-sky-50 text-sky-700",
  },
  {
    id: "luz-sala",
    category: "Electricidad",
    title: "Instalar lámparas en sala",
    description: "Instalación de tres lámparas de techo. Ya tengo los accesorios y necesito una revisión del cableado.",
    location: "Laureles",
    distance: "3.1 km",
    budget: 180000,
    time: "Mañana, 9:00 a. m.",
    applicants: 7,
    color: "bg-amber-50 text-amber-700",
  },
  {
    id: "pintura-habitacion",
    category: "Pintura",
    title: "Pintar una habitación completa",
    description: "Habitación de aproximadamente 12 m². Pintura blanca incluida por el cliente.",
    location: "Belén",
    distance: "4.6 km",
    budget: 320000,
    time: "Sábado, 8:00 a. m.",
    applicants: 2,
    color: "bg-violet-50 text-violet-700",
  },
];

const clientRequests = [
  { title: "Reparar fuga de agua en cocina", category: "Plomería", status: "Recibiendo ofertas", offers: 4, tone: "bg-emerald-50 text-emerald-700" },
  { title: "Instalar ventilador de techo", category: "Electricidad", status: "Técnico seleccionado", offers: 6, tone: "bg-blue-50 text-blue-700" },
];

const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#a3e635] text-[#18312f] shadow-[0_8px_24px_rgba(163,230,53,0.25)]">
        <Wrench size={20} strokeWidth={2.7} />
      </div>
      <div>
        <div className="text-[17px] font-semibold tracking-[-0.04em] text-white">Manos a la obra</div>
        <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#9bb2ad]">Servicios locales</div>
      </div>
    </div>
  );
}

function Sidebar({ mode, activeNav, onNavChange }: { mode: Mode; activeNav: string; onNavChange: (label: string) => void }) {
  const items = mode === "tecnico" ? technicianNav : clientNav;

  return (
    <aside className="hidden min-h-screen w-[255px] shrink-0 flex-col justify-between bg-[#173a37] px-5 py-6 lg:flex">
      <div>
        <BrandMark />
        <div className="mt-12">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#88a7a0]">Espacio de trabajo</p>
          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.label;
              return (
                <button key={item.label} type="button" onClick={() => onNavChange(item.label)} className={`group flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-[13px] font-medium transition ${isActive ? "bg-[#e8f4e7] text-[#173a37] shadow-sm" : "text-[#b5c9c4] hover:bg-white/8 hover:text-white"}`}>
                  <span className="flex items-center gap-3"><Icon size={17} strokeWidth={isActive ? 2.3 : 1.8} />{item.label}</span>
                  {item.badge && <span className={`rounded-full px-2 py-0.5 text-[10px] ${isActive ? "bg-[#b7e481] text-[#173a37]" : "bg-white/10 text-[#bdd0cb]"}`}>{item.badge}</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-10">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#88a7a0]">Cuenta</p>
          <div className="space-y-1">
            <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium text-[#b5c9c4] transition hover:bg-white/8 hover:text-white"><Settings size={17} strokeWidth={1.8} />Configuración</button>
            <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium text-[#b5c9c4] transition hover:bg-white/8 hover:text-white"><CircleHelp size={17} strokeWidth={1.8} />Centro de ayuda</button>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/7 p-4">
        <div className="mb-3 flex items-center gap-2 text-[#dce9e5]"><ShieldCheck size={15} /><span className="text-xs font-semibold">Perfil verificado</span></div>
        <p className="text-[11px] leading-5 text-[#9bb2ad]">Tus datos y certificaciones ayudan a construir confianza en cada servicio.</p>
        <button type="button" className="mt-3 text-[11px] font-semibold text-[#b7e481] hover:text-white">Ver mi perfil →</button>
      </div>
    </aside>
  );
}

function StatCard({ icon: Icon, label, value, note, positive, accent }: { icon: LucideIcon; label: string; value: string; note: string; positive?: boolean; accent: string }) {
  return (
    <div className="rounded-2xl border border-[#e8ece9] bg-white p-5 shadow-[0_8px_30px_rgba(39,65,60,0.035)]">
      <div className="flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}><Icon size={17} /></div>
        {positive !== undefined && <span className={`flex items-center gap-1 text-[11px] font-semibold ${positive ? "text-[#4d9c5a]" : "text-[#80918d]"}`}>{positive ? <ArrowUpRight size={13} /> : <ArrowDownLeft size={13} />}{positive ? "8.4%" : "Este mes"}</span>}
      </div>
      <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.1em] text-[#87938f]">{label}</p>
      <p className="mt-1 text-[25px] font-semibold tracking-[-0.05em] text-[#173a37]">{value}</p>
      <p className="mt-1 text-[11px] text-[#8d9a96]">{note}</p>
    </div>
  );
}

function RequestCard({ request, onOffer, offered }: { request: Request; onOffer: (request: Request) => void; offered: boolean }) {
  return (
    <article className="group rounded-2xl border border-[#e7ece9] bg-white p-5 shadow-[0_8px_30px_rgba(39,65,60,0.035)] transition hover:-translate-y-0.5 hover:border-[#c9dcca] hover:shadow-[0_14px_35px_rgba(39,65,60,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${request.color}`}><Wrench size={18} /></div>
          <div>
            <div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-semibold text-[#73827d]">{request.category}</span><span className="h-1 w-1 rounded-full bg-[#b4c1bd]" /><span className="text-[11px] text-[#8c9995]">{request.time}</span></div>
            <h3 className="mt-1 text-[15px] font-semibold tracking-[-0.02em] text-[#173a37]">{request.title}</h3>
          </div>
        </div>
        <button type="button" aria-label="Más opciones" className="rounded-lg p-1.5 text-[#9aa8a3] transition hover:bg-[#f2f5f2] hover:text-[#173a37]"><MoreHorizontal size={18} /></button>
      </div>
      <p className="mt-4 line-clamp-2 text-[12px] leading-5 text-[#71807b]">{request.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-[#7c8b86]"><span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#4d9c5a]" />{request.location} · {request.distance}</span><span className="flex items-center gap-1.5"><Clock3 size={14} className="text-[#4d9c5a]" />{request.time}</span></div>
      <div className="mt-5 flex items-end justify-between border-t border-[#eef1ef] pt-4"><div><p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#9aa5a1]">Presupuesto estimado</p><p className="mt-0.5 text-[18px] font-semibold tracking-[-0.04em] text-[#173a37]">{formatCOP(request.budget)}</p></div><div className="text-right"><p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#9aa5a1]">Interesados</p><p className="mt-0.5 flex items-center justify-end gap-1 text-[12px] font-semibold text-[#53625d]"><UserRound size={13} />{request.applicants} técnicos</p></div></div>
      <button type="button" onClick={() => onOffer(request)} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-semibold transition ${offered ? "bg-[#ecf7e7] text-[#4c9854]" : "bg-[#173a37] text-white hover:bg-[#24534f]"}`}>{offered ? <><Check size={15} /> Oferta enviada</> : <>Ver solicitud <ArrowUpRight size={15} /></>}</button>
    </article>
  );
}

function OfferModal({ request, onClose, onSent }: { request: Request; onClose: () => void; onSent: (id: string) => void }) {
  const [offerType, setOfferType] = useState<"accept" | "counter">("accept");
  const [amount, setAmount] = useState(String(request.budget));
  const numericAmount = Number(amount) || 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#122e2c]/45 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="w-full max-w-[480px] rounded-3xl border border-white/60 bg-[#fbfcfa] p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#71917d]">Enviar propuesta</p><h2 className="mt-1 max-w-[350px] text-xl font-semibold tracking-[-0.04em] text-[#173a37]">{request.title}</h2><p className="mt-1 flex items-center gap-1 text-xs text-[#82908b]"><MapPin size={13} />{request.location} · {request.distance}</p></div><button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 text-[#84928d] transition hover:bg-[#eef3ef] hover:text-[#173a37]"><X size={18} /></button></div>
        <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-[#eef3ef] p-1"><button type="button" onClick={() => { setOfferType("accept"); setAmount(String(request.budget)); }} className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition ${offerType === "accept" ? "bg-white text-[#173a37] shadow-sm" : "text-[#7c8b86]"}`}>Aceptar presupuesto</button><button type="button" onClick={() => setOfferType("counter")} className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition ${offerType === "counter" ? "bg-white text-[#173a37] shadow-sm" : "text-[#7c8b86]"}`}>Contraofertar</button></div>
        <div className="mt-5 rounded-2xl border border-[#e5ebe6] bg-white p-4"><div className="flex items-center justify-between"><label htmlFor="offer-amount" className="text-xs font-semibold text-[#5d6f69]">Tu precio total</label><span className="rounded-full bg-[#eff7e8] px-2.5 py-1 text-[10px] font-semibold text-[#57915c]">Comisión 10%</span></div><div className="mt-2 flex items-center gap-2 border-b border-[#dfe8e0] pb-2"><span className="text-lg font-semibold text-[#94a19b]">$</span><input id="offer-amount" type="number" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full bg-transparent text-2xl font-semibold tracking-[-0.05em] text-[#173a37] outline-none" /></div><div className="mt-3 flex items-center justify-between text-[11px] text-[#8a9892]"><span>Recibirías aproximadamente</span><strong className="text-[#4d9c5a]">{formatCOP(numericAmount * 0.9)}</strong></div></div>
        <div className="mt-4 flex gap-2 rounded-xl bg-[#fff8e9] px-3 py-2.5 text-[11px] leading-4 text-[#957743]"><ShieldCheck size={15} className="mt-0.5 shrink-0" />La dirección exacta se revela únicamente cuando el cliente te selecciona y el servicio queda asignado.</div>
        <button type="button" onClick={() => onSent(request.id)} disabled={numericAmount <= 0} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#a3e635] px-4 py-3 text-[12px] font-bold text-[#18312f] transition hover:bg-[#b3ef4b] disabled:cursor-not-allowed disabled:opacity-50">Enviar propuesta <ArrowUpRight size={15} /></button>
      </div>
    </div>
  );
}

function BalanceCard({ onRecharge }: { onRecharge: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#173a37] p-5 text-white shadow-[0_12px_35px_rgba(23,58,55,0.16)]"><div className="absolute -right-8 -top-10 h-32 w-32 rounded-full border-[18px] border-white/5" /><div className="absolute -bottom-14 -right-2 h-36 w-36 rounded-full border-[18px] border-[#a3e635]/10" /><div className="relative"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-medium text-[#b7cbc4]"><Wallet size={15} />Saldo prepago</span><button type="button" aria-label="Más opciones" className="text-[#a5c0b8] hover:text-white"><MoreHorizontal size={18} /></button></div><p className="mt-5 text-[30px] font-semibold tracking-[-0.06em]">$180.000</p><p className="mt-1 text-[11px] text-[#9fbbb3]">Disponible para comisiones</p><div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/7 px-3 py-2.5"><span className="text-[11px] text-[#adc3bd]">Último movimiento</span><span className="text-[11px] font-semibold text-[#dff2d2]">+$100.000</span></div><button type="button" onClick={onRecharge} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#a3e635] px-3 py-2.5 text-[11px] font-bold text-[#18312f] transition hover:bg-[#b4ee4f]"><Plus size={15} />Recargar saldo</button></div></div>
  );
}

function ClientOverview({ onPublish }: { onPublish: () => void }) {
  return (
    <><div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#72917e]">Tu espacio</p><h1 className="mt-2 text-[30px] font-semibold tracking-[-0.055em] text-[#173a37]">Hola, Camilo <span className="inline-block">👋</span></h1><p className="mt-2 text-sm text-[#7b8985]">Publica una tarea y recibe propuestas de técnicos verificados.</p></div><button type="button" onClick={onPublish} className="flex items-center justify-center gap-2 rounded-xl bg-[#173a37] px-4 py-3 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(23,58,55,0.14)] transition hover:bg-[#24534f]"><Plus size={16} />Publicar solicitud</button></div><div className="grid gap-4 md:grid-cols-3"><StatCard icon={FileText} label="Solicitudes activas" value="2" note="1 está recibiendo ofertas" accent="bg-[#eef7e9] text-[#4e9458]" /><StatCard icon={Check} label="Servicios completados" value="8" note="Este año" positive accent="bg-[#eef3fb] text-[#5682b3]" /><StatCard icon={Star} label="Calificación promedio" value="4.9" note="Tu reputación en la comunidad" accent="bg-[#fff5dc] text-[#c58b28]" /></div><div className="mt-7 flex items-center justify-between"><div><h2 className="text-[17px] font-semibold tracking-[-0.03em] text-[#173a37]">Mis solicitudes</h2><p className="mt-1 text-xs text-[#8a9892]">Revisa el estado de tus trabajos publicados.</p></div><button type="button" className="text-xs font-semibold text-[#4d9c5a] hover:text-[#173a37]">Ver todas →</button></div><div className="mt-4 space-y-3">{clientRequests.map((request) => <div key={request.title} className="flex flex-col gap-4 rounded-2xl border border-[#e7ece9] bg-white p-4 shadow-[0_8px_30px_rgba(39,65,60,0.035)] sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff5f0] text-[#4d9c5a]"><HomeIcon size={18} /></div><div><h3 className="text-sm font-semibold text-[#173a37]">{request.title}</h3><p className="mt-1 text-[11px] text-[#8b9893]">{request.category} · {request.offers} propuestas recibidas</p></div></div><div className="flex items-center gap-4"><span className={`rounded-full px-2.5 py-1.5 text-[10px] font-semibold ${request.tone}`}>{request.status}</span><button type="button" className="text-xs font-semibold text-[#4d9c5a]">Ver detalles</button></div></div>)}</div></>
  );
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("tecnico");
  const [activeNav, setActiveNav] = useState("Radar");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [offeredIds, setOfferedIds] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState("Todas");
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3200); };
  const handleSentOffer = (id: string) => { setOfferedIds((current) => [...current, id]); setSelectedRequest(null); showToast("Tu propuesta fue enviada al cliente"); };
  const filteredRequests = filter === "Todas" ? requests : requests.filter((request) => request.category === filter);

  return (
    <main className="min-h-screen bg-[#f7f9f7] text-[#173a37]"><div className="flex min-h-screen"><Sidebar mode={mode} activeNav={activeNav} onNavChange={setActiveNav} /><section className="min-w-0 flex-1"><header className="flex h-[76px] items-center justify-between border-b border-[#e7ece9] bg-[#fbfcfa]/90 px-5 backdrop-blur md:px-8 xl:px-11"><div className="flex items-center gap-3 lg:hidden"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#a3e635] text-[#18312f]"><Wrench size={18} /></div><span className="text-sm font-semibold tracking-[-0.03em] text-[#173a37]">Manos a la obra</span></div><div className="relative hidden w-full max-w-[340px] md:block"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ba7a2]" /><input aria-label="Buscar" placeholder="Buscar servicios, técnicos..." className="h-10 w-full rounded-xl border border-[#e5ebe7] bg-white pl-10 pr-4 text-xs text-[#173a37] outline-none transition placeholder:text-[#a8b3af] focus:border-[#9acb82] focus:ring-4 focus:ring-[#a3e635]/10" /></div><div className="ml-auto flex items-center gap-3 md:gap-5"><div className="flex items-center gap-2 rounded-full border border-[#e3ebe5] bg-white p-1 pr-3"><button type="button" onClick={() => { setMode("tecnico"); setActiveNav("Radar"); }} className={`rounded-full px-3 py-1.5 text-[10px] font-semibold transition ${mode === "tecnico" ? "bg-[#173a37] text-white" : "text-[#82908a]"}`}>Técnico</button><button type="button" onClick={() => { setMode("cliente"); setActiveNav("Inicio"); }} className={`rounded-full px-3 py-1.5 text-[10px] font-semibold transition ${mode === "cliente" ? "bg-[#173a37] text-white" : "text-[#82908a]"}`}>Cliente</button></div><button type="button" aria-label="Notificaciones" className="relative rounded-xl p-2 text-[#81908a] transition hover:bg-[#eef3ef] hover:text-[#173a37]"><Bell size={18} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#e58b62] ring-2 ring-[#fbfcfa]" /></button><div className="hidden h-8 w-px bg-[#e5ebe7] sm:block" /><button type="button" className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dcebd8] text-xs font-bold text-[#4d8056]">CR</div><div className="hidden text-left sm:block"><p className="text-[11px] font-semibold text-[#314f49]">Camilo Restrepo</p><p className="text-[10px] text-[#9aa7a2]">{mode === "tecnico" ? "Técnico verificado" : "Cliente"}</p></div><ChevronDown size={14} className="hidden text-[#98a49f] sm:block" /></button></div></header><div className="mx-auto max-w-[1450px] px-5 py-8 md:px-8 xl:px-11">{mode === "cliente" ? <ClientOverview onPublish={() => showToast("Formulario de publicación listo para conectar")} /> : <><div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#72917e]">11 de octubre de 2026</p><h1 className="mt-2 text-[30px] font-semibold tracking-[-0.055em] text-[#173a37]">Buenos días, Camilo <span className="inline-block">👋</span></h1><p className="mt-2 text-sm text-[#7b8985]">Hay nuevas oportunidades cerca de ti. Encuentra la que mejor encaje contigo.</p></div><div className="flex items-center gap-2 rounded-xl border border-[#dbe9d8] bg-[#f1f8ed] px-3 py-2.5 text-[11px] font-semibold text-[#4d8a59]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#6bbd6c]" />Disponible para recibir servicios</div></div><div className="grid gap-4 md:grid-cols-3"><StatCard icon={Wallet} label="Saldo disponible" value="$180.000" note="Suficiente para 2 comisiones" accent="bg-[#eef7e9] text-[#4e9458]" /><StatCard icon={BriefcaseBusiness} label="Servicios completados" value="24" note="+3 en los últimos 30 días" positive accent="bg-[#eef3fb] text-[#5682b3]" /><StatCard icon={Star} label="Calificación promedio" value="4.9" note="Basada en 21 reseñas" accent="bg-[#fff5dc] text-[#c58b28]" /></div><div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_310px]"><div><div className="relative overflow-hidden rounded-2xl bg-[#dcefd8] p-6 sm:p-7"><div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/25" /><div className="absolute -bottom-32 right-20 h-64 w-64 rounded-full border-[35px] border-white/20" /><div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="mb-3 flex w-fit items-center gap-2 rounded-full border border-[#bbd9b5] bg-white/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#4e8d58]"><Sparkles size={12} /> Radar activo</div><h2 className="max-w-[520px] text-[24px] font-semibold leading-[1.1] tracking-[-0.05em] text-[#214b41] sm:text-[28px]">Tu próximo buen servicio puede estar a unos minutos.</h2><p className="mt-3 max-w-[470px] text-[12px] leading-5 text-[#5e7e69]">Explora solicitudes de clientes en Medellín, envía una propuesta y deja que tu experiencia hable.</p></div><div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/50 bg-white/45 px-4 py-3"><div className="flex -space-x-2"><div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#dcefd8] bg-[#f2c7a9] text-[9px] font-bold text-[#845d49]">JS</div><div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#dcefd8] bg-[#c8d9ef] text-[9px] font-bold text-[#536c8f]">MP</div><div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#dcefd8] bg-[#e4d2a6] text-[9px] font-bold text-[#806d42]">+9</div></div><div><p className="text-[11px] font-bold text-[#315d4f]">12 solicitudes</p><p className="text-[10px] text-[#6e8b75]">en tu radio de trabajo</p></div></div></div></div><div className="mt-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="text-[17px] font-semibold tracking-[-0.03em] text-[#173a37]">Oportunidades para ti</h2><p className="mt-1 text-xs text-[#8a9892]">Basadas en tus categorías y ubicación actual.</p></div><div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-[#e5ebe7] bg-white p-1"><button type="button" onClick={() => setFilter("Todas")} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[10px] font-semibold transition ${filter === "Todas" ? "bg-[#173a37] text-white" : "text-[#84918c] hover:text-[#173a37]"}`}>Todas</button>{["Plomería", "Electricidad", "Pintura"].map((category) => <button key={category} type="button" onClick={() => setFilter(category)} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[10px] font-semibold transition ${filter === category ? "bg-[#173a37] text-white" : "text-[#84918c] hover:text-[#173a37]"}`}>{category}</button>)}</div></div><div className="mt-4 grid gap-4 lg:grid-cols-2">{filteredRequests.map((request) => <RequestCard key={request.id} request={request} onOffer={setSelectedRequest} offered={offeredIds.includes(request.id)} />)}</div></div><div className="space-y-5"><BalanceCard onRecharge={() => showToast("El flujo de recarga quedará conectado a PSE / Nequi")} /><div className="rounded-2xl border border-[#e7ece9] bg-white p-5 shadow-[0_8px_30px_rgba(39,65,60,0.035)]"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-[#173a37]">Actividad reciente</h3><button type="button" className="text-[11px] font-semibold text-[#4d9c5a]">Ver todo</button></div><div className="mt-5 space-y-4"><div className="flex gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eaf5e8] text-[#4d9c5a]"><ArrowDownLeft size={15} /></div><div className="min-w-0 flex-1"><p className="text-[11px] font-semibold text-[#52655e]">Recarga de saldo</p><div className="mt-0.5 flex justify-between gap-2"><p className="text-[10px] text-[#9aa5a1]">Hoy, 9:42 a. m. · Nequi</p><span className="text-[11px] font-semibold text-[#4d9c5a]">+$100.000</span></div></div></div><div className="flex gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff4dc] text-[#c58b28]"><ArrowUpRight size={15} /></div><div className="min-w-0 flex-1"><p className="text-[11px] font-semibold text-[#52655e]">Comisión de servicio</p><div className="mt-0.5 flex justify-between gap-2"><p className="text-[10px] text-[#9aa5a1]">Ayer · Plomería</p><span className="text-[11px] font-semibold text-[#c58b28]">-$25.000</span></div></div></div></div></div><div className="rounded-2xl border border-[#e7ece9] bg-[#fbfdf9] p-5"><div className="flex items-center gap-2 text-[#4e8d58]"><TrendingUp size={16} /><h3 className="text-sm font-semibold text-[#173a37]">Consejo para crecer</h3></div><p className="mt-3 text-[11px] leading-5 text-[#7e8f88]">Las propuestas con una respuesta clara y fotos de trabajos anteriores tienen más posibilidades de ser elegidas.</p><button type="button" className="mt-3 text-[11px] font-semibold text-[#4d9c5a]">Mejorar mi perfil →</button></div></div></div></>}</div></section></div>{toast && <div role="status" className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#173a37] px-4 py-3 text-xs font-semibold text-white shadow-xl"><Check size={15} className="text-[#a3e635]" />{toast}</div>}{selectedRequest && <OfferModal request={selectedRequest} onClose={() => setSelectedRequest(null)} onSent={handleSentOffer} />}</main>
  );
}
