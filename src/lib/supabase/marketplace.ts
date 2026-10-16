import type { SupabaseClient } from "@supabase/supabase-js";
import type { MarketplaceState, Offer, Service, ServiceRequest, User, WalletTransaction } from "@/lib/marketplace";

type DatabaseRow = Record<string, unknown>;
const REQUESTS_PER_PAGE = 20;
const RELATED_ROWS_LIMIT = 100;
const REQUEST_COLUMNS = "id, client_id, category, title, description, sector, budget_cop, payment_method, desired_date, status, selected_offer_id, created_at";

const timestampLabel = (value: unknown) => {
  if (typeof value !== "string") return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

function profileToUser(row: DatabaseRow): User {
  const name = String(row.display_name ?? "Usuario");
  return {
    id: String(row.id),
    name,
    initials: name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(),
    role: row.role === "technician" ? "technician" : row.role === "admin" ? "admin" : "client",
    rating: Number(row.rating ?? 0),
    completedServices: Number(row.completed_services ?? 0),
    verified: Boolean(row.verified),
    available: Boolean(row.is_available),
  };
}

async function signedPhotoUrls(client: SupabaseClient, paths: string[]) {
  if (paths.length === 0) return [];
  const { data, error } = await client.storage.from("request-photos").createSignedUrls(paths, 60 * 60);
  return error ? [] : (data ?? []).flatMap((item) => item.signedUrl ? [item.signedUrl] : []);
}

async function mapRequestRows(client: SupabaseClient, rows: DatabaseRow[]): Promise<ServiceRequest[]> {
  if (rows.length === 0) return [];
  const requestIds = rows.map((row) => String(row.id));
  const [detailResult, mediaResult] = await Promise.all([
    client.from("request_private_details").select("request_id, exact_address").in("request_id", requestIds),
    client.from("request_media").select("request_id, photo_paths").in("request_id", requestIds),
  ]);
  for (const result of [detailResult, mediaResult]) {
    if (result.error) throw result.error;
  }

  const privateById = new Map(((detailResult.data ?? []) as DatabaseRow[]).map((row) => [String(row.request_id), row]));
  const mediaById = new Map(((mediaResult.data ?? []) as DatabaseRow[]).map((row) => [String(row.request_id), row]));
  return Promise.all(rows.map(async (row): Promise<ServiceRequest> => {
    const id = String(row.id);
    const media = mediaById.get(id);
    const paths = Array.isArray(media?.photo_paths) ? media.photo_paths.map(String) : [];
    const privateDetails = privateById.get(id);
    return {
      id,
      clientId: String(row.client_id),
      category: String(row.category),
      title: String(row.title),
      description: String(row.description),
      sector: String(row.sector),
      distance: "",
      exactAddress: typeof privateDetails?.exact_address === "string" ? privateDetails.exact_address : undefined,
      supportPhotos: await signedPhotoUrls(client, paths),
      selectedOfferId: typeof row.selected_offer_id === "string" ? row.selected_offer_id : undefined,
      budget: Number(row.budget_cop),
      paymentMethod: row.payment_method === "digital" ? "digital" : "cash",
      desiredDate: String(row.desired_date),
      status: String(row.status) as ServiceRequest["status"],
      createdAt: timestampLabel(row.created_at),
    };
  }));
}

export async function loadMarketplaceRequestsPage(client: SupabaseClient, requestPage: number) {
  const safePage = Math.max(0, Math.floor(requestPage));
  const from = safePage * REQUESTS_PER_PAGE;
  const { data, error } = await client.from("service_requests")
    .select(REQUEST_COLUMNS)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + REQUESTS_PER_PAGE);
  if (error) throw error;
  const rows = (data ?? []) as DatabaseRow[];
  return {
    requests: await mapRequestRows(client, rows.slice(0, REQUESTS_PER_PAGE)),
    requestPage: safePage,
    hasMoreRequests: rows.length > REQUESTS_PER_PAGE,
  };
}

export async function loadMarketplaceRequestsByIds(client: SupabaseClient, requestIds: string[]) {
  const ids = [...new Set(requestIds)].slice(0, RELATED_ROWS_LIMIT);
  if (ids.length === 0) return [];
  const { data, error } = await client.from("service_requests").select(REQUEST_COLUMNS).in("id", ids).order("created_at", { ascending: false });
  if (error) throw error;
  return mapRequestRows(client, (data ?? []) as DatabaseRow[]);
}

export async function loadMarketplaceTechniciansByIds(client: SupabaseClient, technicianIds: string[]) {
  const ids = [...new Set(technicianIds)].slice(0, RELATED_ROWS_LIMIT);
  if (ids.length === 0) return [];
  const { data, error } = await client.from("profiles")
    .select("id, display_name, role, rating, completed_services, verified, is_available")
    .in("id", ids);
  if (error) throw error;
  return ((data ?? []) as DatabaseRow[]).map(profileToUser);
}

export async function loadMarketplaceOffersByIds(client: SupabaseClient, offerIds: string[]) {
  const ids = [...new Set(offerIds)].slice(0, RELATED_ROWS_LIMIT);
  if (ids.length === 0) return [];
  const { data, error } = await client.from("offers")
    .select("id, request_id, technician_id, price_cop, message, status, created_at")
    .in("id", ids)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as DatabaseRow[];
  const technicians = await loadMarketplaceTechniciansByIds(client, rows.map((row) => String(row.technician_id)));
  const technicianById = new Map(technicians.map((technician) => [technician.id, technician]));
  return rows.map((row): Offer => ({
    id: String(row.id),
    requestId: String(row.request_id),
    technicianId: String(row.technician_id),
    price: Number(row.price_cop),
    message: String(row.message ?? ""),
    status: String(row.status) as Offer["status"],
    createdAt: timestampLabel(row.created_at),
    technician: technicianById.get(String(row.technician_id)),
  }));
}

export async function loadMarketplaceServicesByIds(client: SupabaseClient, serviceIds: string[]) {
  const ids = [...new Set(serviceIds)].slice(0, RELATED_ROWS_LIMIT);
  if (ids.length === 0) return [];
  const { data, error } = await client.from("services")
    .select("id, request_id, client_id, technician_id, agreed_price_cop, commission_cop, payment_method, status, address_revealed, completion_confirmations, created_at")
    .in("id", ids)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as DatabaseRow[]).map((row): Service => ({
    id: String(row.id),
    requestId: String(row.request_id),
    clientId: String(row.client_id),
    technicianId: String(row.technician_id),
    agreedPrice: Number(row.agreed_price_cop),
    commission: Number(row.commission_cop),
    paymentMethod: row.payment_method === "digital" ? "digital" : "cash",
    status: String(row.status) as Service["status"],
    addressRevealed: Boolean(row.address_revealed),
    completionConfirmations: Array.isArray(row.completion_confirmations) ? row.completion_confirmations as Service["completionConfirmations"] : [],
    createdAt: timestampLabel(row.created_at),
  }));
}

export async function loadMarketplaceTransactionsByIds(client: SupabaseClient, transactionIds: string[]) {
  const ids = [...new Set(transactionIds)].slice(0, RELATED_ROWS_LIMIT);
  if (ids.length === 0) return [];
  const { data, error } = await client.from("wallet_transactions")
    .select("id, type, amount_cop, description, created_at")
    .in("id", ids)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as DatabaseRow[]).map((row): WalletTransaction => ({
    id: String(row.id),
    type: String(row.type) as WalletTransaction["type"],
    amount: Number(row.amount_cop),
    description: String(row.description),
    createdAt: timestampLabel(row.created_at),
  }));
}

export async function loadMarketplaceState(client: SupabaseClient, requestPage = 0): Promise<MarketplaceState & { technicians: User[]; requestPage: number; hasMoreRequests: boolean }> {
  const safePage = Math.max(0, Math.floor(requestPage));
  const from = safePage * REQUESTS_PER_PAGE;
  const requestTo = from + REQUESTS_PER_PAGE;
  const [requestResult, offerResult, serviceResult, walletResult, transactionResult] = await Promise.all([
    client.from("service_requests")
      .select(REQUEST_COLUMNS)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, requestTo),
    client.from("offers").select("id, request_id, technician_id, price_cop, message, status, created_at").order("created_at", { ascending: false }).limit(RELATED_ROWS_LIMIT),
    client.from("services").select("id, request_id, client_id, technician_id, agreed_price_cop, commission_cop, payment_method, status, address_revealed, completion_confirmations, created_at").order("created_at", { ascending: false }).limit(RELATED_ROWS_LIMIT),
    client.from("technician_wallets").select("balance_cop").maybeSingle(),
    client.from("wallet_transactions").select("id, type, amount_cop, description, created_at").order("created_at", { ascending: false }).limit(30),
  ]);

  for (const result of [requestResult, offerResult, serviceResult, walletResult, transactionResult]) {
    if (result.error) throw result.error;
  }

  const requestRows = (requestResult.data ?? []) as DatabaseRow[];
  const hasMoreRequests = requestRows.length > REQUESTS_PER_PAGE;
  const visibleRequestRows = requestRows.slice(0, REQUESTS_PER_PAGE);
  const serviceRows = (serviceResult.data ?? []) as DatabaseRow[];
  const requestIds = [...new Set([
    ...visibleRequestRows.map((row) => String(row.id)),
    ...serviceRows.map((row) => String(row.request_id)),
  ])];
  const serviceRequestResult = requestIds.length
    ? await client.from("service_requests").select(REQUEST_COLUMNS).in("id", requestIds)
    : { data: [], error: null };
  if (serviceRequestResult.error) throw serviceRequestResult.error;

  const allRequestRows = [...new Map(
    [...visibleRequestRows, ...((serviceRequestResult.data ?? []) as DatabaseRow[])].map((row) => [String(row.id), row]),
  ).values()];
  const offerRows = (offerResult.data ?? []) as DatabaseRow[];
  const technicianIds = [...new Set(offerRows.map((row) => String(row.technician_id)))];
  const technicianResult = technicianIds.length
    ? await client.from("profiles").select("id, display_name, role, rating, completed_services, verified, is_available").in("id", technicianIds)
    : { data: [], error: null };
  if (technicianResult.error) throw technicianResult.error;
  const technicians = ((technicianResult.data ?? []) as DatabaseRow[]).map(profileToUser);
  const technicianById = new Map(technicians.map((technician) => [technician.id, technician]));
  const requests = await mapRequestRows(client, allRequestRows);

  const offers: Offer[] = offerRows.map((row) => ({
    id: String(row.id),
    requestId: String(row.request_id),
    technicianId: String(row.technician_id),
    price: Number(row.price_cop),
    message: String(row.message ?? ""),
    status: String(row.status) as Offer["status"],
    createdAt: timestampLabel(row.created_at),
    technician: technicianById.get(String(row.technician_id)),
  }));

  const services: Service[] = ((serviceResult.data ?? []) as DatabaseRow[]).map((row) => ({
    id: String(row.id),
    requestId: String(row.request_id),
    clientId: String(row.client_id),
    technicianId: String(row.technician_id),
    agreedPrice: Number(row.agreed_price_cop),
    commission: Number(row.commission_cop),
    paymentMethod: row.payment_method === "digital" ? "digital" : "cash",
    status: String(row.status) as Service["status"],
    addressRevealed: Boolean(row.address_revealed),
    completionConfirmations: Array.isArray(row.completion_confirmations) ? row.completion_confirmations as Service["completionConfirmations"] : [],
    createdAt: timestampLabel(row.created_at),
  }));

  const walletTransactions: WalletTransaction[] = ((transactionResult.data ?? []) as DatabaseRow[]).map((row) => ({
    id: String(row.id),
    type: String(row.type) as WalletTransaction["type"],
    amount: Number(row.amount_cop),
    description: String(row.description),
    createdAt: timestampLabel(row.created_at),
  }));

  return {
    requests,
    offers,
    services,
    technicians,
    walletBalance: Number(walletResult.data?.balance_cop ?? 0),
    walletTransactions,
    requestPage: safePage,
    hasMoreRequests,
  };
}

export async function uploadRequestPhotos(client: SupabaseClient, userId: string, requestId: string, dataUrls: string[]) {
  const uploadedPaths: string[] = [];
  for (const dataUrl of dataUrls) {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const path = `${userId}/${requestId}/${crypto.randomUUID()}.jpg`;
    const { error } = await client.storage.from("request-photos").upload(path, blob, {
      contentType: "image/jpeg",
      upsert: false,
    });
    if (error) {
      if (uploadedPaths.length) await client.storage.from("request-photos").remove(uploadedPaths);
      throw error;
    }
    uploadedPaths.push(path);
  }
  return uploadedPaths;
}
