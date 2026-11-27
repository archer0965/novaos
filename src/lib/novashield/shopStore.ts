"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MOCK_SHOPS,
  createFallbackShopConfig,
  getInitialShopConfig,
} from "./mockData";
import { normalizeShopConfig } from "./shopNormalize";
import type { ShopConfig } from "./types";

const STORAGE_KEY = "novaos:novashield:shops:v1";
const SYNC_EVENT = "novaos:novashield:shops-updated";

export interface PersistResult {
  config: ShopConfig;
  synced: boolean;
}

export function readShopsFromStorage(): Record<string, ShopConfig> {
  const defaults: Record<string, ShopConfig> = {};
  for (const id of Object.keys(MOCK_SHOPS)) {
    defaults[id] = normalizeShopConfig(id);
  }

  if (typeof window === "undefined") {
    return defaults;
  }

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

export function getStoredShopById(shopId: string): ShopConfig {
  const all = readShopsFromStorage();
  return all[shopId] ?? normalizeShopConfig(shopId);
}

export function saveShopToStorage(
  config: ShopConfig,
): Record<string, ShopConfig> {
  const all = readShopsFromStorage();
  all[config.shopId] = normalizeShopConfig(config.shopId, config);
  writeLocalCache(all, true);
  return all;
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

async function fetchRemoteShops(): Promise<Record<string, ShopConfig> | null> {
  try {
    const response = await fetch("/api/novashield/shops", {
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      ok?: boolean;
      shops?: Record<string, Partial<ShopConfig>>;
    };
    if (!data.ok || !data.shops) return null;
    const result: Record<string, ShopConfig> = {};
    for (const [id, entry] of Object.entries(data.shops)) {
      result[id] = normalizeShopConfig(id, entry);
    }
    return result;
  } catch {
    return null;
  }
}

async function saveRemoteShop(
  config: ShopConfig,
): Promise<{ ok: boolean; config?: ShopConfig }> {
  try {
    const response = await fetch(
      `/api/novashield/shops/${encodeURIComponent(config.shopId)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      },
    );
    if (!response.ok) return { ok: false };
    const data = (await response.json()) as {
      ok?: boolean;
      config?: ShopConfig;
    };
    return {
      ok: Boolean(data.ok),
      config: data.config
        ? normalizeShopConfig(config.shopId, data.config)
        : undefined,
    };
  } catch {
    return { ok: false };
  }
}

export async function persistShopEverywhere(
  config: ShopConfig,
): Promise<PersistResult> {
  const normalized = normalizeShopConfig(config.shopId, config);
  const remote = await saveRemoteShop(normalized);
  const authoritative = remote.config ?? normalized;
  saveShopToStorage(authoritative);
  return { config: authoritative, synced: remote.ok };
}

export function usePersistedShop(shopId: string, initialShop: ShopConfig) {
  const [shop, setShop] = useState<ShopConfig>(initialShop);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const applyLocal = () => {
      setShop(getStoredShopById(shopId));
    };

    const syncFromServer = async () => {
      const remote = await fetchRemoteShop(shopId);
      if (cancelled) return;
      if (remote) {
        setShop(remote);
        writeLocalCache({ ...readShopsFromStorage(), [shopId]: remote }, false);
      } else {
        applyLocal();
      }
      setHydrated(true);
    };

    void syncFromServer();

    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key === STORAGE_KEY) {
        applyLocal();
      }
    };
    const onCustomSync = () => applyLocal();

    window.addEventListener("storage", onStorage);
    window.addEventListener(SYNC_EVENT, onCustomSync);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SYNC_EVENT, onCustomSync);
    };
  }, [shopId]);

  return { shop, hydrated };
}

export function useShopStore(initialShopId: string) {
  const [shops, setShops] = useState<Record<string, ShopConfig>>(MOCK_SHOPS);
  const [selectedShopId, setSelectedShopId] = useState<string>(initialShopId);
  const [draft, setDraft] = useState<ShopConfig>(() =>
    getInitialShopConfig(initialShopId),
  );
  const [hydrated, setHydrated] = useState(false);
  const [databaseReady, setDatabaseReady] = useState<boolean | null>(null);

  const refreshFromServer = useCallback(async () => {
    const local = readShopsFromStorage();
    const remote = await fetchRemoteShops();
    const merged = remote ? { ...local, ...remote } : local;
    setDatabaseReady(remote !== null);
    setShops(merged);
    setDraft(merged[selectedShopId] ?? createFallbackShopConfig(selectedShopId));
    writeLocalCache(merged, false);
    setHydrated(true);
  }, [selectedShopId]);

  useEffect(() => {
    void refreshFromServer();
  }, [refreshFromServer]);

  const selectShop = useCallback((shopId: string) => {
    setSelectedShopId(shopId);
    const loaded = readShopsFromStorage();
    setShops((prev) => ({ ...prev, ...loaded }));
    setDraft(loaded[shopId] ?? createFallbackShopConfig(shopId));
  }, []);

  const persistShop = useCallback(async (nextConfig: ShopConfig) => {
    const result = await persistShopEverywhere(nextConfig);
    setShops((prev) => ({ ...prev, [result.config.shopId]: result.config }));
    setDraft(result.config);
    setDatabaseReady((prev) => (result.synced ? true : prev));
    return result;
  }, []);

  const resetSelectedShop = useCallback(async () => {
    const defaults = MOCK_SHOPS[selectedShopId]
      ? normalizeShopConfig(selectedShopId)
      : createFallbackShopConfig(selectedShopId);
    const result = await persistShopEverywhere(defaults);
    setShops((prev) => ({ ...prev, [selectedShopId]: result.config }));
    setDraft(result.config);
    return result;
  }, [selectedShopId]);

  const createOrSwitchShop = useCallback(async (shopId: string) => {
    const existing = readShopsFromStorage()[shopId];
    const target = existing ?? createFallbackShopConfig(shopId);
    const result = await persistShopEverywhere(target);
    setShops((prev) => ({ ...prev, [shopId]: result.config }));
    setSelectedShopId(shopId);
    setDraft(result.config);
    return result;
  }, []);

  return {
    shops,
    selectedShopId,
    draft,
    hydrated,
    databaseReady,
    setDraft,
    selectShop,
    persistShop,
    resetSelectedShop,
    createOrSwitchShop,
    refreshFromServer,
  };
}
