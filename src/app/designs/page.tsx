import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  Sparkles,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";

const designs = [
  {
    id: "confianza",
    number: "01",
    name: "Confianza local",
    label: "Recomendado",
    description: "Una experiencia cálida y ordenada que transmite seguridad desde el primer vistazo.",
    ideal: "Marketplace general · clientes y técnicos",
    strengths: ["Se siente confiable", "Escala bien a panel administrativo", "Jerarquía clara para pagos y estados"],
    tradeoff: "Más sobrio y menos agresivo para captar técnicos rápidamente.",
    colors: ["#173a37", "#a3e635", "#f7f9f7", "#dcefd8"],
  },
  {
    id: "radar",
    number: "02",
    name: "Radar urbano",
    label: "Velocidad",
    description: "Una interfaz con más energía visual para técnicos que necesitan detectar oportunidades y responder rápido.",
    ideal: "Técnicos en movimiento · alta frecuencia de ofertas",
    strengths: ["Prioriza solicitudes nuevas", "Sensación de tiempo real", "Acciones primarias muy visibles"],
    tradeoff: "Puede sentirse más intensa para clientes que buscan tranquilidad.",
    colors: ["#151719", "#ffbd59", "#25292c", "#d8f26b"],
  },
  {
    id: "cercania",
    number: "03",
    name: "Cercanía humana",
    label: "Cliente primero",
    description: "Una experiencia más amable y editorial para explicar el servicio, comparar técnicos y reducir ansiedad.",
    ideal: "Clientes nuevos · servicios para el hogar",
    strengths: ["Muy fácil de entender", "Reduce fricción en la publicación", "Refuerza el acompañamiento"],
    tradeoff: "Necesita más trabajo visual para el radar profesional del técnico.",
    colors: ["#3b4754", "#ed8c6d", "#fbf7f0", "#dce9f0"],
  },
];

export default function DesignExplorationPage() {
  return (
    <main className="min-h-screen bg-[#f5f7f4] px-5 py-8 text-[#173a37] md:px-8 md:py-12 xl:px-14">
      <div className="mx-auto max-w-[1440px]">
        <header className="flex flex-col justify-between gap-6 border-b border-[#dfe8e0] pb-8 md:flex-row md:items-end">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#4d9c5a] transition hover:text-[#173a37]"><ChevronRight size={14} className="rotate-180" />Volver al MVP</Link>
            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#72917e]">Laboratorio de producto · Manos a la obra</p>
            <h1 className="mt-3 max-w-[760px] text-4xl font-semibold tracking-[-0.065em] text-[#173a37] md:text-6xl">Tres formas de hacer que pedir ayuda se sienta fácil.</h1>
            <p className="mt-5 max-w-[670px] text-sm leading-6 text-[#73827b] md:text-base">Antes de ampliar funcionalidades, definamos la personalidad visual. Estas tres rutas conservan el mismo producto, pero cambian el énfasis de la experiencia.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-[#dce8dc] bg-white px-4 py-3 text-xs font-semibold text-[#587361] shadow-sm"><Sparkles size={16} className="text-[#76a459]" />Exploración visual v1</div>
        </header>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#dce8dc] bg-white p-5 shadow-[0_10px_30px_rgba(39,65,60,0.04)]"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef7e9] text-[#4d9c5a]"><ShieldCheck size={19} /></div><h2 className="mt-4 text-base font-semibold">Confianza</h2><p className="mt-2 text-xs leading-5 text-[#83918b]">El usuario debe saber quién responde, cuánto cuesta y cuándo se revela la dirección.</p></div>
          <div className="rounded-2xl border border-[#dce8dc] bg-white p-5 shadow-[0_10px_30px_rgba(39,65,60,0.04)]"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff5dc] text-[#bb842b]"><Zap size={19} /></div><h2 className="mt-4 text-base font-semibold">Velocidad</h2><p className="mt-2 text-xs leading-5 text-[#83918b]">El técnico debe encontrar una solicitud adecuada y enviar una propuesta sin fricción.</p></div>
          <div className="rounded-2xl border border-[#dce8dc] bg-white p-5 shadow-[0_10px_30px_rgba(39,65,60,0.04)]"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef3fb] text-[#5682b3]"><LayoutDashboard size={19} /></div><h2 className="mt-4 text-base font-semibold">Claridad</h2><p className="mt-2 text-xs leading-5 text-[#83918b]">La persona debe entender el estado del servicio sin conocer términos técnicos del marketplace.</p></div>
        </section>

        <div className="mt-10 grid gap-6 xl:grid-cols-3">
          {designs.map((design) => <DesignCard key={design.id} {...design} />)}
        </div>

        <section className="mt-10 flex flex-col justify-between gap-5 rounded-3xl bg-[#173a37] p-6 text-white md:flex-row md:items-center md:p-8">
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a3e635]">Siguiente decisión</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Mi recomendación: comenzar con “Confianza local”.</h2><p className="mt-2 max-w-[710px] text-sm leading-6 text-[#b6cac4]">Es la base más equilibrada para el MVP: permite crecer hacia un radar rápido sin perder claridad en pagos, seguridad y estados del servicio.</p></div><Link href="/" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#a3e635] px-5 py-3 text-xs font-bold text-[#18312f] transition hover:bg-[#b4ee4f]">Ver diseño actual <ArrowRight size={15} /></Link>
        </section>
      </div>
    </main>
  );
}

function DesignCard({ id, number, name, label, description, ideal, strengths, tradeoff, colors }: { id: string; number: string; name: string; label: string; description: string; ideal: string; strengths: string[]; tradeoff: string; colors: string[] }) {
  return <article className="overflow-hidden rounded-3xl border border-[#dfe8e0] bg-white shadow-[0_12px_35px_rgba(39,65,60,0.05)]"><div className="border-b border-[#edf1ed] p-5 pb-4"><div className="flex items-center justify-between"><span className="text-[11px] font-semibold tracking-[0.12em] text-[#91a09a]">{number} / 03</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${id === "confianza" ? "bg-[#eaf5e8] text-[#4d8c54]" : id === "radar" ? "bg-[#fff2d4] text-[#9b722a]" : "bg-[#fbe9e3] text-[#b96d54]"}`}>{label}</span></div><h2 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-[#173a37]">{name}</h2><p className="mt-2 text-xs leading-5 text-[#7c8b84]">{description}</p></div><div><Preview id={id} /><div className="flex gap-1 bg-white px-5 pb-4">{colors.map((color) => <span key={color} className="h-2 flex-1 rounded-full" style={{ backgroundColor: color }} />)}</div></div><div className="space-y-5 p-5"><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#95a19c]">Ideal para</p><p className="mt-1 text-xs font-semibold text-[#52645d]">{ideal}</p></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#95a19c]">Fortalezas</p><ul className="mt-2 space-y-2">{strengths.map((strength) => <li key={strength} className="flex items-start gap-2 text-xs text-[#65766e]"><Check size={14} className="mt-0.5 shrink-0 text-[#6fa35b]" />{strength}</li>)}</ul></div><div className="border-t border-[#edf1ed] pt-4"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#95a19c]">Trade-off</p><p className="mt-1 text-xs leading-5 text-[#7f8d87]">{tradeoff}</p></div></div></article>;
}

function Preview({ id }: { id: string }) {
  if (id === "radar") return <div className="bg-[#151719] p-4"><div className="overflow-hidden rounded-2xl border border-white/10 bg-[#202427] shadow-2xl"><div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div className="flex items-center gap-2"><div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#d8f26b] text-[#151719]"><Zap size={13} /></div><span className="text-[10px] font-semibold text-white">RADAR / MEDELLÍN</span></div><span className="flex items-center gap-1 text-[9px] text-[#d8f26b]"><span className="h-1.5 w-1.5 rounded-full bg-[#d8f26b]" />EN LÍNEA</span></div><div className="grid grid-cols-[1.05fr_0.95fr] gap-3 p-3"><div className="relative min-h-[190px] overflow-hidden rounded-xl bg-[#2b3435]"><div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(#89958d 1px, transparent 1px), linear-gradient(90deg, #89958d 1px, transparent 1px)", backgroundSize: "28px 28px" }} /><div className="absolute left-[42%] top-[39%] h-16 w-16 rounded-full border border-[#d8f26b]/50 bg-[#d8f26b]/10" /><div className="absolute left-[53%] top-[46%] h-2.5 w-2.5 rounded-full bg-[#ffbd59] shadow-[0_0_0_5px_rgba(255,189,89,0.15)]" /><div className="absolute left-[26%] top-[61%] h-2 w-2 rounded-full bg-[#d8f26b]" /><div className="absolute bottom-3 left-3 rounded-lg bg-[#151719]/80 px-2 py-1 text-[9px] text-[#e8efea]">12 oportunidades · radio 5 km</div></div><div className="space-y-2"><div className="rounded-xl border border-white/10 bg-[#2b3033] p-3"><div className="flex justify-between text-[9px] text-[#9da9a1]"><span>PLOMERÍA</span><span className="text-[#d8f26b]">NUEVA</span></div><p className="mt-2 text-[11px] font-semibold leading-4 text-white">Fuga de agua en cocina</p><div className="mt-3 flex items-center justify-between text-[9px] text-[#9da9a1]"><span>El Poblado · 2.4 km</span><strong className="text-[#ffbd59]">$250k</strong></div></div><div className="rounded-xl border border-white/10 bg-[#2b3033] p-3 opacity-70"><div className="flex justify-between text-[9px] text-[#9da9a1]"><span>ELECTRICIDAD</span><span>MAÑANA</span></div><p className="mt-2 text-[11px] font-semibold leading-4 text-white">Instalar lámparas</p><div className="mt-3 text-[9px] text-[#9da9a1]">Laureles · 3.1 km</div></div></div></div></div></div>;
  if (id === "cercania") return <div className="bg-[#fbf7f0] p-4"><div className="overflow-hidden rounded-2xl border border-[#e8ded2] bg-[#fffdf9] shadow-[0_14px_30px_rgba(106,79,54,0.08)]"><div className="flex items-center justify-between border-b border-[#efe7de] px-4 py-3"><div className="flex items-center gap-2"><div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#ed8c6d] text-white"><Wrench size={13} /></div><span className="text-[10px] font-semibold text-[#3b4754]">Manos a la obra</span></div><span className="text-[9px] text-[#87929b]">Hola, Camilo</span></div><div className="p-4"><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#ed8c6d]">¿Qué necesitas resolver?</p><h3 className="mt-2 max-w-[230px] text-[19px] font-semibold leading-6 tracking-[-0.05em] text-[#3b4754]">Encuentra a alguien de confianza cerca de ti.</h3><div className="mt-4 flex items-center gap-2 rounded-xl border border-[#e8ded2] bg-[#fffaf4] px-3 py-2.5 text-[10px] text-[#9a9e9b]"><MapPin size={13} className="text-[#ed8c6d]" />Tu zona: El Poblado<ChevronRight size={13} className="ml-auto" /></div><div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-xl bg-[#dce9f0] p-3"><Wrench size={15} className="text-[#5c7c8d]" /><p className="mt-4 text-[10px] font-semibold text-[#3b4754]">Reparaciones</p><p className="mt-1 text-[9px] text-[#768793]">12 técnicos</p></div><div className="rounded-xl bg-[#fbe4d9] p-3"><Sparkles size={15} className="text-[#c87a60]" /><p className="mt-4 text-[10px] font-semibold text-[#3b4754]">Hogar</p><p className="mt-1 text-[9px] text-[#768793]">8 categorías</p></div></div><button type="button" className="mt-4 w-full rounded-xl bg-[#ed8c6d] py-2.5 text-[10px] font-bold text-white">Publicar una solicitud</button></div></div></div>;
  return <div className="bg-[#f7f9f7] p-4"><div className="overflow-hidden rounded-2xl border border-[#dce8dc] bg-[#fbfcfa] shadow-[0_14px_30px_rgba(39,65,60,0.08)]"><div className="flex items-center justify-between border-b border-[#e7ece9] px-4 py-3"><div className="flex items-center gap-2"><div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#a3e635] text-[#173a37]"><Wrench size={13} /></div><span className="text-[10px] font-semibold text-[#173a37]">Manos a la obra</span></div><span className="text-[9px] font-semibold text-[#6f8277]">Técnico verificado</span></div><div className="grid grid-cols-[0.9fr_1.1fr] gap-3 p-4"><div><p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#72917e]">Tu jornada</p><h3 className="mt-2 text-[18px] font-semibold leading-5 tracking-[-0.05em] text-[#173a37]">Hay 12 oportunidades cerca de ti.</h3><div className="mt-4 rounded-xl bg-[#dcefd8] p-3"><div className="flex items-center gap-1 text-[9px] font-bold text-[#4d8c54]"><Wallet size={12} />SALDO PREPAGO</div><p className="mt-2 text-[17px] font-semibold text-[#173a37]">$180.000</p><div className="mt-2 h-1 rounded-full bg-white/70"><div className="h-1 w-[72%] rounded-full bg-[#79ab62]" /></div></div></div><div className="space-y-2"><div className="rounded-xl border border-[#e7ece9] bg-white p-3"><div className="flex items-center justify-between"><span className="text-[9px] font-semibold text-[#72917e]">PLOMERÍA</span><span className="flex items-center gap-1 text-[9px] text-[#4d9c5a]"><Clock3 size={11} />Hoy</span></div><p className="mt-2 text-[11px] font-semibold text-[#173a37]">Reparar fuga de agua</p><div className="mt-3 flex items-center justify-between text-[9px] text-[#8b9993]"><span>El Poblado</span><strong className="text-[#173a37]">$250.000</strong></div></div><div className="rounded-xl border border-[#e7ece9] bg-white p-3 opacity-70"><div className="flex items-center justify-between"><span className="text-[9px] font-semibold text-[#72917e]">PINTURA</span><span className="text-[9px] text-[#8b9993]">Sábado</span></div><p className="mt-2 text-[11px] font-semibold text-[#173a37]">Pintar una habitación</p></div></div></div></div></div>;
}
