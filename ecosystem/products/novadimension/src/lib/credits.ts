import { put, list } from "@vercel/blob";

export type CreditAccount = {
  id: string;
  credits: number;
  /** unlimited when subscriptionEndsAt is in the future */
  subscriptionEndsAt: string | null;
  updatedAt: string;
};

const PREFIX = "credits/";

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN;
}

export async function getAccount(id: string): Promise<CreditAccount> {
  const token = blobToken();
  if (!token) {
    return {
      id,
      credits: 1,
      subscriptionEndsAt: null,
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const { blobs } = await list({
      prefix: `${PREFIX}${id}`,
      token,
      limit: 1,
    });
    if (!blobs[0]) {
      return {
        id,
        credits: 1,
        subscriptionEndsAt: null,
        updatedAt: new Date().toISOString(),
      };
    }
    const res = await fetch(blobs[0].url);
    if (!res.ok) throw new Error("fetch failed");
    return (await res.json()) as CreditAccount;
  } catch {
    return {
      id,
      credits: 1,
      subscriptionEndsAt: null,
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function saveAccount(account: CreditAccount): Promise<void> {
  const token = blobToken();
  if (!token) return;

  await put(`${PREFIX}${account.id}.json`, JSON.stringify(account), {
    access: "private",
    token,
    addRandomSuffix: false,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

export function hasAccess(account: CreditAccount): boolean {
  if (
    account.subscriptionEndsAt &&
    new Date(account.subscriptionEndsAt).getTime() > Date.now()
  ) {
    return true;
  }
  return account.credits > 0;
}

export function consumeCredit(account: CreditAccount): CreditAccount {
  if (
    account.subscriptionEndsAt &&
    new Date(account.subscriptionEndsAt).getTime() > Date.now()
  ) {
    return { ...account, updatedAt: new Date().toISOString() };
  }
  return {
    ...account,
    credits: Math.max(0, account.credits - 1),
    updatedAt: new Date().toISOString(),
  };
}

export function applyGrant(
  account: CreditAccount,
  grant: { credits: number; subscriptionDays: number },
): CreditAccount {
  const next = { ...account, updatedAt: new Date().toISOString() };
  if (grant.subscriptionDays > 0) {
    const base = Math.max(
      Date.now(),
      account.subscriptionEndsAt
        ? new Date(account.subscriptionEndsAt).getTime()
        : 0,
    );
    next.subscriptionEndsAt = new Date(
      base + grant.subscriptionDays * 24 * 60 * 60 * 1000,
    ).toISOString();
  }
  if (grant.credits > 0) {
    next.credits = account.credits + grant.credits;
  }
  return next;
}
