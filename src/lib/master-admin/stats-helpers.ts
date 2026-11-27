import {
  getUserEmailById,
  isExcludedFromStats as adminIsExcluded,
} from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export { isExcludedFromStats } from "@/lib/admin";

export async function loadEmailMapSafe(
  userIds: string[]
): Promise<Map<string, string | null>> {
  const map = new Map<string, string | null>();
  if (userIds.length === 0) return map;

  const admin = createAdminClient();
  try {
    const { data, error } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (!error && data?.users?.length) {
      for (const u of data.users) {
        map.set(u.id, u.email ?? null);
      }
    }
  } catch {
    /* fall through */
  }

  await Promise.all(
    userIds.slice(0, 200).map(async (id) => {
      if (map.has(id)) return;
      map.set(id, await getUserEmailById(id));
    })
  );

  return map;
}

export function filterCountedIds(
  rows: Array<{ id: string }>,
  emailMap: Map<string, string | null>
) {
  return rows.filter((r) => !adminIsExcluded(emailMap.get(r.id)));
}
