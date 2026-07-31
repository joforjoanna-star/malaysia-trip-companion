import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STORES, getMany, putItem, deleteItem, genId } from "@/lib/indexeddb";
import {
  PackingItem,
  ItineraryItem,
  Place,
  Reminder,
  MoodboardPhoto,
} from "@/lib/types";

interface DbRow {
  id: string;
  created_at: string;
}

type Collections = {
  packing: PackingItem[];
  itinerary: ItineraryItem[];
  places: Place[];
  reminders: Reminder[];
  moodboard: MoodboardPhoto[];
};

const COLLECTION_KEYS: (keyof Collections)[] = [
  "packing",
  "itinerary",
  "places",
  "reminders",
  "moodboard",
];

const STORE_MAP: Record<keyof Collections, StoreName> = {
  packing: STORES.packing,
  itinerary: STORES.itinerary,
  places: STORES.places,
  reminders: STORES.reminders,
  moodboard: STORES.moodboard,
};

const EMPTY: Collections = {
  packing: [],
  itinerary: [],
  places: [],
  reminders: [],
  moodboard: [],
};

export function useTripData() {
  const [data, setData] = useState<Collections>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const sortByCreated = useRef<(a: DbRow, b: DbRow) => number>(
    (a, b) => (a.created_at || "").localeCompare(b.created_at || "")
  ).current;

  useEffect(() => {
    let cancelled = false;
    const stores = COLLECTION_KEYS.map((k) => STORE_MAP[k]);
    getMany<DbRow>(stores)
      .then((rows) => {
        if (cancelled) return;
        const next = { ...EMPTY };
        for (const key of COLLECTION_KEYS) {
          const list = rows[STORE_MAP[key]] || [];
          list.sort(sortByCreated);
          next[key] = list as Collections[typeof key];
        }
        setData(next);
      })
      .catch((e) => console.error("Failed to load trip data:", e))
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [sortByCreated]);

  const add = useCallback(
    async <K extends keyof Collections>(
      key: K,
      payload: Omit<Collections[K][number], "id" | "created_at">
    ): Promise<Collections[K][number] | null> => {
      const item = {
        ...(payload as object),
        id: genId(STORE_MAP[key]),
        created_at: new Date().toISOString(),
      } as Collections[K][number];
      try {
        await putItem(STORE_MAP[key], item);
        setData((prev) => ({ ...prev, [key]: [...prev[key], item] }));
        return item;
      } catch (e) {
        console.error(`Failed to add to ${key}:`, e);
        return null;
      }
    },
    []
  );

  const update = useCallback(
    async <K extends keyof Collections>(
      key: K,
      id: string,
      patch: Partial<Collections[K][number]>
    ): Promise<void> => {
      setData((prev) => {
        const updated = prev[key].map((i) =>
          i.id === id ? { ...i, ...patch } : i
        ) as Collections[K];
        const item = updated.find((i) => i.id === id);
        if (item) {
          putItem(STORE_MAP[key], item).catch((e) =>
            console.error(`Failed to update ${key}:`, e)
          );
        }
        return { ...prev, [key]: updated };
      });
    },
    []
  );

  const remove = useCallback(
    async <K extends keyof Collections>(key: K, id: string): Promise<void> => {
      setData((prev) => ({
        ...prev,
        [key]: prev[key].filter((i) => i.id !== id),
      }));
      try {
        await deleteItem(STORE_MAP[key], id);
      } catch (e) {
        console.error(`Failed to delete from ${key}:`, e);
      }
    },
    []
  );

  return useMemo(
    () => ({ data, loaded, add, update, remove }),
    [data, loaded, add, update, remove]
  );
}

export type TripData = ReturnType<typeof useTripData>;
