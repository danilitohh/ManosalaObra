import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Layers3,
  MapPin,
  Navigation,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Wrench,
  Zap,
} from "lucide-react";

const concepts = [
  {
    number: "01",
    name: "Editorial premium",
    label: "Más sofisticado",
    description: "Una plataforma con carácter de estudio: menos dashboard, más selección curada y sensación de servicio de calidad.",
    ideal: "Posicionamiento premium · trabajos de mayor valor",
    strengths: ["Se diferencia de una app genérica", "Eleva la percepción del técnico", "Usa mejor historias y reputación"],
    tradeoff: "Requiere cuidar mucho fotografía, copy y consistencia editorial.",
    colors: ["#f2eee7", "#33202a", "#3558e8", "#d8c8b6"],
    kind: "editorial" as const,
  },
  {
    number: "02",
    name: "Control eléctrico",
    label: "Más tecnológico",
    description: "Una interfaz de operación rápida, con alto contraste y jerarquía de datos para responder sin perder tiempo.",
    ideal: "Técnicos activos · volumen alto de solicitudes",
    strengths: ["Acciones muy rápidas", "Excelente para radar y notificaciones", "Se siente moderna y escalable"],
    tradeoff: "Puede ser demasiado intensa para clientes que buscan una experiencia tranquila.",
    colors: ["#0d1938", "#536bff", "#c7ff54", "#eef3ff"],
    kind: "electric" as const,
  },
  {
    number: "03",
    name: "Barrio y comunidad",
    label: "Más cercano",
    description: "Una experiencia humana que pone rostros, recomendaciones y conversaciones al frente del servicio.",
    ideal: "Hogares · primera vez usando la plataforma",
    strengths: ["Reduce la sensación de riesgo", "Hace visibles las recomendaciones", "Invita a volver y recomendar"],
    tradeoff: "La operación profesional queda en segundo plano y necesita otra vista para técnicos.",
    colors: ["#fff0e9", "#df7655", "#20354d", "#f6c5ad"],
    kind: "community" as const,
  },
  {
    number: "04",
    name: "Mapa primero",
    label: "Más operativo",
    description: "La geografía es el centro: solicitudes, distancia y disponibilidad se entienden de un vistazo.",
    ideal: "Servicios urgentes · cobertura por zonas",
    strengths: ["Aprovecha el diferencial geográfico", "Perfecto para disponibilidad en tiempo real", "Facilita escalar por barrios"],
    tradeoff: "Hay que diseñar muy bien la privacidad de la dirección exacta.",
    colors: ["#27323b", "#f4b64f", "#a7dfc4", "#e9f0ed"],
    kind: "map" as const,
  },
];

export default function DesignExplorationPage() {
  return <main className="min-h-screen bg-[#f8f8f6] px-5 py-8 text-[#202d32] md:px-8 md:py-12 xl:px-14"><div className="mx-auto max-w-[1460px]"><header className="flex flex-col justify-between gap-8 border-b border-[#e3e5e1] pb-9 md:flex-row md:items-end"><div><Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#6678d9] transition hover:text-[#202d32]"><ChevronRight size={14} className="rotate-180" />Volver al MVP</Link><p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#89928d]">Nueva exploración visual · ronda 02</p><h1 className="mt-3 max-w-[850px] text-4xl font-semibold tracking-[-0.07em] text-[#202d32] md:text-6xl">Cuatro caminos con más personalidad.</h1><p className="mt-5 max-w-[700px] text-sm leading-6 text-[#77827d] md:text-base">Descartamos el dashboard verde anterior y probamos direcciones más marcadas. La funcionalidad es la misma; cambia la forma en que la marca se siente.</p></div><div className="flex shrink-0 items-center gap-2 rounded-2xl border border-[#e3e5e1] bg-white px-4 py-3 text-xs font-semibold text-[#65716c] shadow-sm"><Layers3 size={16} className="text-[#6678d9]" />4 conceptos para comparar</div></header><section className="mt-8 grid gap-3 md:grid-cols-4"><Criterion icon={Sparkles} title="Personalidad" text="Que no parezca una app más." /><Criterion icon={ShieldCheck} title="Seguridad" text="Que la gente confíe en el contacto." /><Criterion icon={Zap} title="Acción" text="Que ofertar sea inmediato." /><Criterion icon={UsersRound} title="Comunidad" text="Que invite a volver." /></section><div className="mt-10 grid gap-6 xl:grid-cols-2">{concepts.map((concept) => <ConceptCard key={concept.number} {...concept} />)}</div><section className="mt-10 rounded-[28px] bg-[#202d32] p-6 text-white md:p-8"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-center"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c7ff54]">Cómo escoger</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">Elijamos una dirección antes de seguir programando.</h2><p className="mt-2 max-w-[720px] text-sm leading-6 text-[#bdc9c7]">Cuando escojamos una, la convertiré en el sistema visual base: colores, tipografías, botones, tarjetas, estados, navegación y versión móvil.</p></div><Link href="/" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#c7ff54] px-5 py-3 text-xs font-bold text-[#202d32] transition hover:bg-[#d6ff7b]">Volver a probar el MVP <ArrowRight size={15} /></Link></div></section></div></main>;
}

function Criterion({ icon: Icon, title, text }: { icon: typeof Sparkles; title: string; text: string }) {
  return <div className="rounded-2xl border border-[#e3e5e1] bg-white p-4"><div className="flex items-center gap-2 text-[#6678d9]"><Icon size={16} /><span className="text-xs font-semibold text-[#344148]">{title}</span></div><p className="mt-2 text-[11px] text-[#87918b]">{text}</p></div>;
}

function ConceptCard({ number, name, label, description, ideal, strengths, tradeoff, colors, kind }: (typeof concepts)[number]) {
  return <article className="overflow-hidden rounded-[28px] border border-[#e3e5e1] bg-white shadow-[0_12px_35px_rgba(44,56,54,0.045)]"><div className="flex flex-col justify-between gap-4 border-b border-[#edf0eb] p-6 sm:flex-row sm:items-start"><div><span className="text-[11px] font-semibold tracking-[0.15em] text-[#98a09b]">{number} / 04</span><h2 className="mt-3 text-2xl font-semibold tracking-[-0.06em] text-[#202d32]">{name}</h2><p className="mt-2 max-w-[480px] text-xs leading-5 text-[#77827d]">{description}</p></div><span className="w-fit rounded-full bg-[#f1f3ee] px-3 py-1.5 text-[10px] font-bold text-[#69756f]">{label}</span></div><ConceptPreview kind={kind} /><div className="p-6"><div className="flex flex-wrap items-center gap-1.5">{colors.map((color) => <span key={color} className="h-5 w-12 rounded-full border border-black/5" style={{ backgroundColor: color }} />)}</div><div className="mt-6 grid gap-6 sm:grid-cols-2"><div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#98a09b]">Ideal para</p><p className="mt-2 text-xs font-semibold leading-5 text-[#485650]">{ideal}</p></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#98a09b]">Trade-off</p><p className="mt-2 text-xs leading-5 text-[#7d8982]">{tradeoff}</p></div></div><div className="mt-6 border-t border-[#edf0eb] pt-5"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#98a09b]">Qué aporta</p><ul className="mt-3 grid gap-2 sm:grid-cols-3">{strengths.map((strength) => <li key={strength} className="flex items-start gap-2 text-xs leading-5 text-[#64726b]"><Check size={14} className="mt-0.5 shrink-0 text-[#6b8cd4]" />{strength}</li>)}</ul></div></div></article>;
}

function ConceptPreview({ kind }: { kind: (typeof concepts)[number]["kind"] }) {
  if (kind === "editorial") return <div className="bg-[#f2eee7] p-5"><div className="overflow-hidden rounded-[22px] bg-[#33202a] text-[#f2eee7] shadow-xl"><div className="flex items-center justify-between border-b border-white/15 px-5 py-4"><div className="flex items-center gap-2 text-xs font-semibold"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d8c8b6] text-[#33202a]"><Wrench size={13} /></span>MANOS A LA OBRA</div><span className="text-[9px] uppercase tracking-[0.15em] text-[#d8c8b6]">Selección local</span></div><div className="grid gap-5 p-5 sm:grid-cols-[0.9fr_1.1fr] sm:p-7"><div><p className="text-[9px] uppercase tracking-[0.2em] text-[#d8c8b6]">Un buen trabajo empieza aquí</p><h3 className="mt-3 text-3xl font-semibold leading-8 tracking-[-0.07em]">Encuentra a la persona correcta.</h3><p className="mt-3 max-w-[250px] text-[10px] leading-5 text-[#dbcfc7]">Técnicos verificados, precios claros y una forma segura de coordinar.</p><button type="button" className="mt-5 rounded-full bg-[#3558e8] px-4 py-2 text-[10px] font-bold text-white">Publicar una necesidad</button></div><div className="rounded-[18px] bg-[#f2eee7] p-3 text-[#33202a]"><div className="flex items-center justify-between text-[9px] font-semibold"><span>HOY EN EL POBLADO</span><span className="text-[#3558e8]">4.9 ★</span></div><div className="mt-3 rounded-xl bg-white p-3"><div className="flex items-center gap-2"><div className="h-7 w-7 rounded-full bg-[#d8c8b6]" /><div><p className="text-[10px] font-semibold">Juliana Salazar</p><p className="text-[9px] text-[#92918a]">Plomería · 31 servicios</p></div></div><p className="mt-3 text-[11px] font-semibold">Reparar fuga de agua</p><div className="mt-3 flex items-center justify-between"><span className="text-[9px] text-[#92918a]">Disponible hoy</span><strong className="text-[12px]">$250.000</strong></div></div></div></div></div></div>;
  if (kind === "electric") return <div className="bg-[#0d1938] p-5"><div className="overflow-hidden rounded-[18px] border border-white/10 bg-[#111f46] text-white shadow-xl"><div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div className="flex items-center gap-2 text-[10px] font-bold"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#c7ff54] text-[#0d1938]"><Zap size={13} /></span>RADAR / 12 ACTIVAS</div><div className="flex items-center gap-1 text-[9px] text-[#c7ff54]"><span className="h-1.5 w-1.5 rounded-full bg-[#c7ff54]" />ONLINE</div></div><div className="grid gap-3 p-4 sm:grid-cols-[1.05fr_0.95fr]"><div className="relative min-h-[175px] overflow-hidden rounded-xl bg-[#1d2d5a]"><div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(#a9b7db 1px, transparent 1px), linear-gradient(90deg, #a9b7db 1px, transparent 1px)", backgroundSize: "26px 26px" }} /><div className="absolute left-[45%] top-[38%] h-20 w-20 rounded-full border border-[#c7ff54]/60 bg-[#c7ff54]/10" /><div className="absolute left-[53%] top-[46%] h-2.5 w-2.5 rounded-full bg-[#ffbd59] shadow-[0_0_0_5px_rgba(255,189,89,0.16)]" /><div className="absolute bottom-3 left-3 rounded-lg bg-[#0d1938]/80 px-2 py-1 text-[9px] text-[#eef3ff]">Radio de trabajo · 5 km</div></div><div className="space-y-2"><QueueItem category="PLOMERÍA" title="Fuga de agua en cocina" price="$250k" tone="lime" /><QueueItem category="ELECTRICIDAD" title="Instalar lámparas" price="$180k" tone="blue" /></div></div></div></div>;
  if (kind === "community") return <div className="bg-[#fff0e9] p-5"><div className="overflow-hidden rounded-[22px] border border-[#f2d5c8] bg-white text-[#20354d] shadow-xl"><div className="flex items-center justify-between border-b border-[#f3e4dc] px-5 py-4"><div className="flex items-center gap-2 text-xs font-bold"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#df7655] text-white"><UsersRound size={13} /></span>Manos a la obra</div><div className="flex -space-x-2"><span className="h-6 w-6 rounded-full border-2 border-white bg-[#b7d2df]" /><span className="h-6 w-6 rounded-full border-2 border-white bg-[#f2c1a8]" /><span className="h-6 w-6 rounded-full border-2 border-white bg-[#d8c89e]" /></div></div><div className="p-5"><p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#df7655]">Recomendado por vecinos</p><h3 className="mt-2 max-w-[300px] text-2xl font-semibold leading-7 tracking-[-0.06em]">Ayuda real, de personas cerca de ti.</h3><div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#fff0e9] p-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2c1a8] text-xs font-bold text-[#93553f]">JS</div><div><p className="text-[10px] font-semibold">Juliana tiene 4.8 ★</p><p className="mt-1 text-[9px] text-[#82909a]">“Muy recomendada en Laureles”</p></div><ChevronRight size={14} className="ml-auto text-[#df7655]" /></div><button type="button" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#df7655] py-2.5 text-[10px] font-bold text-white">Cuéntanos qué necesitas <ArrowRight size={13} /></button></div></div></div>;
  return <div className="bg-[#e9f0ed] p-5"><div className="overflow-hidden rounded-[22px] border border-[#cddbd5] bg-[#27323b] text-white shadow-xl"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div className="flex items-center gap-2 text-xs font-bold"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f4b64f] text-[#27323b]"><Navigation size={13} /></span>COBERTURA EN VIVO</div><span className="rounded-full bg-[#a7dfc4] px-2 py-1 text-[9px] font-bold text-[#27323b]">12 ACTIVAS</span></div><div className="relative min-h-[215px] overflow-hidden bg-[#35424a]"><div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(28deg, transparent 48%, #a7dfc4 49%, #a7dfc4 51%, transparent 52%), linear-gradient(112deg, transparent 46%, #a7dfc4 47%, #a7dfc4 48%, transparent 49%), linear-gradient(#8ea49a 1px, transparent 1px), linear-gradient(90deg, #8ea49a 1px, transparent 1px)", backgroundSize: "100% 100%, 100% 100%, 34px 34px, 34px 34px" }} /><div className="absolute left-[47%] top-[36%] h-24 w-24 rounded-full border-2 border-[#f4b64f]/70 bg-[#f4b64f]/10" /><span className="absolute left-[52%] top-[43%] h-3 w-3 rounded-full bg-[#f4b64f] shadow-[0_0_0_6px_rgba(244,182,79,0.2)]" /><span className="absolute left-[27%] top-[63%] h-2.5 w-2.5 rounded-full bg-[#a7dfc4]" /><div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-[#27323b]/90 px-3 py-2"><span className="flex items-center gap-1 text-[9px] text-[#d9e5df]"><MapPin size={11} />El Poblado</span><span className="text-[9px] text-[#f4b64f]">3 técnicos cerca</span></div></div></div></div>;
}

function QueueItem({ category, title, price, tone }: { category: string; title: string; price: string; tone: "lime" | "blue" }) {
  return <div className="rounded-xl border border-white/10 bg-[#1d2d5a] p-3"><div className="flex items-center justify-between text-[9px] font-semibold"><span className={tone === "lime" ? "text-[#c7ff54]" : "text-[#9fb5ff]"}>{category}</span><Clock3 size={11} className="text-[#8b9ac4]" /></div><p className="mt-2 text-[11px] font-semibold leading-4 text-white">{title}</p><div className="mt-3 flex items-center justify-between text-[9px] text-[#9eacd0]"><span>Hace 8 min</span><strong className="text-[#c7ff54]">{price}</strong></div></div>;
}
