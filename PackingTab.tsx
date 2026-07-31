import { useCallback, useEffect, useState } from "react";
import { StoredFile, addFile, getAllFiles, deleteFile, updateFile } from "@/lib/indexeddb";
import { TicketCategory } from "@/lib/types";

export function useFiles() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const all = await getAllFiles();
      setFiles(all);
    } catch (e) {
      console.error("Failed to load files:", e);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upload = useCallback(
    async (file: File, category: TicketCategory, notes = "") => {
      try {
        await addFile(file, category, notes);
        await refresh();
      } catch (e) {
        console.error("Failed to upload file:", e);
      }
    },
    [refresh]
  );

  const update = useCallback(
    async (id: string, patch: Partial<Pick<StoredFile, "name" | "category" | "notes">>) => {
      try {
        await updateFile(id, patch);
        await refresh();
      } catch (e) {
        console.error("Failed to update file:", e);
      }
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await deleteFile(id);
        await refresh();
      } catch (e) {
        console.error("Failed to delete file:", e);
      }
    },
    [refresh]
  );

  const byCategory = useCallback(
    (cat: TicketCategory) => files.filter((f) => f.category === cat),
    [files]
  );

  return { files, loaded, upload, update, remove, byCategory };
}
