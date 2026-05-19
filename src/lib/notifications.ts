import { supabase } from "@/integrations/supabase/client";

export interface AppNotification {
  id: string;
  timestamp: number;
  plantName: string;
  disease: string;
  isHealthy: boolean;
  read: boolean;
  scanId?: string | null;
}

const LOCAL_KEY = "kv_notifications_v1";

const readLocal = (): AppNotification[] => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const writeLocal = (list: AppNotification[]) => {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, 20))); } catch {}
};

export const fetchNotifications = async (): Promise<AppNotification[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return readLocal();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) return readLocal();
  return data.map((n: any) => ({
    id: n.id,
    timestamp: new Date(n.created_at).getTime(),
    plantName: n.plant_name,
    disease: n.disease ?? "",
    isHealthy: n.is_healthy,
    read: n.read,
    scanId: n.scan_id,
  }));
};

export const addNotification = async (
  n: Omit<AppNotification, "id" | "timestamp" | "read"> & { scanId?: string | null }
): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: session.user.id,
        plant_name: n.plantName,
        disease: n.disease,
        is_healthy: n.isHealthy,
        scan_id: n.scanId ?? null,
      })
      .select()
      .single();
    if (!error && data) {
      window.dispatchEvent(new Event("kv-notifications-updated"));
      return (data as any).id as string;
    }
  }
  // fallback local
  const local = readLocal();
  const id = n.scanId || `${Date.now()}`;
  local.unshift({
    id,
    timestamp: Date.now(),
    plantName: n.plantName,
    disease: n.disease,
    isHealthy: n.isHealthy,
    scanId: n.scanId,
    read: false,
  });
  writeLocal(local);
  window.dispatchEvent(new Event("kv-notifications-updated"));
  return id;
};

export const markNotificationRead = async (id: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  } else {
    const local = readLocal().map((n) => (n.id === id ? { ...n, read: true } : n));
    writeLocal(local);
  }
  window.dispatchEvent(new Event("kv-notifications-updated"));
};

export const markAllNotificationsRead = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    await supabase.from("notifications").update({ read: true }).eq("user_id", session.user.id).eq("read", false);
  } else {
    const local = readLocal().map((n) => ({ ...n, read: true }));
    writeLocal(local);
  }
  window.dispatchEvent(new Event("kv-notifications-updated"));
};

export const clearAllNotifications = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    await supabase.from("notifications").delete().eq("user_id", session.user.id);
  }
  localStorage.removeItem(LOCAL_KEY);
  window.dispatchEvent(new Event("kv-notifications-updated"));
};
