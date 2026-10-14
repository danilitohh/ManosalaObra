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
  Star,
  UserRound,
  Wallet,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { Button, Card, Chip } from "@heroui/react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { KokonutGlassCard } from "@/components/ui/kokonut-glass-card";
import { MapboxRadar } from "@/components/maps/MapboxRadar";
import { ReactBitsReveal } from "@/components/ui/react-bits-reveal";
import { ServiceCategoryIcon } from "@/components/ui/service-category-icon";
import {
  commissionFor,
  advanceService,
  completeDigitalPayment,
  confirmServiceCompletion,
  createOffer,
  createRequest,
  currentClient,
  currentTechnician,
  demoTechnicians,
  distanceBetween,
  initialMarketplaceState,
  locationForSector,
  type GeoPoint,
  type MarketplaceState,
  type Offer,
  type PaymentMethod,
  type Service,
  type ServiceRequest,
  type UserRole,
  selectOffer,
  cancelService,
  rechargeWallet,
  technicianPayoutFor,
} from "@/lib/marketplace";

type Mode = "technician" | "client";

type NavItem = {
  label: string;
  icon: LucideIcon;
  badge?: string;
};

const STORAGE_KEY = "manos-a-la-obra:marketplace:v1";
const TECHNICIAN_AVAILABILITY_KEY = "manos-a-la-obra:technician:available:v1";
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

const formatCOP = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
const paymentLabel = (method: PaymentMethod) => method === "cash" ? "Efectivo" : "Pago digital";
const paymentTone = (method: PaymentMethod) => method === "cash" ? "bg-[#fff5dc] text-[#a57820]" : "bg-[#eef3fb] text-[#5682b3]";
const statusLabel = (status: Service["status"]) => ({ assigned: "Asignado", en_route: "En camino", in_progress: "En servicio", completion_pending: "Esperando confirmación", completed: "Finalizado", cancelled: "Cancelado", payment_pending: "Pago pendiente" })[status];

function compressPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No pudimos leer esta foto."));
    reader.onload = () => {
      const image = new window.Image();
      image.onerror = () => reject(new Error("El archivo seleccionado no es una imagen válida."));
      image.onload = () => {
        const scale = Math.min(1, 1280 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) { reject(new Error("No pudimos preparar esta foto.")); return; }
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function LedgerButton({ children, className = "", isDisabled = false, onPress, size = "sm", type = "button", variant = "primary" }: { children: ReactNode; className?: string; isDisabled?: boolean; onPress?: () => void; size?: "sm" | "md" | "lg"; type?: "button" | "submit"; variant?: "primary" | "secondary" | "tertiary" | "outline" | "ghost" | "danger" }) {
  return <Button className={`font-semibold tracking-[-0.01em] ${className}`} isDisabled={isDisabled} onPress={onPress} size={size} type={type} variant={variant}>{children}</Button>;
}

function LedgerChip({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <Chip.Root className={`h-6 rounded-full border px-2.5 text-[10px] font-semibold ${className}`}><Chip.Label>{children}</Chip.Label></Chip.Root>;
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3"><Wrench aria-hidden="true" className="text-[#b7c9ff]" size={22} />{!compact && <div><div className="text-[17px] font-semibold tracking-[-0.04em] text-white">Manos a la obra</div><div className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#9bb2ad]">Servicios locales</div></div>}</div>;
}

function Sidebar({ mode, activeNav, onNavChange }: { mode: Mode; activeNav: string; onNavChange: (label: string) => void }) {
  const items = mode === "technician" ? technicianNav : clientNav;
  return <aside className="hidden min-h-screen w-[255px] shrink-0 flex-col justify-between bg-[#19242d] px-5 py-6 lg:flex"><div><BrandMark /><div className="mt-12"><p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#88a7a0]">{mode === "technician" ? "Espacio del técnico" : "Espacio del cliente"}</p><div className="space-y-1">{items.map((item) => { const Icon = item.icon; const isActive = activeNav === item.label; return <button key={item.label} type="button" onClick={() => onNavChange(item.label)} className={`group flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-[13px] font-medium transition ${isActive ? "bg-[#dce4ff] text-[#19242d] shadow-sm" : "text-[#b5c9c4] hover:bg-white/8 hover:text-white"}`}><span className="flex items-center gap-3"><Icon size={17} strokeWidth={isActive ? 2.3 : 1.8} />{item.label}</span>{item.badge && <span className={`rounded-full px-2 py-0.5 text-[10px] ${isActive ? "bg-[#b7c9ff] text-[#19242d]" : "bg-white/10 text-[#bdd0cb]"}`}>{item.badge}</span>}</button>; })}</div></div><div className="mt-10"><p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#88a7a0]">Cuenta</p><div className="space-y-1"><button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium text-[#b5c9c4] transition hover:bg-white/8 hover:text-white"><Settings size={17} strokeWidth={1.8} />Configuración</button><button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium text-[#b5c9c4] transition hover:bg-white/8 hover:text-white"><CircleHelp size={17} strokeWidth={1.8} />Centro de ayuda</button></div></div></div><div className="rounded-2xl border border-white/10 bg-white/7 p-4"><div className="mb-3 flex items-center gap-2 text-[#dce9e5]"><ShieldCheck size={15} /><span className="text-xs font-semibold">{mode === "technician" ? "Perfil verificado" : "Tu dirección protegida"}</span></div><p className="text-[11px] leading-5 text-[#9bb2ad]">{mode === "technician" ? "Tus datos y certificaciones ayudan a construir confianza en cada servicio." : "La ubicación exacta solo se comparte con el técnico cuando el servicio queda asignado."}</p><button type="button" className="mt-3 text-[11px] font-semibold text-[#b7c9ff] hover:text-white">{mode === "technician" ? "Ver mi perfil →" : "Conocer cómo funciona →"}</button></div></aside>;
}

function StatCard({ icon: Icon, label, value, note, positive, accent }: { icon: LucideIcon; label: string; value: string; note: string; positive?: boolean; accent: string }) {
  return <ReactBitsReveal><Card.Root className="rounded-2xl border border-[#e1e6ed] bg-white shadow-[0_10px_28px_rgba(40,52,68,0.045)]"><Card.Content className="p-5"><div className="flex items-start justify-between"><Icon aria-hidden="true" className={accent} size={19} />{positive && <span className="flex items-center gap-1 text-[11px] font-semibold text-[#4d69d8]"><ArrowUpRight size={13} />8.4%</span>}</div><p className="mt-4 text-[11px] font-medium uppercase tracking-[0.1em] text-[#8793a0]">{label}</p><p className="mt-1 text-[25px] font-semibold tracking-[-0.05em] text-[#19242d]">{value}</p><p className="mt-1 text-[11px] text-[#8d98a5]">{note}</p></Card.Content></Card.Root></ReactBitsReveal>;
}

function LedgerRequestCard({ request, offerCount, offered, onOpen, onOffer, isAvailable }: { request: ServiceRequest; offerCount: number; offered: boolean; onOpen: (request: ServiceRequest) => void; onOffer: (request: ServiceRequest) => void; isAvailable: boolean }) {
  const netValue = technicianPayoutFor(request.budget);
  return (
    <KokonutGlassCard className="group rounded-2xl border border-[#e1e6ed] bg-white shadow-[0_10px_28px_rgba(40,52,68,0.045)] transition hover:border-[#b9c7ef] hover:shadow-[0_16px_38px_rgba(40,52,68,0.09)]">
      <article className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3"><ServiceCategoryIcon category={request.category} className="mt-1 text-[#4d69d8]" /><div>
            <div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-semibold text-[#6e7d8d]">{request.category}</span><span className="h-1 w-1 rounded-full bg-[#b8c2cd]" /><span className="text-[11px] text-[#8b97a3]">{request.desiredDate}</span></div>
            <h3 className="mt-1 text-[15px] font-semibold tracking-[-0.02em] text-[#19242d]">{request.title}</h3>
          </div></div>
          <button type="button" aria-label="Más opciones" className="rounded-lg p-1.5 text-[#9aa6b2] transition hover:bg-[#f1f3f8] hover:text-[#19242d]"><MoreHorizontal size={18} /></button>
        </div>
        <p className="mt-4 line-clamp-2 text-[12px] leading-5 text-[#71808f]">{request.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-[#7c8996]">
          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#4d69d8]" />{request.sector} · {request.distance}</span>
          <LedgerChip className={paymentTone(request.paymentMethod)}>{paymentLabel(request.paymentMethod)}</LedgerChip>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#edf0f4] pt-4">
          <div><p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#97a1ac]">Presupuesto</p><p className="mt-0.5 text-[17px] font-semibold tracking-[-0.04em] text-[#19242d]">{formatCOP(request.budget)}</p></div>
          <div className="text-right"><p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#97a1ac]">Te quedarían aprox.</p><p className="mt-0.5 text-[17px] font-semibold tracking-[-0.04em] text-[#4d69d8]">{formatCOP(netValue)}</p></div>
        </div>
        <p className="mt-2 text-[10px] text-[#9aa5a1]">Estimación después de la comisión del 10% · {offerCount} interesados</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <LedgerButton variant="outline" onPress={() => onOpen(request)} className="border-[#d8e0e8] bg-white text-[#53677a] hover:border-[#9eafe8] hover:bg-[#f5f7ff]">Ver detalle</LedgerButton>
          <LedgerButton onPress={() => onOffer(request)} isDisabled={offered || !isAvailable} className={offered ? "bg-[#eef1ff] text-[#4d69d8]" : "bg-[#19242d] text-white hover:bg-[#2a3a49]"}>{offered ? <><Check size={15} />Enviada</> : <>{isAvailable ? "Postularme" : "Activa el radar"} <ArrowUpRight size={15} /></>}</LedgerButton>
        </div>
      </article>
    </KokonutGlassCard>
  );
}
function LedgerBalanceCard({ balance, onRecharge }: { balance: number; onRecharge: () => void }) {
  return <KokonutGlassCard className="relative overflow-hidden rounded-2xl bg-[#19242d] text-white shadow-[0_14px_36px_rgba(25,36,45,0.18)]"><div className="absolute -right-8 -top-10 h-32 w-32 rounded-full border-[18px] border-white/5" /><div className="absolute -bottom-14 -right-2 h-36 w-36 rounded-full border-[18px] border-[#4d69d8]/15" /><div className="relative p-5"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-medium text-[#b4c0cb]"><Wallet size={15} />Saldo prepago</span><MoreHorizontal size={18} className="text-[#9eacba]" /></div><p className="mt-5 text-[30px] font-semibold tracking-[-0.06em]">{formatCOP(balance)}</p><p className="mt-1 text-[11px] text-[#9eacba]">Disponible para comisiones</p><div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/7 px-3 py-2.5"><span className="text-[11px] text-[#acb8c4]">Comisión siguiente</span><span className="text-[11px] font-semibold text-[#cbd5ff]">Desde $18.000</span></div><LedgerButton onPress={onRecharge} className="mt-4 w-full bg-[#4d69d8] text-white hover:bg-[#6d82e8]"><Plus size={15} />Simular recarga +$100.000</LedgerButton></div></KokonutGlassCard>;
}

function OfferModal({ request, onClose, onSent, alreadyOffered }: { request: ServiceRequest; onClose: () => void; onSent: (price: number, message: string) => void; alreadyOffered: boolean }) {
  const [amount, setAmount] = useState(String(request.budget));
  const [message, setMessage] = useState("");
  const price = Number(amount) || 0;
  const isBudgetMatch = price === request.budget;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (price > 0 && !alreadyOffered) onSent(price, message || "Tengo disponibilidad para realizar este servicio.");
  };

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-start justify-between">
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6679b1]">{alreadyOffered ? "Tu propuesta" : "Propuesta para el cliente"}</p><h2 className="mt-1 max-w-[350px] text-xl font-semibold tracking-[-0.04em] text-[#19242d]">{request.title}</h2><p className="mt-1 flex items-center gap-1 text-xs text-[#82908b]"><MapPin size={13} />{request.sector} · {request.distance}</p></div>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 text-[#84928d] transition hover:bg-[#f1f3f8] hover:text-[#19242d]"><X size={18} /></button>
      </div>
      <div className="mt-5 rounded-2xl bg-[#f1f3f8] p-4">
        <p className="text-xs font-semibold text-[#3f55a2]">Lo que solicita el cliente</p><p className="mt-2 text-[12px] leading-5 text-[#6f8178]">{request.description}</p>
        <div className="mt-3 flex flex-wrap gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${paymentTone(request.paymentMethod)}`}>{paymentLabel(request.paymentMethod)}</span><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[#71837a]">{request.desiredDate}</span></div>
      </div>
      <form onSubmit={submit}>
        <label htmlFor="offer-price" className="mt-5 block text-xs font-semibold text-[#5d6f69]">Tu precio total</label>
        <div className="mt-2 flex items-center gap-2 border-b border-[#dfe8e0] pb-2"><span className="text-lg font-semibold text-[#94a19b]">$</span><input id="offer-price" type="number" min="1" step="1000" required value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full bg-transparent text-2xl font-semibold tracking-[-0.05em] text-[#19242d] outline-none" /></div>
        <div className="mt-3 space-y-2 rounded-xl border border-[#e5ebe6] bg-white p-3 text-[11px]">
          <div className="flex justify-between"><span className="text-[#8a9892]">Comisión de administración · 10%</span><strong className="text-[#52655e]">{formatCOP(commissionFor(price))}</strong></div>
          <div className="flex justify-between"><span className="text-[#8a9892]">Recibirías neto aprox.</span><strong className="text-[#4d69d8]">{formatCOP(technicianPayoutFor(price))}</strong></div>
        </div>
        <label htmlFor="offer-message" className="mt-5 block text-xs font-semibold text-[#5d6f69]">Mensaje al cliente <span className="font-normal text-[#a0aaa6]">(opcional)</span></label>
        <textarea id="offer-message" value={message} onChange={(event) => setMessage(event.target.value)} rows={3} placeholder="Cuéntale brevemente cómo resolverías el trabajo..." className="mt-2 w-full resize-none rounded-xl border border-[#e5ebe6] bg-white p-3 text-xs leading-5 text-[#19242d] outline-none placeholder:text-[#a8b3af] focus:border-[#8fa4ee] focus:ring-4 focus:ring-[#4d69d8]/10" />
        <div className="mt-4 flex gap-2 rounded-xl bg-[#fff8e9] px-3 py-2.5 text-[11px] leading-4 text-[#957743]"><ShieldCheck size={15} className="mt-0.5 shrink-0" />Solo se muestra el sector general. La dirección exacta aparece cuando el servicio queda asignado.</div>
        <button type="submit" disabled={alreadyOffered || price <= 0} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4d69d8] px-4 py-3 text-[12px] font-bold text-white transition hover:bg-[#6d82e8] disabled:cursor-not-allowed disabled:opacity-50">{alreadyOffered ? <><Check size={15} />Propuesta ya enviada</> : <>{isBudgetMatch ? "Postularme por el presupuesto" : "Enviar contraoferta"} <ArrowUpRight size={15} /></>}</button>
      </form>
    </ModalShell>
  );
}
function CreateRequestModal({ onClose, onCreate }: { onClose: () => void; onCreate: (request: Omit<ServiceRequest, "id" | "clientId" | "status" | "createdAt">) => void }) {
  const [category, setCategory] = useState("Plomería");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sector, setSector] = useState("El Poblado");
  const [exactAddress, setExactAddress] = useState("");
  const [supportPhotos, setSupportPhotos] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [budget, setBudget] = useState("250000");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [desiredDate, setDesiredDate] = useState("Esta semana");
  const addPhotos = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (!files.length) return;
    const slots = 3 - supportPhotos.length;
    if (slots <= 0) { setPhotoError("Puedes adjuntar hasta 3 fotos por solicitud."); return; }
    if (files.slice(0, slots).some((file) => file.size > 5 * 1024 * 1024)) { setPhotoError("Cada foto debe pesar menos de 5 MB."); return; }
    try {
      const compressed = await Promise.all(files.slice(0, slots).map(compressPhoto));
      setSupportPhotos((current) => [...current, ...compressed].slice(0, 3));
      setPhotoError(files.length > slots ? "Se agregaron solo las primeras fotos permitidas." : "");
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : "No pudimos cargar las fotos.");
    }
  };
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onCreate({ category, title, description, sector, exactAddress, supportPhotos, distance: "1.8 km", budget: Number(budget), paymentMethod, desiredDate }); };
  return <ModalShell onClose={onClose}><div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6679b1]">Nueva solicitud</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-[#19242d]">Cuéntanos qué necesitas</h2><p className="mt-1 text-xs text-[#82908b]">Los técnicos certificados cerca de ti podrán enviar propuestas.</p></div><button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 text-[#84928d] transition hover:bg-[#f1f3f8] hover:text-[#19242d]"><X size={18} /></button></div><form onSubmit={submit} className="mt-5 space-y-4"><div className="grid gap-3 sm:grid-cols-2"><Field label="Categoría"><select value={category} onChange={(event) => setCategory(event.target.value)} className="input-style"><option>Plomería</option><option>Electricidad</option><option>Pintura</option><option>Climatización</option><option>Carpintería</option></select></Field><Field label="Sector general"><select value={sector} onChange={(event) => setSector(event.target.value)} className="input-style"><option>El Poblado</option><option>Laureles</option><option>Belén</option><option>Envigado</option><option>Centro</option></select></Field></div><Field label="Dirección exacta (privada)"><input required value={exactAddress} onChange={(event) => setExactAddress(event.target.value)} placeholder="Dirección donde se realizará el trabajo" className="input-style" /></Field><Field label="¿Qué necesitas hacer?"><input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Reparar fuga de agua en cocina" className="input-style" /></Field><Field label="Describe la actividad"><textarea required value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Agrega detalles, medidas, materiales o cualquier información útil..." className="input-style resize-none" /></Field><Field label="Fotos de soporte (opcional)"><div className="rounded-xl border border-dashed border-[#d8e0e8] p-3"><input type="file" accept="image/*" multiple disabled={supportPhotos.length >= 3} onChange={addPhotos} className="block w-full text-[11px] text-[#65746f] file:mr-3 file:rounded-lg file:border-0 file:bg-[#eef1ff] file:px-3 file:py-2 file:text-[10px] file:font-semibold file:text-[#4d69d8] disabled:opacity-50" /><p className="mt-2 text-[10px] text-[#929e99]">Hasta 3 fotos · máximo 5 MB cada una · se optimizan al adjuntar.</p>{photoError && <p role="alert" className="mt-2 text-[10px] text-[#bd7255]">{photoError}</p>}{supportPhotos.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2">{supportPhotos.map((photo, index) => <div key={photo.slice(-32)} className="relative"><NextImage src={photo} alt={`Foto de soporte ${index + 1}`} width={112} height={80} unoptimized className="h-20 w-full rounded-lg object-cover" /><button type="button" aria-label={`Quitar foto ${index + 1}`} onClick={() => setSupportPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))} className="absolute right-1 top-1 rounded-md bg-white/90 px-1.5 py-1 text-[10px] font-semibold text-[#52655e]">Quitar</button></div>)}</div>}</div></Field><div className="grid gap-3 sm:grid-cols-2"><Field label="Presupuesto estimado"><input required type="number" min="1" value={budget} onChange={(event) => setBudget(event.target.value)} className="input-style" /></Field><Field label="¿Cuándo lo necesitas?"><input value={desiredDate} onChange={(event) => setDesiredDate(event.target.value)} placeholder="Ej. Mañana en la mañana" className="input-style" /></Field></div><Field label="Método de pago"><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setPaymentMethod("cash")} className={`rounded-xl border px-3 py-3 text-left text-xs transition ${paymentMethod === "cash" ? "border-[#b7c5ee] bg-[#f0f4ff] text-[#3f55a2]" : "border-[#e5ebe6] text-[#7f8d88]"}`}><span className="block font-semibold">Efectivo</span><span className="mt-1 block text-[10px] opacity-75">Pago directo al técnico</span></button><button type="button" onClick={() => setPaymentMethod("digital")} className={`rounded-xl border px-3 py-3 text-left text-xs transition ${paymentMethod === "digital" ? "border-[#a8c3df] bg-[#eff4fb] text-[#5682b3]" : "border-[#e5ebe6] text-[#7f8d88]"}`}><span className="block font-semibold">Pago digital</span><span className="mt-1 block text-[10px] opacity-75">Paga al finalizar</span></button></div></Field><div className="flex gap-2 rounded-xl bg-[#f1f3f8] px-3 py-2.5 text-[11px] leading-4 text-[#586a9a]"><ShieldCheck size={15} className="mt-0.5 shrink-0" />Tu dirección solo se comparte con el técnico asignado. En esta demo se guarda en el almacenamiento local del navegador.</div><button type="submit" disabled={!title || !description || !exactAddress.trim() || Number(budget) <= 0} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#19242d] px-4 py-3 text-[12px] font-semibold text-white transition hover:bg-[#2a3a49] disabled:cursor-not-allowed disabled:opacity-50"><Plus size={15} />Publicar solicitud</button></form></ModalShell>;
}

function OffersModal({ request, offers, onClose, onSelect, selectedService }: { request: ServiceRequest; offers: Offer[]; onClose: () => void; onSelect: (offerId: string) => void; selectedService?: Service }) {
  return <ModalShell onClose={onClose}><div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6679b1]">Propuestas recibidas</p><h2 className="mt-1 max-w-[370px] text-xl font-semibold tracking-[-0.04em] text-[#19242d]">{request.title}</h2><p className="mt-1 text-xs text-[#82908b]">{offers.length} técnicos interesados · {paymentLabel(request.paymentMethod)}</p></div><button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 text-[#84928d] transition hover:bg-[#f1f3f8] hover:text-[#19242d]"><X size={18} /></button></div><div className="mt-5 space-y-3">{offers.length === 0 && <div className="rounded-2xl border border-dashed border-[#cddbd0] px-5 py-8 text-center"><UserRound size={22} className="mx-auto text-[#a5b4ad]" /><p className="mt-3 text-sm font-semibold text-[#52665e]">Aún no hay propuestas</p><p className="mt-1 text-xs text-[#8b9993]">Te avisaremos cuando un técnico se interese.</p></div>}{offers.map((offer) => { const technician = demoTechnicians.find((item) => item.id === offer.technicianId) ?? currentTechnician; return <div key={offer.id} className={`rounded-2xl border p-4 ${offer.status === "accepted" ? "border-[#b7c5ee] bg-[#f5f6ff]" : "border-[#e5ebe6] bg-white"}`}><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dce4ff] text-xs font-bold text-[#4f65a5]">{technician.initials}</div><div><div className="flex items-center gap-1.5"><p className="text-sm font-semibold text-[#19242d]">{technician.name}</p>{technician.verified && <ShieldCheck size={14} className="text-[#4d69d8]" />}</div><p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#85938d]"><Star size={12} className="fill-[#e6ad3f] text-[#e6ad3f]" />{technician.rating} · {technician.completedServices} servicios</p></div></div><div className="text-right"><p className="text-lg font-semibold tracking-[-0.04em] text-[#19242d]">{formatCOP(offer.price)}</p><p className="text-[10px] text-[#9aa5a1]">{offer.createdAt}</p></div></div><p className="mt-3 text-[11px] leading-5 text-[#71807b]">{offer.message}</p><div className="mt-3 flex items-center justify-between border-t border-[#edf1ed] pt-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${offer.status === "accepted" ? "bg-[#e9edff] text-[#4d69d8]" : "bg-[#f3f5f3] text-[#81908a]"}`}>{offer.status === "accepted" ? "Seleccionada" : "Disponible"}</span>{offer.status === "pending" && !selectedService && request.status === "published" && <button type="button" onClick={() => onSelect(offer.id)} className="rounded-xl bg-[#19242d] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#2a3a49]">Seleccionar técnico</button>}</div></div>; })}</div>{request.status === "awaiting_balance" && <div role="status" className="mt-4 rounded-xl bg-[#fff8e9] px-3 py-2.5 text-[11px] leading-4 text-[#957743]">El técnico debe recargar saldo para activar el servicio. La dirección exacta permanece protegida.</div>}<div className="mt-5 rounded-xl bg-[#fff8e9] px-3 py-2.5 text-[11px] leading-4 text-[#957743]"><strong>Recuerda:</strong> al seleccionar una propuesta, el precio queda pactado y la dirección se comparte únicamente con el técnico asignado.</div></ModalShell>;
}

function ServiceModal({ service, request, onClose, onCancel, role, onAdvance, onConfirm, onPay }: {
  service: Service;
  request?: ServiceRequest;
  onClose: () => void;
  onCancel: () => void;
  role: UserRole;
  onAdvance: () => void;
  onConfirm: () => void;
  onPay: () => void;
}) {
  const confirmations = service.completionConfirmations ?? [];
  const hasConfirmed = confirmations.includes(role);
  const otherRole = role === "client" ? "el técnico" : "el cliente";
  const nextAction = service.status === "assigned" ? "Voy en camino" : service.status === "en_route" ? "Iniciar servicio" : null;

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-start justify-between">
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6679b1]">Detalle del servicio</p><h2 className="mt-1 max-w-[370px] text-xl font-semibold tracking-[-0.04em] text-[#19242d]">{request?.title ?? "Servicio asignado"}</h2></div>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 text-[#84928d] transition hover:bg-[#f1f3f8] hover:text-[#19242d]"><X size={18} /></button>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#f1f3f8] p-3"><p className="text-[10px] uppercase tracking-[0.1em] text-[#8b9b92]">Precio pactado</p><p className="mt-1 text-lg font-semibold text-[#19242d]">{formatCOP(service.agreedPrice)}</p></div>
        <div className="rounded-xl bg-[#f1f3f8] p-3"><p className="text-[10px] uppercase tracking-[0.1em] text-[#8b9b92]">Estado</p><p className="mt-1 text-sm font-semibold text-[#4d69d8]">{statusLabel(service.status)}</p></div>
      </div>
      <div className="mt-4 space-y-2 rounded-2xl border border-[#e5ebe6] bg-white p-4 text-xs">
        <div className="flex justify-between"><span className="text-[#84928d]">Forma de pago</span><strong className="text-[#52655e]">{paymentLabel(service.paymentMethod)}</strong></div>
        <div className="flex justify-between"><span className="text-[#84928d]">Comisión administración</span><strong className="text-[#52655e]">{formatCOP(service.commission)}</strong></div>
        <div className="flex justify-between gap-3"><span className="text-[#84928d]">Dirección</span><strong className="max-w-[65%] text-right text-[#4d69d8]">{service.addressRevealed ? request?.exactAddress ?? "No se registró dirección exacta" : "Protegida hasta la asignación"}</strong></div>
      </div>
      <div className="mt-4 flex gap-2 rounded-xl bg-[#eff4fb] px-3 py-2.5 text-[11px] leading-4 text-[#5d7899]"><MapPin size={15} className="mt-0.5 shrink-0" />La dirección solo está visible porque este servicio ya fue asignado al técnico.</div>

      {role === "technician" && nextAction && <button type="button" onClick={onAdvance} className="mt-5 w-full rounded-xl bg-[#19242d] px-4 py-3 text-[12px] font-semibold text-white transition hover:bg-[#2a3a49]">{nextAction}</button>}
      {["in_progress", "completion_pending"].includes(service.status) && !hasConfirmed && <button type="button" onClick={onConfirm} className="mt-5 w-full rounded-xl bg-[#4d69d8] px-4 py-3 text-[12px] font-semibold text-white transition hover:bg-[#6d82e8]">Confirmar que el trabajo terminó</button>}
      {service.status === "completion_pending" && hasConfirmed && <p role="status" className="mt-5 rounded-xl bg-[#f1f3f8] px-3 py-3 text-center text-[11px] text-[#64756e]">Tu confirmación quedó registrada. Falta que {otherRole} confirme.</p>}
      {service.status === "payment_pending" && role === "client" && <div className="mt-5 rounded-xl bg-[#f1f3f8] p-4"><p className="text-xs font-semibold text-[#19242d]">Ambas partes confirmaron el trabajo</p><p className="mt-1 text-[11px] text-[#7b8985]">En producción, aquí se conectará el pago digital. Este botón solo simula el cierre en la demo.</p><button type="button" onClick={onPay} className="mt-3 w-full rounded-xl bg-[#4d69d8] px-4 py-3 text-[12px] font-semibold text-white">Simular pago por la app</button></div>}
      {service.status !== "completed" && service.status !== "cancelled" && <button type="button" onClick={onCancel} className="mt-4 w-full rounded-xl border border-[#f0cfc2] px-4 py-3 text-[12px] font-semibold text-[#bd7255] transition hover:bg-[#fff4ef]">Cancelar sin multas</button>}
    </ModalShell>
  );
}
function ModalShell({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#111820]/45 p-4 backdrop-blur-sm" onMouseDown={onClose}><div className="max-h-[92vh] w-full max-w-[500px] overflow-y-auto rounded-3xl border border-white/60 bg-[#fbfcfe] p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>{children}</div></div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-xs font-semibold text-[#5d6f69]">{label}<span className="mt-2 block">{children}</span></label>;
}

function EmptyPanel({ title, text, icon: Icon }: { title: string; text: string; icon: LucideIcon }) {
  return <div className="rounded-2xl border border-dashed border-[#cddbd0] bg-white px-6 py-14 text-center"><Icon aria-hidden="true" className="mx-auto text-[#4d69d8]" size={24} /><h2 className="mt-4 text-lg font-semibold text-[#19242d]">{title}</h2><p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#82908b]">{text}</p></div>;
}

export default function MarketplaceApp({ mode }: { mode: Mode }) {
  const [activeNav, setActiveNav] = useState(mode === "technician" ? "Radar" : "Inicio");
  const [state, setState] = useState<MarketplaceState>(initialMarketplaceState);
  const loadedFromStorage = useRef(false);
  const availabilityLoaded = useRef(false);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState("Todas");
  const [sortBy, setSortBy] = useState<"distance" | "budget" | "recent">("distance");
  const [isAvailable, setIsAvailable] = useState(true);
  const [radarOrigin, setRadarOrigin] = useState<GeoPoint>(() => locationForSector("El Poblado"));
  const [manualSector, setManualSector] = useState("El Poblado");
  const [locationLabel, setLocationLabel] = useState("El Poblado · ubicación aproximada");
  const [locationError, setLocationError] = useState("");
  const [offerRequest, setOfferRequest] = useState<ServiceRequest | null>(null);
  const [detailRequest, setDetailRequest] = useState<ServiceRequest | null>(null);
  const [createRequestOpen, setCreateRequestOpen] = useState(false);
  const [detailService, setDetailService] = useState<Service | null>(null);

  useEffect(() => {
    const loadStoredState = window.setTimeout(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try { setState(JSON.parse(saved) as MarketplaceState); } catch { window.localStorage.removeItem(STORAGE_KEY); }
      }
      loadedFromStorage.current = true;
    }, 0);
    return () => window.clearTimeout(loadStoredState);
  }, []);
  useEffect(() => { if (loadedFromStorage.current) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);
  useEffect(() => {
    const loadAvailability = window.setTimeout(() => {
      const savedAvailability = window.localStorage.getItem(TECHNICIAN_AVAILABILITY_KEY);
      if (savedAvailability !== null) setIsAvailable(savedAvailability === "true");
      availabilityLoaded.current = true;
    }, 0);
    return () => window.clearTimeout(loadAvailability);
  }, []);
  useEffect(() => {
    if (availabilityLoaded.current) window.localStorage.setItem(TECHNICIAN_AVAILABILITY_KEY, String(isAvailable));
  }, [isAvailable]);
  useEffect(() => {
    const syncMarketplaceState = (event: StorageEvent) => {
      if (event.key === TECHNICIAN_AVAILABILITY_KEY) {
        if (event.newValue !== null) setIsAvailable(event.newValue === "true");
        return;
      }
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      if (!event.newValue) {
        setState(initialMarketplaceState);
        return;
      }
      try {
        setState(JSON.parse(event.newValue) as MarketplaceState);
      } catch {
        // Ignore malformed updates from another tab; the last valid state remains visible.
      }
    };
    window.addEventListener("storage", syncMarketplaceState);
    return () => window.removeEventListener("storage", syncMarketplaceState);
  }, []);

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3200); };
  const offerCount = (requestId: string) => state.offers.filter((offer) => offer.requestId === requestId).length;
  const visibleRequests = useMemo(() => {
    const available = state.requests
      .filter((request) => request.status === "published")
      .filter((request) => filter === "Todas" || request.category === filter)
      .map((request, index) => {
        const distance = distanceBetween(radarOrigin, locationForSector(request.sector));
        return { ...request, distanceKm: distance, distance: distance < 0.2 ? "≈ 0.5 km" : `${distance.toFixed(1)} km`, order: index };
      })
      .filter((request) => request.distanceKm <= 5);

    return available.sort((first, second) => {
      if (sortBy === "budget") return second.budget - first.budget;
      if (sortBy === "recent") return first.order - second.order;
      return first.distanceKm - second.distanceKm;
    });
  }, [state.requests, filter, radarOrigin, sortBy]);
  const clientRequests = state.requests.filter((request) => request.clientId === currentClient.id || request.clientId === "client-demo");
  const clientServices = state.services.filter((service) => service.clientId === currentClient.id || state.requests.some((request) => request.id === service.requestId && request.clientId === "client-demo"));

  const sendOffer = (request: ServiceRequest, price: number, message: string) => { setState((current) => ({ ...current, offers: [...current.offers, createOffer(request.id, price, message)] })); setOfferRequest(null); notify(price === request.budget ? "Te postulaste por el presupuesto del cliente" : "Tu contraoferta fue enviada al cliente"); };
  const openOffer = (request: ServiceRequest) => { if (!isAvailable) { notify("Activa tu disponibilidad para enviar una propuesta"); return; } setOfferRequest(request); };
  const publishRequest = (input: Omit<ServiceRequest, "id" | "clientId" | "status" | "createdAt">) => { setState((current) => ({ ...current, requests: [createRequest(input), ...current.requests] })); setCreateRequestOpen(false); notify("Solicitud publicada. Ya puede recibir propuestas."); };
  const chooseOffer = (requestId: string, offerId: string) => { const request = state.requests.find((item) => item.id === requestId); const offer = state.offers.find((item) => item.id === offerId); setState((current) => selectOffer(current, requestId, offerId)); setDetailRequest(null); if (request && offer) notify(request.paymentMethod === "cash" && state.walletBalance < commissionFor(offer.price) ? "La selección espera una recarga de saldo" : "Técnico seleccionado. Servicio asignado."); };
  const cancelSelectedService = (serviceId: string) => { setState((current) => cancelService(current, serviceId)); setDetailService(null); notify("Servicio cancelado y comisión revertida"); };
  const recharge = () => {
    setState((current) => {
      let next = rechargeWallet(current, 100000);
      const waitingRequests = next.requests.filter((request) => request.status === "awaiting_balance" && request.selectedOfferId);
      for (const request of waitingRequests) next = selectOffer(next, request.id, request.selectedOfferId as string);
      return next;
    });
    notify("Recarga de prueba +$100.000. Revisando servicios pendientes.");
  };
  const updateServiceProgress = (serviceId: string) => setState((current) => advanceService(current, serviceId));
  const confirmCompletion = (serviceId: string) => {
    const service = state.services.find((item) => item.id === serviceId);
    if (!service) return;
    const confirmedByOther = (service.completionConfirmations ?? []).some((confirmation) => confirmation !== mode);
    setState((current) => confirmServiceCompletion(current, serviceId, mode));
    notify(confirmedByOther ? service.paymentMethod === "digital" ? "Trabajo confirmado. Falta completar el pago digital." : "Servicio confirmado y finalizado." : "Confirmación guardada. Falta que la otra parte confirme.");
  };
  const payDigitalService = (serviceId: string) => { setState((current) => completeDigitalPayment(current, serviceId)); notify("Pago de prueba completado. Servicio finalizado."); };
  const updateLocation = () => {
    if (!navigator.geolocation) { setLocationError("Este navegador no permite obtener la ubicación. Elige un sector aproximado."); return; }
    if (!window.isSecureContext) { setLocationError("Para usar el GPS, abre la app por HTTPS y permite el acceso a la ubicación en el navegador."); return; }
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setRadarOrigin({ latitude: coords.latitude, longitude: coords.longitude });
        setLocationLabel(`GPS del dispositivo · precisión ±${Math.round(coords.accuracy)} m`);
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? "Permiso de ubicación denegado. Actívalo en los ajustes del navegador y vuelve a intentarlo."
          : error.code === error.POSITION_UNAVAILABLE
            ? "El dispositivo no pudo determinar tu posición. Activa el GPS o prueba cerca de una ventana."
            : "La lectura del GPS tardó demasiado. Comprueba el permiso y vuelve a intentarlo.";
        setLocationError(message);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 25_000 },
    );
  };
  const updateManualSector = (sector: string) => { setManualSector(sector); setRadarOrigin(locationForSector(sector)); setLocationLabel(`${sector} · ubicación aproximada`); setLocationError(""); };

  const navItems = mode === "technician" ? technicianNav : clientNav;
  const currentNav = navItems.some((item) => item.label === activeNav) ? activeNav : mode === "technician" ? "Radar" : "Inicio";

  return <main className="min-h-screen bg-[#f7f8fa] text-[#19242d]"><div className="flex min-h-screen"><Sidebar mode={mode} activeNav={currentNav} onNavChange={setActiveNav} /><section className="min-w-0 flex-1"><header className="flex h-[76px] items-center justify-between border-b border-[#e7ece9] bg-[#fbfcfe]/90 px-5 backdrop-blur md:px-8 xl:px-11"><div className="flex items-center gap-3 lg:hidden"><BrandMark compact /><span className="text-[10px] font-semibold text-[#64756e]">{mode === "technician" ? "Espacio técnico" : "Espacio cliente"}</span></div><div className="relative hidden w-full max-w-[340px] md:block"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ba7a2]" /><input aria-label="Buscar" placeholder="Buscar servicios, técnicos..." className="h-10 w-full rounded-xl border border-[#e5ebe7] bg-white pl-10 pr-4 text-xs text-[#19242d] outline-none transition placeholder:text-[#a8b3af] focus:border-[#8fa4ee] focus:ring-4 focus:ring-[#4d69d8]/10" /></div><div className="ml-auto flex items-center gap-3 md:gap-5"><div className="text-right"><p className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-[#87938d]">{mode === "technician" ? "Espacio del técnico" : "Espacio del cliente"}</p><Link href={mode === "technician" ? "/cliente" : "/tecnico"} aria-label={mode === "technician" ? "Cambiar al espacio del cliente" : "Cambiar al espacio del técnico"} className="text-[11px] font-semibold text-[#4d69d8] transition hover:text-[#344db5]"><span className="hidden md:inline">Cambiar a </span>{mode === "technician" ? "cliente" : "técnico"} <span aria-hidden="true">→</span></Link></div><button type="button" aria-label="Notificaciones" className="relative rounded-xl p-2 text-[#81908a] transition hover:bg-[#f1f3f8] hover:text-[#19242d]"><Bell size={18} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#e58b62] ring-2 ring-[#fbfcfe]" /></button><div className="hidden h-8 w-px bg-[#e5ebe7] sm:block" /><button type="button" className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dce4ff] text-xs font-bold text-[#4f65a5]">CR</div><div className="hidden text-left sm:block"><p className="text-[11px] font-semibold text-[#314f49]">Camilo Restrepo</p><p className="text-[10px] text-[#9aa7a2]">{mode === "technician" ? "Técnico verificado" : "Cliente"}</p></div><ChevronDown size={14} className="hidden text-[#98a49f] sm:block" /></button></div></header><div className="mx-auto max-w-[1450px] px-5 py-8 md:px-8 xl:px-11">{mode === "client" ? <ClientDashboard activeNav={currentNav} requests={clientRequests} services={clientServices} state={state} onPublish={() => setCreateRequestOpen(true)} onOpenRequest={setDetailRequest} onOpenService={setDetailService} /> : <TechnicianDashboard activeNav={currentNav} requests={visibleRequests} state={state} offerCount={offerCount} offeredIds={state.offers.filter((offer) => offer.technicianId === currentTechnician.id).map((offer) => offer.requestId)} onFilter={setFilter} filter={filter} sortBy={sortBy} onSortBy={setSortBy} onOffer={openOffer} isAvailable={isAvailable} onToggleAvailability={() => setIsAvailable((available) => !available)} locationLabel={locationLabel} locationError={locationError} onLocate={updateLocation} onSectorChange={updateManualSector} manualSector={manualSector} center={radarOrigin} onOpenRequest={setDetailRequest} onOpenService={setDetailService} onRecharge={recharge} />}</div></section></div>{toast && <div role="status" className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#19242d] px-4 py-3 text-xs font-semibold text-white shadow-xl"><Check size={15} className="text-[#4d69d8]" />{toast}</div>}{offerRequest && mode === "technician" && <OfferModal request={offerRequest} alreadyOffered={state.offers.some((offer) => offer.requestId === offerRequest.id && offer.technicianId === currentTechnician.id)} onClose={() => setOfferRequest(null)} onSent={(price, message) => sendOffer(offerRequest, price, message)} />}{createRequestOpen && mode === "client" && <CreateRequestModal onClose={() => setCreateRequestOpen(false)} onCreate={publishRequest} />}{detailRequest && mode === "client" && <OffersModal request={detailRequest} offers={state.offers.filter((offer) => offer.requestId === detailRequest.id)} selectedService={state.services.find((service) => service.requestId === detailRequest.id)} onClose={() => setDetailRequest(null)} onSelect={(offerId) => chooseOffer(detailRequest.id, offerId)} />}{detailRequest && mode === "technician" && <RequestDetailModal request={detailRequest} onClose={() => setDetailRequest(null)} onOffer={() => { setDetailRequest(null); openOffer(detailRequest); }} />}{detailService && <ServiceModal service={state.services.find((service) => service.id === detailService.id) ?? detailService} request={state.requests.find((request) => request.id === detailService.requestId)} onClose={() => setDetailService(null)} onCancel={() => cancelSelectedService(detailService.id)} role={mode} onAdvance={() => updateServiceProgress(detailService.id)} onConfirm={() => confirmCompletion(detailService.id)} onPay={() => payDigitalService(detailService.id)} />}</main>;
}

function TechnicianDashboard({ activeNav, requests, state, offerCount, offeredIds, onFilter, filter, sortBy, onSortBy, onOffer, onOpenRequest, onOpenService, onRecharge, isAvailable, onToggleAvailability, locationLabel, locationError, onLocate, center }: {
  activeNav: string;
  requests: ServiceRequest[];
  state: MarketplaceState;
  offerCount: (requestId: string) => number;
  offeredIds: string[];
  onFilter: (value: string) => void;
  filter: string;
  sortBy: "distance" | "budget" | "recent";
  onSortBy: (value: "distance" | "budget" | "recent") => void;
  onOffer: (request: ServiceRequest) => void;
  onOpenRequest: (request: ServiceRequest) => void;
  onOpenService: (service: Service) => void;
  onRecharge: () => void;
  isAvailable: boolean;
  onToggleAvailability: () => void;
  locationLabel: string;
  locationError: string;
  onLocate: () => void;
  onSectorChange: (sector: string) => void;
  manualSector: string;
  center: GeoPoint;
}) {
  if (activeNav === "Mi saldo") return <div><PageHeading eyebrow="Tu economía" title="Mi saldo prepago" description="La comisión en efectivo se descuenta al asignar el servicio. Si se cancela, se devuelve completa." /><div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]"><LedgerBalanceCard balance={state.walletBalance} onRecharge={onRecharge} /><TransactionList transactions={state.walletTransactions} /></div></div>;
  if (activeNav === "Mis servicios") return <ServicesPanel services={state.services.filter((service) => service.technicianId === currentTechnician.id)} requests={state.requests} onOpen={onOpenService} role="technician" />;
  if (activeNav === "Mensajes") return <EmptyPanel title="Tus mensajes aparecerán aquí" text="Cuando un cliente responda una propuesta o necesite coordinar un detalle, la conversación estará disponible en este espacio." icon={MessageCircle} />;

  return (
    <>
      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <PageHeading eyebrow="Oportunidades en Medellín" title="Tu radar de servicios" description="Revisa solicitudes cercanas, compara el trabajo y envía una propuesta transparente." />
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-2 text-xs font-semibold ${isAvailable ? "text-[#4d8a59]" : "text-[#84918c]"}`}>
            <span className={`h-2 w-2 rounded-full ${isAvailable ? "animate-pulse bg-[#6bbd6c]" : "bg-[#aab3af]"}`} />
            {isAvailable ? "Disponible" : "Radar pausado"}
          </span>
          <button type="button" aria-pressed={isAvailable} onClick={onToggleAvailability} className="rounded-xl border border-[#dce3e9] bg-white px-3 py-2.5 text-[11px] font-semibold text-[#53677a] transition hover:border-[#aab8ea]">
            {isAvailable ? "Pausar radar" : "Activar disponibilidad"}
          </button>
        </div>
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <StatCard icon={BriefcaseBusiness} label="Oportunidades visibles" value={String(requests.length)} note="Solicitudes publicadas a 5 km" accent="text-[#4d69d8]" />
        <StatCard icon={Wallet} label="Saldo prepago" value={formatCOP(state.walletBalance)} note="Se usa solo en servicios en efectivo" accent="text-[#5682b3]" />
        <StatCard icon={Star} label="Tu calificación" value="4.9" note="Basada en 21 reseñas" accent="text-[#c58b28]" />
      </div>

      <section className="mb-4 rounded-2xl border border-[#e1e6ed] bg-white p-4 shadow-[0_8px_30px_rgba(39,65,60,0.035)]" aria-label="Ubicación del radar">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#8793a0]">Ubicación de búsqueda</p>
            <p className="mt-1 flex items-center gap-2 text-xs font-semibold text-[#19242d]"><MapPin size={14} className="text-[#4d69d8]" />{locationLabel}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={onLocate} className="rounded-xl border border-[#d8e0e8] px-3 py-2.5 text-[11px] font-semibold text-[#53677a] transition hover:border-[#9eafe8] hover:bg-[#f5f7ff]">Usar mi ubicación</button>
          </div>
        </div>
        {locationError && <p role="status" className="mt-2 text-[11px] text-[#bd7255]">{locationError}</p>}
        <p className="mt-2 text-[10px] leading-4 text-[#98a49f]">El navegador pedirá permiso al usar el GPS. Si no lo autorizas, el radar se mantendrá en la última ubicación aproximada disponible.</p>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="min-w-0">
          <ReactBitsReveal><MapboxRadar requests={requests} onOpenRequest={onOpenRequest} center={center} radiusKm={5} /></ReactBitsReveal>
          <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-[17px] font-semibold tracking-[-0.03em] text-[#19242d]">Solicitudes cercanas</h2>
              <p className="mt-1 text-xs text-[#8a9892]">El cliente solo muestra su sector general hasta asignar el servicio.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-[#e5ebe7] bg-white p-1">
                {["Todas", "Plomería", "Electricidad", "Pintura"].map((category) => <button key={category} type="button" onClick={() => onFilter(category)} aria-pressed={filter === category} className={`whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-semibold transition ${filter === category ? "bg-[#19242d] text-white" : "text-[#84918c] hover:text-[#19242d]"}`}>{category}</button>)}
              </div>
              <label className="sr-only" htmlFor="radar-sort">Ordenar solicitudes</label>
              <select id="radar-sort" value={sortBy} onChange={(event) => onSortBy(event.target.value as "distance" | "budget" | "recent")} className="rounded-xl border border-[#e5ebe7] bg-white px-3 py-2.5 text-[10px] font-semibold text-[#65746f] outline-none focus:border-[#8fa4ee]">
                <option value="distance">Más cercanas</option>
                <option value="recent">Más recientes</option>
                <option value="budget">Mayor presupuesto</option>
              </select>
            </div>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">{requests.map((request) => <LedgerRequestCard key={request.id} request={request} offerCount={offerCount(request.id)} offered={offeredIds.includes(request.id)} onOpen={onOpenRequest} onOffer={onOffer} isAvailable={isAvailable} />)}</div>
          {requests.length === 0 && <div className="mt-4"><EmptyPanel title="No hay solicitudes en este radio" text="Prueba otra categoría o cambia tu sector de búsqueda. Las solicitudes fuera de 5 km no aparecen en el radar." icon={Search} />{!isAvailable && <p className="mt-3 text-center text-xs text-[#87938d]">El radar está pausado. Activa disponibilidad para enviar propuestas.</p>}</div>}
        </div>

        <aside className="space-y-5">
          <LedgerBalanceCard balance={state.walletBalance} onRecharge={onRecharge} />
          <div className="rounded-2xl border border-[#e7ece9] bg-white p-5 shadow-[0_8px_30px_rgba(39,65,60,0.035)]">
            <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-[#19242d]">Servicios en curso</h3><span className="text-[11px] font-semibold text-[#4d69d8]">{state.services.filter((service) => service.technicianId === currentTechnician.id && !["completed", "cancelled"].includes(service.status)).length}</span></div>
            <div className="mt-4 space-y-3">{state.services.filter((service) => service.technicianId === currentTechnician.id && !["completed", "cancelled"].includes(service.status)).slice(0, 3).map((service) => {
              const request = state.requests.find((item) => item.id === service.requestId);
              return <button key={service.id} type="button" onClick={() => onOpenService(service)} className="flex w-full items-start justify-between gap-3 border-t border-[#edf0f4] pt-3 text-left">
                <span><span className="block text-xs font-semibold text-[#19242d]">{request?.title ?? "Servicio asignado"}</span><span className="mt-1 block text-[10px] text-[#84918c]">{request?.sector} · {statusLabel(service.status)}</span></span><ArrowUpRight size={15} className="mt-0.5 text-[#4d69d8]" />
              </button>;
            })}</div>
            {state.services.every((service) => service.technicianId !== currentTechnician.id || ["completed", "cancelled"].includes(service.status)) && <p className="mt-3 text-[11px] leading-5 text-[#8b9893]">Cuando un cliente acepte una propuesta, podrás seguir el servicio desde aquí.</p>}
          </div>
          <div className="rounded-2xl border border-[#e7ece9] bg-[#f8faff] p-5">
            <div className="flex items-center gap-2 text-[#4d69d8]"><Clock3 size={16} /><h3 className="text-sm font-semibold text-[#19242d]">Propuestas pendientes</h3></div>
            <p className="mt-2 text-[11px] leading-5 text-[#7e8f88]">{state.offers.filter((offer) => offer.technicianId === currentTechnician.id && offer.status === "pending").length} propuestas esperando respuesta del cliente. Recibirás una notificación al cambiar el estado.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
function ClientDashboard({ activeNav, requests, services, state, onPublish, onOpenRequest, onOpenService }: { activeNav: string; requests: ServiceRequest[]; services: Service[]; state: MarketplaceState; onPublish: () => void; onOpenRequest: (request: ServiceRequest) => void; onOpenService: (service: Service) => void }) {
  if (activeNav === "Mensajes") return <EmptyPanel title="Tus mensajes aparecerán aquí" text="Podrás conversar con el técnico seleccionado para coordinar detalles del servicio." icon={MessageCircle} />;
  if (activeNav === "Pagos") return <div><PageHeading eyebrow="Transparencia" title="Pagos y movimientos" description="Consulta el historial de tus servicios y pagos digitales." /><TransactionList transactions={state.walletTransactions} /></div>;
  if (activeNav === "Mis solicitudes") return <div><PageHeading eyebrow="Tu actividad" title="Mis solicitudes" description="Sigue las propuestas y el estado de cada necesidad publicada." /><ClientRequestList requests={requests} state={state} onOpen={onOpenRequest} /></div>;
  return <><div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><PageHeading eyebrow="Tu espacio" title="Hola, Camilo 👋" description="Publica una tarea y recibe propuestas de técnicos verificados." /><button type="button" onClick={onPublish} className="flex items-center justify-center gap-2 rounded-xl bg-[#19242d] px-4 py-3 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(23,58,55,0.14)] transition hover:bg-[#2a3a49]"><Plus size={16} />Publicar solicitud</button></div><div className="grid gap-4 md:grid-cols-3"><StatCard icon={FileText} label="Solicitudes activas" value={String(requests.filter((request) => request.status !== "cancelled").length)} note="Revisa las propuestas recibidas" accent="text-[#4d69d8]" /><StatCard icon={Check} label="Servicios completados" value={String(services.filter((service) => service.status === "completed").length)} note="Tu historial en la comunidad" accent="text-[#5682b3]" /><StatCard icon={Star} label="Calificación promedio" value="4.9" note="Tu reputación como cliente" accent="text-[#c58b28]" /></div><div className="mt-7 flex items-center justify-between"><div><h2 className="text-[17px] font-semibold tracking-[-0.03em] text-[#19242d]">Mis solicitudes</h2><p className="mt-1 text-xs text-[#8a9892]">Revisa el estado de tus trabajos publicados.</p></div><button type="button" onClick={() => onOpenRequest(requests[0])} className="text-xs font-semibold text-[#4d69d8]">Ver detalles →</button></div><ClientRequestList requests={requests} state={state} onOpen={onOpenRequest} onOpenService={onOpenService} /></>;
}

function ClientRequestList({ requests, state, onOpen, onOpenService }: { requests: ServiceRequest[]; state: MarketplaceState; onOpen: (request: ServiceRequest) => void; onOpenService?: (service: Service) => void }) {
  return <div className="mt-4 space-y-3">{requests.map((request) => { const service = state.services.find((item) => item.requestId === request.id); return <div key={request.id} className="flex flex-col gap-4 rounded-2xl border border-[#e7ece9] bg-white p-4 shadow-[0_8px_30px_rgba(39,65,60,0.035)] sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><ServiceCategoryIcon category={request.category} className="text-[#4d69d8]" /><div><h3 className="text-sm font-semibold text-[#19242d]">{request.title}</h3><p className="mt-1 text-[11px] text-[#8b9893]">{request.category} · {state.offers.filter((offer) => offer.requestId === request.id).length} propuestas · {paymentLabel(request.paymentMethod)}</p></div></div><div className="flex items-center gap-3"><span className={`rounded-full px-2.5 py-1.5 text-[10px] font-semibold ${request.status === "assigned" ? "bg-blue-50 text-blue-700" : request.status === "cancelled" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{service ? statusLabel(service.status) : request.status === "awaiting_balance" ? "Esperando saldo" : "Recibiendo ofertas"}</span>{service && onOpenService ? <button type="button" onClick={() => onOpenService(service)} className="text-xs font-semibold text-[#4d69d8]">Ver servicio</button> : <button type="button" onClick={() => onOpen(request)} className="text-xs font-semibold text-[#4d69d8]">Ver ofertas</button>}</div></div>; })}</div>;
}

function ServicesPanel({ services, requests, onOpen, role }: { services: Service[]; requests: ServiceRequest[]; onOpen: (service: Service) => void; role: UserRole }) {
  return <div><PageHeading eyebrow="Seguimiento" title={role === "technician" ? "Mis servicios" : "Servicios contratados"} description="Consulta los servicios asignados y gestiona su estado." />{services.length === 0 ? <EmptyPanel title="Aún no tienes servicios asignados" text="Cuando un cliente seleccione una de tus propuestas, el servicio aparecerá aquí." icon={BriefcaseBusiness} /> : <div className="mt-6 space-y-3">{services.map((service) => <button type="button" key={service.id} onClick={() => onOpen(service)} className="flex w-full items-center justify-between rounded-2xl border border-[#e7ece9] bg-white p-5 text-left shadow-[0_8px_30px_rgba(39,65,60,0.035)] transition hover:border-[#c5d0f2]"><div><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#687996]">{requests.find((request) => request.id === service.requestId)?.category}</p><h3 className="mt-1 text-sm font-semibold text-[#19242d]">{requests.find((request) => request.id === service.requestId)?.title}</h3><p className="mt-2 text-[11px] text-[#8b9893]">{paymentLabel(service.paymentMethod)} · {formatCOP(service.agreedPrice)}</p></div><div className="flex items-center gap-3"><span className="rounded-full bg-[#eef1ff] px-2.5 py-1.5 text-[10px] font-semibold text-[#4d69d8]">{statusLabel(service.status)}</span><ArrowUpRight size={16} className="text-[#81918a]" /></div></button>)}</div>}</div>;
}

function TransactionList({ transactions, compact = false }: { transactions: MarketplaceState["walletTransactions"]; compact?: boolean }) {
  return <div className={`rounded-2xl border border-[#e7ece9] bg-white p-5 shadow-[0_8px_30px_rgba(39,65,60,0.035)] ${compact ? "border-0 p-0 shadow-none" : "mt-6"}`}><div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-[#19242d]">{compact ? "Actividad reciente" : "Movimientos"}</h3>{!compact && <span className="text-[11px] text-[#8b9893]">Saldo prepago</span>}</div><div className="mt-5 space-y-4">{transactions.map((transaction) => <div key={transaction.id} className="flex gap-3">{transaction.amount >= 0 ? <ArrowDownLeft aria-hidden="true" className="text-[#4d69d8]" size={16} /> : <ArrowUpRight aria-hidden="true" className="text-[#c58b28]" size={16} />}<div className="min-w-0 flex-1"><p className="text-[11px] font-semibold text-[#52655e]">{transaction.description}</p><div className="mt-0.5 flex justify-between gap-2"><p className="text-[10px] text-[#9aa5a1]">{transaction.createdAt}</p><span className={`text-[11px] font-semibold ${transaction.amount >= 0 ? "text-[#4d69d8]" : "text-[#c58b28]"}`}>{transaction.amount >= 0 ? "+" : ""}{formatCOP(transaction.amount)}</span></div></div></div>)}</div></div>;
}

function RequestDetailModal({ request, onClose, onOffer }: { request: ServiceRequest; onClose: () => void; onOffer: () => void }) {
  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6679b1]">Detalle de solicitud</p><h2 className="mt-1 max-w-[370px] text-xl font-semibold tracking-[-0.04em] text-[#19242d]">{request.title}</h2></div><button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 text-[#84928d] transition hover:bg-[#f1f3f8] hover:text-[#19242d]"><X size={18} /></button></div>
      <div className="mt-5 space-y-4">
        <p className="text-sm leading-6 text-[#6f8178]">{request.description}</p>
        {request.supportPhotos && request.supportPhotos.length > 0 && <div className="grid grid-cols-3 gap-2">{request.supportPhotos.map((photo, index) => <NextImage key={photo.slice(-32)} src={photo} alt={`Foto de soporte ${index + 1}`} width={150} height={110} unoptimized className="h-24 w-full rounded-xl object-cover" />)}</div>}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#f1f3f8] p-3"><p className="text-[10px] uppercase tracking-[0.1em] text-[#8b9b92]">Sector aproximado</p><p className="mt-1 text-sm font-semibold text-[#19242d]">{request.sector} · {request.distance}</p></div>
          <div className="rounded-xl bg-[#f1f3f8] p-3"><p className="text-[10px] uppercase tracking-[0.1em] text-[#8b9b92]">Cuándo</p><p className="mt-1 text-sm font-semibold text-[#19242d]">{request.desiredDate}</p></div>
        </div>
        <div className="flex flex-wrap gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${paymentTone(request.paymentMethod)}`}>{paymentLabel(request.paymentMethod)}</span><span className="rounded-full bg-[#f3f5f3] px-2.5 py-1 text-[10px] font-semibold text-[#81908a]">Dirección exacta protegida</span></div>
        <div className="space-y-2 rounded-xl border border-[#e5ebe6] bg-white p-4 text-xs">
          <div className="flex justify-between"><span className="text-[#84928d]">Presupuesto del cliente</span><strong className="text-[#52655e]">{formatCOP(request.budget)}</strong></div>
          <div className="flex justify-between"><span className="text-[#84928d]">Comisión estimada · 10%</span><strong className="text-[#52655e]">{formatCOP(commissionFor(request.budget))}</strong></div>
          <div className="flex justify-between border-t border-[#edf1ed] pt-2"><span className="text-[#84928d]">Neto aproximado</span><strong className="text-[#4d69d8]">{formatCOP(technicianPayoutFor(request.budget))}</strong></div>
        </div>
        <p className="text-[10px] leading-4 text-[#8b9893]">Puedes postularte por el presupuesto o enviar una contraoferta. La comisión solo se cobra al quedar asignado.</p>
        <button type="button" onClick={onOffer} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#19242d] px-4 py-3 text-[12px] font-semibold text-white transition hover:bg-[#2a3a49]">Continuar con mi propuesta <ArrowUpRight size={15} /></button>
      </div>
    </ModalShell>
  );
}
function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6679b1]">{eyebrow}</p><h1 className="mt-2 text-[30px] font-semibold tracking-[-0.055em] text-[#19242d]">{title}</h1><p className="mt-2 text-sm text-[#7b8985]">{description}</p></div>;
}
