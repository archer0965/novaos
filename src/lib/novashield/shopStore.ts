"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createFallbackShopConfig,
  getInitialShopConfig,
  MOCK_SHOPS,
} from "./mockData";
import { normalizeShopConfig } from "./shopNormalize";
import type { ShopConfig } from "./types";

const STORAGE_KEY = "novaos:novashield:shops:v2";
const SYNC_EVENT = "novaos:novashield:shops-updated";

export interface PersistResult {
  config: ShopConfig;
  synced: boolean;
  errorMessage?: string;
}

function defaultPersonalShopId(userId: string): string {
  const tag = userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toLowerCase();
  return `shop-${tag || "mine"}`;
}

function createStarterShopForUser(userId: string, userEmail: string): ShopConfig {
  const shopId = defaultPersonalShopId(userId);
  return normalizeShopConfig(shopId, {
    ...createFallbackShopConfig(shopId),
    shopName: "我的門市",
    emailNotification: userEmail,
  });
}

function readPublicCache(): Record<string, ShopConfig> {
  const defaults: Record<string, ShopConfig> = {};
  for (const id of Object.keys(MOCK_SHOPS)) {
    defaults[id] = normalizeShopConfig(id);
  }
  if (typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Record<string, Partial<ShopConfig>>;
    const merged: Record<string, ShopConfig> = { ...defaults };
    for (const [id, entry] of Object.entries(parsed)) {
      merged[id] = normalizeShopConfig(id, entry);
    }
    return merged;
  } catch {
    return defaults;
  }
}

function writeLocalCache(
  shops: Record<string, ShopConfig>,
  notify: boolean,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(shops));
    if (notify) {
      window.dispatchEvent(new CustomEvent(SYNC_EVENT));
    }
  } catch {
    // ignore storage quota errors
  }
}

async function fetchRemoteShop(shopId: string): Promise<ShopConfig | null> {
  try {
    const response = await fetch(
      `/api/novashield/shops/${encodeURIComponent(shopId)}`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;
    const data = (await response.json()) as {
      ok?: boolean;
      config?: ShopConfig;
    };
    return data.ok && data.config
      ? normalizeShopConfig(shopId, data.config)
      : null;
  } catch {
    return null;
  }
}

async function fetchMyRemoteShops(): Promise<{
  ok: boolean;
  shops?: Record<string, ShopConfig>;
  errorMessage?: string;
}> {
  try {
    const response = await fetch("/api/novashield/shops", {
      cache: "no-store",
    });
    const data = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      shops?: Record<string, Partial<ShopConfig>>;
      message?: string;
      error?: string;
    };
    if (!response.ok || !data.ok || !data.shops) {
      return {
        ok: false,
        errorMessage: data.message || data.error || "無法讀取門市資料。",
      };
    }
    const result: Record<string, ShopConfig> = {};
    for (const [id, entry] of Object.entries(data.shops)) {
      result[id] = normalizeShopConfig(id, entry);
    }
    return { ok: true, shops: result };
  } catch {
    return { ok: false, errorMessage: "網路連線失敗，無法讀取雲端門市資料。" };
  }
}

async function saveRemoteShop(config: ShopConfig): Promise<{
  ok: boolean;
  config?: ShopConfig;
  errorMessage?: string;
}> {
  try {
    const response = await fetch(
      `/api/novashield/shops/${encodeURIComponent(config.shopId)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      },
    );
    const data = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      config?: ShopConfig;
      message?: string;
      error?: string;
    };
    if (!response.ok || !data.ok) {
      return {
        ok: false,
        errorMessage: data.message || data.error || "儲存失敗，請稍後再試。",
      };
    }
    return {
      ok: true,
      config: data.config
        ? normalizeShopConfig(config.shopId, data.config)
        : undefined,
    };
  } catch {
    return { ok: false, errorMessage: "無法連線至伺服器，請稍後再試。" };
  }
}

/** C-side (/novashield/feedback/[shopId]): public read of shop config. */
export function usePersistedShop(shopId: string, initialShop: ShopConfig) {
  const [shop, setShop] = useState<ShopConfig>(initialShop);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const syncFromServer = async () => {
      const remote = await fetchRemoteShop(shopId);
      if (cancelled) return;
      if (remote) {
        setShop(remote);
        writeLocalCache({ ...readPublicCache(), [shopId]: remote }, false);
      }
      setHydrated(true);
    };

    void syncFromServer();
    return () => {
      cancelled = true;
    };
  }, [shopId]);

  return { shop, hydrated };
}

/**
 * Authenticated B-side (/novashield/admin) store bound to the signed-in NovaOS account.
 */
export function useShopStore(options: {
  userId: string;
  userEmail: string;
  isPlatformAdmin: boolean;
  requestedShopId?: string | null;
}) {
  const { userId, userEmail, isPlatformAdmin, requestedShopId } = options;

  const starter = createStarterShopForUser(userId, userEmail);
  const [shops, setShops] = useState<Record<string, ShopConfig>>(() => ({
    [starter.shopId]: starter,
  }));
  const [selectedShopId, setSelectedShopId] = useState<string>(starter.shopId);
  const [draft, setDraft] = useState<ShopConfig>(starter);
  const [hydrated, setHydrated] = useState(false);

  const refreshFromServer = useCallback(async () => {
    const res = await fetchMyRemoteShops();
    const remoteShops = res.ok && res.shops ? res.shops : {};
    const keys = Object.keys(remoteShops);

    if (keys.length === 0) {
      const fallback = createStarterShopForUser(userId, userEmail);
      const map = { [fallback.shopId]: fallback };
      setShops(map);
      setSelectedShopId(fallback.shopId);
      setDraft(fallback);
      setHydrated(true);
      return;
    }

    setShops(remoteShops);
    const preferred =
      requestedShopId && remoteShops[requestedShopId]
        ? requestedShopId
        : keys[0];
    setSelectedShopId(preferred);
    setDraft(remoteShops[preferred]);
    setHydrated(true);
  }, [requestedShopId, userId, userEmail]);

  useEffect(() => {
    void refreshFromServer();
  }, [refreshFromServer]);

  const selectShop = useCallback(
    (shopId: string) => {
      setSelectedShopId(shopId);
      setShops((prev) => {
        const target =
          prev[shopId] ??
          (isPlatformAdmin
            ? getInitialShopConfig(shopId)
            : normalizeShopConfig(shopId, {
                ...createFallbackShopConfig(shopId),
                emailNotification: userEmail,
              }));
        setDraft(target);
        return prev;
      });
    },
    [isPlatformAdmin, userEmail],
  );

  const persistShop = useCallback(
    async (nextConfig: ShopConfig): Promise<PersistResult> => {
      const normalized = normalizeShopConfig(nextConfig.shopId, nextConfig);
      const remote = await saveRemoteShop(normalized);
      if (!remote.ok) {
        return {
          config: normalized,
          synced: false,
          errorMessage: remote.errorMessage,
        };
      }
      const authoritative = remote.config ?? normalized;
      setShops((prev) => ({ ...prev, [authoritative.shopId]: authoritative }));
      setDraft(authoritative);
      writeLocalCache(
        { ...readPublicCache(), [authoritative.shopId]: authoritative },
        true,
      );
      return { config: authoritative, synced: true };
    },
    [],
  );

  const resetSelectedShop = useCallback(async (): Promise<PersistResult> => {
    const base = isPlatformAdmin
      ? getInitialShopConfig(selectedShopId)
      : normalizeShopConfig(selectedShopId, {
          ...createFallbackShopConfig(selectedShopId),
          shopName: "我的門市",
          emailNotification: userEmail,
        });
    return persistShop(base);
  }, [isPlatformAdmin, persistShop, selectedShopId, userEmail]);

  const createOrSwitchShop = useCallback(
    async (shopId: string): Promise<PersistResult> => {
      if (shops[shopId]) {
        setSelectedShopId(shopId);
        setDraft(shops[shopId]);
        return { config: shops[shopId], synced: true };
      }
      const target = normalizeShopConfig(shopId, {
        ...createFallbackShopConfig(shopId),
        shopName: `我的門市 (${shopId})`,
        emailNotification: userEmail,
      });
      const result = await persistShop(target);
      if (result.synced) {
        setSelectedShopId(shopId);
      }
      return result;
    },
    [persistShop, shops, userEmail],
  );

  return {
    shops,
    selectedShopId,
    draft,
    hydrated,
    setDraft,
    selectShop,
    persistShop,
    resetSelectedShop,
    createOrSwitchShop,
    refreshFromServer,
  };
}
