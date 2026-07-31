import { useCallback, useEffect, useState } from "react";
import { STORES, getItem, putItem } from "@/lib/indexeddb";

const NOTES_ID = "trip_notes_singleton";

export function useNotes() {
  const [content, setContent] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getItem<{ id: string; content: string }>(STORES.notes, NOTES_ID)
      .then((row) => {
        if (cancelled) return;
        if (row) setContent(row.content ?? "");
      })
      .catch((e) => console.error("Failed to load notes:", e))
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(async (next: string) => {
    setSaving(true);
    try {
      await putItem(STORES.notes, {
        id: NOTES_ID,
        content: next,
        updated_at: new Date().toISOString(),
      });
      setSavedAt(Date.now());
    } catch (e) {
      console.error("Failed to save notes:", e);
    } finally {
      setSaving(false);
    }
  }, []);

  return { content, save, loaded, saving, savedAt };
}
