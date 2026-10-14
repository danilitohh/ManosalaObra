import type { SupabaseClient } from "@supabase/supabase-js";
import type { MarketplaceState, Offer, Service, ServiceRequest, User, WalletTransaction } from "@/lib/marketplace";

type DatabaseRow = Record<string, unknown>;

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
    role: row.role === "technician" ? "technician" : "client",
    rating: Number(row.rating ?? 0),
    completedServices: Number(row.completed_services ?? 0),
    verified: Boolean(row.verified),
    available: Boolean(row.is_available),
  };
}

async function signedPhotoUrls(client: SupabaseClient, paths: string[]) {
  return Promise.all(paths.map(async (path) => {
    const { data, error } = await client.storage.from("request-photos").createSignedUrl(path, 60 * 60);
    return error ? "" : data.signedUrl;
  })).then((urls) => urls.filter(Boolean));
}

export async function loadMarketplaceState(client: SupabaseClient): Promise<MarketplaceState & { technicians: User[] }> {
  const [requestResult, offerResult, serviceResult, walletResult, transactionResult, detailResult, mediaResult] = await Promise.all([
    client.from("service_requests").select("*").order("created_at", { ascending: false }),
    client.from("offers").select("*").order("created_at", { ascending: false }),
    client.from("services").select("*").order("created_at", { ascending: false }),
    client.from("technician_wallets").select("balance_cop").maybeSingle(),
    client.from("wallet_transactions").select("*").order("created_at", { ascending: false }),
    client.from("request_private_details").select("request_id, exact_address"),
    client.from("request_media").select("request_id, photo_paths"),
  ]);

  for (const result of [requestResult, offerResult, serviceResult, walletResult, transactionResult, detailResult, mediaResult]) {
    if (result.error) throw result.error;
  }

  const offerRows = (offerResult.data ?? []) as DatabaseRow[];
  const technicianIds = [...new Set(offerRows.map((row) => String(row.technician_id)))];
  const technicianResult = technicianIds.length
    ? await client.from("profiles").select("id, display_name, role, rating, completed_services, verified, is_available").in("id", technicianIds)
    : { data: [], error: null };
  if (technicianResult.error) throw technicianResult.error;
  const technicians = ((technicianResult.data ?? []) as DatabaseRow[]).map(profileToUser);
  const technicianById = new Map(technicians.map((technician) => [technician.id, technician]));
  const privateById = new Map(((detailResult.data ?? []) as DatabaseRow[]).map((row) => [String(row.request_id), row]));
  const mediaById = new Map(((mediaResult.data ?? []) as DatabaseRow[]).map((row) => [String(row.request_id), row]));

  const requests = await Promise.all(((requestResult.data ?? []) as DatabaseRow[]).map(async (row): Promise<ServiceRequest> => {
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
