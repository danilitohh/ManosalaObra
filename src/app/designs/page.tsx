import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  CreditCard,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  UserRound,
  WalletCards,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Concept = {
  number: string;
  name: string;
  label: string;
  description: string;
  ideal: string;
  strengths: string[];
  tradeoff: string;
  colors: string[];
  kind: "atelier" | "ledger" | "nord";
};

const concepts: Concept[] = [
  {
    number: "01",
    name: "Atelier",
    label: "Calma editorial",
    description: "Un marketplace sobrio y humano, con sensación de servicio cuidado y atención personal.",
    ideal: "Marca de confianza · hogares · servicios de alto cuidado",
    strengths: ["Elegante sin ser frío", "Mucho espacio para explicar", "Reputación con alto valor visual"],
    tradeoff: "Tiene menos sensación de urgencia para el radar del técnico.",
    colors: ["#f6f4ef", "#24302f", "#8b9b82", "#d9dfd7"],
    kind: "atelier",
  },
  {
    number: "02",
    name: "Ledger",
    label: "Precisión profesional",
    description: "Una interfaz inspirada en productos financieros: exacta, transparente y enfocada en decisiones.",
    ideal: "Pagos · saldo prepago · operaciones y administración",
    strengths: ["Comunica control y seguridad", "Excelente para estados y dinero", "Muy fácil de escalar"],
    tradeoff: "Puede sentirse más corporativa y menos cercana para nuevos clientes.",
    colors: ["#f7f8fa", "#19242d", "#4d69d8", "#dce4ff"],
    kind: "ledger",
  },
  {
    number: "03",
    name: "Nord",
    label: "SaaS premium",
    description: "Una dirección limpia y contemporánea, con azul mineral, superficies blancas y navegación muy clara.",
    ideal: "Producto digital escalable · clientes y técnicos en una sola experiencia",
    strengths: ["Se siente actual y confiable", "Muy buena legibilidad", "Balance entre operación y marca"],
    tradeoff: "Es la opción menos distintiva si no se acompaña con una identidad fuerte.",
    colors: ["#f8fafc", "#1e293b", "#4f7cac", "#dbeafe"],
    kind: "nord",
  },
];

export default function DesignExplorationPage() {
  return <main className="min-h-screen bg-[#f4f5f2] px-5 py-8 text-[#24302f] md:px-8 md:py-12 xl:px-14"><div className="mx-auto max-w-[1420px]"><header className="flex flex-col justify-between gap-8 border-b border-[#dfe3dd] pb-10 md:flex-row md:items-end"><div><Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#657768] transition hover:text-[#24302f]"><ChevronRight size={14} className="rotate-180" />Volver al MVP</Link><p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8d9991]">Dirección visual · ronda 03</p><h1 className="mt-3 max-w-[820px] text-4xl font-medium tracking-[-0.07em] text-[#24302f] md:text-6xl">Profesional, minimalista y elegante.</h1><p className="mt-5 max-w-[650px] text-sm leading-6 text-[#728078] md:text-base">Estas propuestas reducen el ruido visual y ponen el foco en las tres cosas que deben sentirse impecables: confianza, claridad y control.</p></div><div className="rounded-2xl border border-[#dfe3dd] bg-white px-5 py-4 text-right shadow-[0_8px_25px_rgba(44,54,49,0.035)]"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9aa59e]">Sistema común</p><p className="mt-2 text-xs font-semibold text-[#4e5f56]">Geist · 8px · bordes finos</p><p className="mt-1 text-[11px] text-[#86938a]">Una sola acción principal por pantalla</p></div></header><section className="mt-8 grid gap-3 md:grid-cols-3"><Principle icon={ShieldCheck} title="Confianza visible" text="Identidad, certificación, precio y estado siempre claros." /><Principle icon={LayoutDashboard} title="Jerarquía limpia" text="Menos elementos compitiendo, mejores decisiones." /><Principle icon={CreditCard} title="Dinero transparente" text="Comisión, saldo y pago explicados sin ambigüedad." /></section><div className="mt-10 grid gap-6 xl:grid-cols-3">{concepts.map((concept) => <ConceptCard key={concept.number} concept={concept} />)}</div><section className="mt-10 flex flex-col justify-between gap-6 rounded-[26px] border border-[#dfe3dd] bg-white p-6 shadow-[0_12px_35px_rgba(44,54,49,0.04)] md:flex-row md:items-center md:p-8"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8d9991]">Recomendación de diseño</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.05em] text-[#24302f]">Empezaría con Nord y tomaría la claridad de Ledger.</h2><p className="mt-2 max-w-[760px] text-sm leading-6 text-[#78857d]">Nord ofrece el mejor equilibrio para la primera versión. Ledger puede aportar el lenguaje visual del saldo, la comisión y los estados financieros.</p></div><Link href="/" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#24302f] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#3c4b47]">Ver el MVP actual <ArrowRight size={15} /></Link></section></div></main>;
}

function Principle({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return <div className="rounded-2xl border border-[#dfe3dd] bg-white p-5 shadow-[0_8px_25px_rgba(44,54,49,0.025)]"><div className="flex items-center gap-2 text-[#6f8674]"><Icon size={17} /><h2 className="text-xs font-semibold text-[#3d4c44]">{title}</h2></div><p className="mt-3 text-[11px] leading-5 text-[#849088]">{text}</p></div>;
}

function ConceptCard({ concept }: { concept: Concept }) {
  return <article className="overflow-hidden rounded-[25px] border border-[#dfe3dd] bg-white shadow-[0_12px_35px_rgba(44,54,49,0.045)]"><div className="p-6"><div className="flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[0.17em] text-[#a0aaa4]">{concept.number} / 03</span><span className="rounded-full bg-[#f0f3ee] px-2.5 py-1 text-[10px] font-semibold text-[#66776b]">{concept.label}</span></div><h2 className="mt-5 text-3xl font-medium tracking-[-0.07em] text-[#24302f]">{concept.name}</h2><p className="mt-3 min-h-[50px] text-xs leading-5 text-[#78857d]">{concept.description}</p></div><ConceptPreview kind={concept.kind} /><div className="p-6"><div className="flex gap-1.5">{concept.colors.map((color) => <span key={color} className="h-4 flex-1 rounded-full border border-black/5" style={{ backgroundColor: color }} />)}</div><div className="mt-6"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9aa49e]">Ideal para</p><p className="mt-2 text-xs font-semibold leading-5 text-[#526159]">{concept.ideal}</p></div><div className="mt-5 border-t border-[#edf0eb] pt-5"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9aa49e]">Fortalezas</p><ul className="mt-3 space-y-2">{concept.strengths.map((strength) => <li key={strength} className="flex items-start gap-2 text-xs leading-5 text-[#68766e]"><Check size={14} className="mt-0.5 shrink-0 text-[#7e9b83]" />{strength}</li>)}</ul></div><div className="mt-5 border-t border-[#edf0eb] pt-5"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9aa49e]">Trade-off</p><p className="mt-2 text-xs leading-5 text-[#839087]">{concept.tradeoff}</p></div></div></article>;
}

function ConceptPreview({ kind }: { kind: Concept["kind"] }) {
  if (kind === "atelier") return <div className="bg-[#f6f4ef] p-4"><div className="overflow-hidden rounded-[18px] border border-[#e3e3db] bg-[#fcfbf8] shadow-[0_12px_24px_rgba(51,65,56,0.06)]"><div className="flex items-center justify-between border-b border-[#ecece5] px-4 py-3"><div className="flex items-center gap-2 text-[10px] font-semibold text-[#24302f]"><Wrench aria-hidden="true" className="text-[#24302f]" size={14} />manos a la obra</div><span className="text-[9px] text-[#89958e]">El Poblado</span></div><div className="grid gap-4 p-4 sm:grid-cols-[0.95fr_1.05fr] sm:p-5"><div><p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#82977f]">Servicio para tu hogar</p><h3 className="mt-3 text-[23px] font-medium leading-6 tracking-[-0.07em] text-[#24302f]">Encuentra ayuda sin complicarte.</h3><p className="mt-3 text-[9px] leading-4 text-[#839087]">Personas verificadas, presupuestos claros y acompañamiento en cada paso.</p><button type="button" className="mt-4 rounded-full bg-[#82977f] px-3 py-2 text-[9px] font-semibold text-white">Publicar solicitud</button></div><div className="rounded-xl border border-[#e9e9e3] bg-white p-3"><div className="flex items-center justify-between"><span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#9ba59f]">Propuesta destacada</span><span className="text-[9px] text-[#82977f]">4.9 ★</span></div><div className="mt-4 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9dfd7] text-[9px] font-semibold text-[#526159]">JS</div><div><p className="text-[10px] font-semibold text-[#24302f]">Juliana Salazar</p><p className="text-[9px] text-[#929c95]">Plomería · 31 servicios</p></div></div><div className="mt-4 flex items-center justify-between border-t border-[#f0f0eb] pt-3"><span className="text-[9px] text-[#8a958e]">Disponible hoy</span><strong className="text-[12px] text-[#24302f]">$250.000</strong></div></div></div></div></div>;
  if (kind === "ledger") return <div className="bg-[#f7f8fa] p-4"><div className="overflow-hidden rounded-[18px] border border-[#e1e5eb] bg-white shadow-[0_12px_24px_rgba(41,53,67,0.06)]"><div className="flex items-center justify-between border-b border-[#edf0f3] px-4 py-3"><div className="flex items-center gap-2 text-[10px] font-semibold text-[#19242d]"><WalletCards aria-hidden="true" className="text-[#19242d]" size={14} />OPERACIONES</div><span className="text-[9px] text-[#7c8995]">12 oct 2026</span></div><div className="grid gap-3 p-4 sm:grid-cols-2"><div className="rounded-xl bg-[#19242d] p-4 text-white"><p className="text-[8px] uppercase tracking-[0.16em] text-[#b7c2cb]">Saldo prepago</p><p className="mt-3 text-xl font-semibold tracking-[-0.06em]">$180.000</p><div className="mt-4 flex items-center justify-between text-[8px] text-[#a9b6c0]"><span>Disponible</span><span className="text-[#b7c9ff]">2 comisiones</span></div></div><div className="rounded-xl border border-[#e6eaf0] p-4"><p className="text-[8px] uppercase tracking-[0.16em] text-[#8b98a3]">Solicitudes activas</p><p className="mt-3 text-xl font-semibold tracking-[-0.06em] text-[#19242d]">12</p><p className="mt-4 flex items-center gap-1 text-[8px] text-[#4d69d8]"><Clock3 size={10} />Última actualización ahora</p></div></div><div className="mx-4 mb-4 rounded-xl border border-[#e6eaf0]"><div className="flex items-center justify-between border-b border-[#edf0f3] px-3 py-2.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#8b98a3]"><span>Solicitud</span><span>Presupuesto</span></div><div className="flex items-center justify-between px-3 py-3 text-[10px] text-[#44525c]"><span>Reparar fuga de agua</span><strong>$250.000</strong></div></div></div></div>;
  return <div className="bg-[#eef3f7] p-4"><div className="overflow-hidden rounded-[18px] border border-[#dce5ed] bg-[#fafdff] shadow-[0_12px_24px_rgba(48,77,99,0.06)]"><div className="flex items-center justify-between border-b border-[#e8eef3] px-4 py-3"><div className="flex items-center gap-2 text-[10px] font-semibold text-[#1e293b]"><LayoutDashboard aria-hidden="true" className="text-[#4f7cac]" size={14} />Mi espacio</div><UserRound aria-hidden="true" className="text-[#5d7690]" size={14} /></div><div className="grid gap-3 p-4 sm:grid-cols-[0.85fr_1.15fr]"><div><p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#6f8eaa]">Buenos días, Camilo</p><h3 className="mt-3 text-[21px] font-semibold leading-6 tracking-[-0.07em] text-[#1e293b]">¿Qué necesitas resolver?</h3><div className="mt-4 flex items-center gap-2 rounded-xl border border-[#dce5ed] bg-white px-3 py-2.5 text-[9px] text-[#8998a5]"><MapPin size={11} className="text-[#4f7cac]" />El Poblado<ChevronRight size={11} className="ml-auto" /></div></div><div className="rounded-xl border border-[#dce5ed] bg-white p-3"><div className="flex items-center justify-between"><span className="text-[8px] font-semibold text-[#6f8eaa]">MIS SOLICITUDES</span><span className="text-[9px] text-[#4f7cac]">Ver todas</span></div><div className="mt-3 rounded-lg bg-[#f4f8fb] p-3"><div className="flex items-center justify-between"><span className="text-[9px] font-semibold text-[#1e293b]">Fuga de agua en cocina</span><span className="h-2 w-2 rounded-full bg-[#8cc59b]" /></div><div className="mt-3 flex items-center justify-between text-[9px] text-[#8b99a5]"><span>4 propuestas</span><strong className="text-[#1e293b]">$250.000</strong></div></div><div className="mt-2 flex items-center gap-2 text-[9px] text-[#4f7cac]"><ShieldCheck size={11} />Técnicos verificados</div></div></div></div></div>;
}
