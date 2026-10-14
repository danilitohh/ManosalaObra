export type UserRole = "client" | "technician";
export type PaymentMethod = "cash" | "digital";
export type RequestStatus = "published" | "selected" | "awaiting_balance" | "assigned" | "en_route" | "in_progress" | "payment_pending" | "completed" | "cancelled";
export type OfferStatus = "pending" | "accepted" | "rejected";
export type ServiceStatus = "assigned" | "en_route" | "in_progress" | "completion_pending" | "completed" | "cancelled" | "payment_pending";
export type GeoPoint = { latitude: number; longitude: number };

export const SECTOR_COORDINATES: Record<string, GeoPoint> = {
  Belén: { latitude: 6.229, longitude: -75.603 },
  Envigado: { latitude: 6.169, longitude: -75.591 },
  Laureles: { latitude: 6.244, longitude: -75.591 },
  "El Poblado": { latitude: 6.208, longitude: -75.568 },
  Centro: { latitude: 6.251, longitude: -75.568 },
};

export type User = {
  id: string;
  name: string;
  initials: string;
  role: UserRole;
  rating: number;
  completedServices: number;
  verified: boolean;
  available?: boolean;
};

export type ServiceRequest = {
  id: string;
  clientId: string;
  category: string;
  title: string;
  description: string;
  sector: string;
  distance: string;
  exactAddress?: string;
  supportPhotos?: string[];
  selectedOfferId?: string;
  budget: number;
  paymentMethod: PaymentMethod;
  desiredDate: string;
  status: RequestStatus;
  createdAt: string;
};

export type Offer = {
  id: string;
  requestId: string;
  technicianId: string;
  price: number;
  message: string;
  status: OfferStatus;
  createdAt: string;
  technician?: User;
};

export type Service = {
  id: string;
  requestId: string;
  clientId: string;
  technicianId: string;
  agreedPrice: number;
  commission: number;
  paymentMethod: PaymentMethod;
  status: ServiceStatus;
  addressRevealed: boolean;
  completionConfirmations?: UserRole[];
  createdAt: string;
};

export type WalletTransaction = {
  id: string;
  type: "recharge" | "commission" | "commission_reversal";
  amount: number;
  description: string;
  createdAt: string;
};

export type MarketplaceState = {
  requests: ServiceRequest[];
  offers: Offer[];
  services: Service[];
  walletBalance: number;
  walletTransactions: WalletTransaction[];
};

export const currentClient: User = {
  id: "client-camilo",
  name: "Camilo Restrepo",
  initials: "CR",
  role: "client",
  rating: 4.9,
  completedServices: 8,
  verified: true,
};

export const currentTechnician: User = {
  id: "tech-camilo",
  name: "Camilo Restrepo",
  initials: "CR",
  role: "technician",
  rating: 4.9,
  completedServices: 24,
  verified: true,
};

export const demoTechnicians: User[] = [
  currentTechnician,
  { id: "tech-juliana", name: "Juliana Salazar", initials: "JS", role: "technician", rating: 4.8, completedServices: 31, verified: true },
  { id: "tech-mateo", name: "Mateo Pérez", initials: "MP", role: "technician", rating: 4.7, completedServices: 18, verified: true },
];

const initialRequests: ServiceRequest[] = [
  {
    id: "request-fuga-cocina",
    clientId: "client-demo",
    category: "Plomería",
    title: "Reparar fuga de agua en cocina",
    description: "La llave debajo del lavaplatos está goteando y necesito revisar también la conexión del sifón.",
    sector: "El Poblado",
    distance: "2.4 km",
    budget: 250000,
    paymentMethod: "cash",
    desiredDate: "Hoy, 2:00 p. m.",
    status: "published",
    createdAt: "Hoy, 9:20 a. m.",
  },
  {
    id: "request-luz-sala",
    clientId: "client-demo",
    category: "Electricidad",
    title: "Instalar lámparas en sala",
    description: "Instalación de tres lámparas de techo. Ya tengo los accesorios y necesito una revisión del cableado.",
    sector: "Laureles",
    distance: "3.1 km",
    budget: 180000,
    paymentMethod: "digital",
    desiredDate: "Mañana, 9:00 a. m.",
    status: "published",
    createdAt: "Hoy, 8:45 a. m.",
  },
  {
    id: "request-pintura-habitacion",
    clientId: "client-demo",
    category: "Pintura",
    title: "Pintar una habitación completa",
    description: "Habitación de aproximadamente 12 m². Pintura blanca incluida por el cliente.",
    sector: "Belén",
    distance: "4.6 km",
    budget: 320000,
    paymentMethod: "cash",
    desiredDate: "Sábado, 8:00 a. m.",
    status: "published",
    createdAt: "Ayer, 4:10 p. m.",
  },
];

const initialOffers: Offer[] = [
  { id: "offer-fuga-juliana", requestId: "request-fuga-cocina", technicianId: "tech-juliana", price: 250000, message: "Puedo revisar la fuga y dejar la conexión funcionando hoy.", status: "pending", createdAt: "Hace 18 min" },
  { id: "offer-fuga-mateo", requestId: "request-fuga-cocina", technicianId: "tech-mateo", price: 280000, message: "Incluye revisión completa del sifón y cambio de empaques si es necesario.", status: "pending", createdAt: "Hace 12 min" },
  { id: "offer-luz-juliana", requestId: "request-luz-sala", technicianId: "tech-juliana", price: 190000, message: "Tengo disponibilidad mañana en la mañana.", status: "pending", createdAt: "Hace 30 min" },
  { id: "offer-luz-camilo", requestId: "request-luz-sala", technicianId: "tech-camilo", price: 180000, message: "Puedo instalar las tres lámparas y revisar el cableado existente.", status: "pending", createdAt: "Hace 22 min" },
];

export const initialMarketplaceState: MarketplaceState = {
  requests: initialRequests,
  offers: initialOffers,
  services: [],
  walletBalance: 180000,
  walletTransactions: [
    { id: "transaction-recharge", type: "recharge", amount: 100000, description: "Recarga vía Nequi", createdAt: "Hoy, 9:42 a. m." },
    { id: "transaction-commission", type: "commission", amount: -25000, description: "Comisión · Plomería", createdAt: "Ayer" },
  ],
};

export const commissionFor = (price: number) => Math.round(price * 0.1);
export const technicianPayoutFor = (price: number) => price - commissionFor(price);

export function distanceBetween(origin: GeoPoint, destination: GeoPoint): number {
  const radians = (degrees: number) => degrees * (Math.PI / 180);
  const latitudeDelta = radians(destination.latitude - origin.latitude);
  const longitudeDelta = radians(destination.longitude - origin.longitude);
  const latitudeOrigin = radians(origin.latitude);
  const latitudeDestination = radians(destination.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(latitudeOrigin) * Math.cos(latitudeDestination) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function locationForSector(sector: string): GeoPoint {
  return SECTOR_COORDINATES[sector] ?? { latitude: 6.235, longitude: -75.575 };
}

export function createRequest(input: Omit<ServiceRequest, "id" | "clientId" | "status" | "createdAt" | "selectedOfferId">): ServiceRequest {
  return {
    ...input,
    id: `request-${Date.now()}`,
    clientId: currentClient.id,
    status: "published",
    createdAt: "Ahora",
  };
}

export function createOffer(requestId: string, price: number, message: string): Offer {
  return {
    id: `offer-${Date.now()}`,
    requestId,
    technicianId: currentTechnician.id,
    price,
    message,
    status: "pending",
    createdAt: "Ahora",
  };
}

export function selectOffer(state: MarketplaceState, requestId: string, offerId: string): MarketplaceState {
  const request = state.requests.find((item) => item.id === requestId);
  const offer = state.offers.find((item) => item.id === offerId && item.requestId === requestId);
  if (!request || !offer || !["published", "awaiting_balance"].includes(request.status)) return state;
  if (state.services.some((service) => service.requestId === requestId)) return state;

  const commission = commissionFor(offer.price);
  const canAssign = request.paymentMethod === "digital" || state.walletBalance >= commission;
  const nextStatus: RequestStatus = canAssign ? "assigned" : "awaiting_balance";

  if (!canAssign) {
    return {
      ...state,
      requests: state.requests.map((item) => item.id === requestId ? { ...item, status: nextStatus, selectedOfferId: offerId } : item),
      offers: state.offers.map((item) => item.id === offerId ? { ...item, status: "accepted" } : item),
    };
  }

  const service: Service = {
    id: `service-${Date.now()}`,
    requestId,
    clientId: request.clientId,
    technicianId: offer.technicianId,
    agreedPrice: offer.price,
    commission,
    paymentMethod: request.paymentMethod,
    status: "assigned",
    addressRevealed: true,
    createdAt: "Ahora",
  };

  const cashTransaction: WalletTransaction | null = request.paymentMethod === "cash" ? {
    id: `transaction-${Date.now()}`,
    type: "commission",
    amount: -commission,
    description: `Comisión · ${request.category}`,
    createdAt: "Ahora",
  } : null;

  return {
    ...state,
    requests: state.requests.map((item) => item.id === requestId ? { ...item, status: nextStatus, selectedOfferId: offerId } : item),
    offers: state.offers.map((item) => item.requestId === requestId ? { ...item, status: item.id === offerId ? "accepted" : "rejected" } : item),
    services: [...state.services, service],
    walletBalance: request.paymentMethod === "cash" ? state.walletBalance - commission : state.walletBalance,
    walletTransactions: cashTransaction ? [cashTransaction, ...state.walletTransactions] : state.walletTransactions,
  };
}

export function advanceService(state: MarketplaceState, serviceId: string): MarketplaceState {
  const service = state.services.find((item) => item.id === serviceId);
  if (!service) return state;
  const nextStatus = service.status === "assigned" ? "en_route" : service.status === "en_route" ? "in_progress" : null;
  if (!nextStatus) return state;
  const requestStatus: RequestStatus = nextStatus;
  return {
    ...state,
    services: state.services.map((item) => item.id === serviceId ? { ...item, status: nextStatus } : item),
    requests: state.requests.map((item) => item.id === service.requestId ? { ...item, status: requestStatus } : item),
  };
}

export function confirmServiceCompletion(state: MarketplaceState, serviceId: string, role: UserRole): MarketplaceState {
  const service = state.services.find((item) => item.id === serviceId);
  if (!service || !["in_progress", "completion_pending"].includes(service.status)) return state;
  const confirmations = Array.from(new Set([...(service.completionConfirmations ?? []), role]));
  const bothConfirmed = confirmations.includes("client") && confirmations.includes("technician");
  const status: ServiceStatus = bothConfirmed
    ? service.paymentMethod === "digital" ? "payment_pending" : "completed"
    : "completion_pending";
  const requestStatus: RequestStatus = status === "payment_pending" ? "payment_pending" : status === "completed" ? "completed" : "in_progress";
  return {
    ...state,
    services: state.services.map((item) => item.id === serviceId ? { ...item, status, completionConfirmations: confirmations } : item),
    requests: state.requests.map((item) => item.id === service.requestId ? { ...item, status: requestStatus } : item),
  };
}

export function completeDigitalPayment(state: MarketplaceState, serviceId: string): MarketplaceState {
  const service = state.services.find((item) => item.id === serviceId);
  if (!service || service.paymentMethod !== "digital" || service.status !== "payment_pending") return state;
  return {
    ...state,
    services: state.services.map((item) => item.id === serviceId ? { ...item, status: "completed" } : item),
    requests: state.requests.map((item) => item.id === service.requestId ? { ...item, status: "completed" } : item),
  };
}

export function cancelService(state: MarketplaceState, serviceId: string): MarketplaceState {
  const service = state.services.find((item) => item.id === serviceId);
  if (!service || service.status === "completed" || service.status === "cancelled") return state;

  const request = state.requests.find((item) => item.id === service.requestId);
  const reversal: WalletTransaction | null = service.paymentMethod === "cash" ? {
    id: `transaction-${Date.now()}`,
    type: "commission_reversal",
    amount: service.commission,
    description: `Reverso de comisión · ${request?.category ?? "Servicio"}`,
    createdAt: "Ahora",
  } : null;

  return {
    ...state,
    requests: state.requests.map((item) => item.id === service.requestId ? { ...item, status: "cancelled" } : item),
    services: state.services.map((item) => item.id === serviceId ? { ...item, status: "cancelled" } : item),
    walletBalance: reversal ? state.walletBalance + service.commission : state.walletBalance,
    walletTransactions: reversal ? [reversal, ...state.walletTransactions] : state.walletTransactions,
  };
}

export function rechargeWallet(state: MarketplaceState, amount: number): MarketplaceState {
  const transaction: WalletTransaction = {
    id: `transaction-${Date.now()}`,
    type: "recharge",
    amount,
    description: "Recarga de saldo demo",
    createdAt: "Ahora",
  };
  return { ...state, walletBalance: state.walletBalance + amount, walletTransactions: [transaction, ...state.walletTransactions] };
}
