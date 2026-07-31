import { TicketCategory } from "@/lib/types";

const DB_NAME = "malaysia-trip-companion";
const DB_VERSION = 5;
const MIGRATION_KEY = "langkawi_to_ipoh_melaka";

export const STORES = {
  packing: "packing_items",
  itinerary: "itinerary_items",
  places: "places",
  reminders: "reminders",
  moodboard: "moodboard_photos",
  notes: "trip_notes",
  files: "files",
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

export interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  category: TicketCategory;
  notes: string;
  uploadedAt: number;
}

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export function isAcceptedFileType(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type);
}

let dbPromise: Promise<IDBDatabase> | null = null;

function runMigration(db: IDBDatabase): Promise<void> {
  return new Promise((resolve) => {
    const done = localStorage.getItem(MIGRATION_KEY);
    if (done) {
      resolve();
      return;
    }
    const tx = db.transaction(STORES.places, "readwrite");
    const store = tx.objectStore(STORES.places);
    const req = store.getAll();
    req.onsuccess = () => {
      const places = req.result as { id: string; category: string; region: string }[];
      for (const p of places) {
        if (p.category === "Langkawi" || p.region === "Langkawi") {
          store.put({ ...p, category: "Ipoh/Malacca(Melaka)", region: "Ipoh/Malacca(Melaka)" });
        }
      }
    };
    tx.oncomplete = () => {
      localStorage.setItem(MIGRATION_KEY, "1");
      resolve();
    };
    tx.onerror = () => resolve();
  });
}

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const storeName of Object.values(STORES)) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
        }
      }
    };
    request.onsuccess = async () => {
      const db = request.result;
      db.onversionchange = () => db.close();
      try {
        await runMigration(db);
      } catch {
        // migration is best-effort
      }
      resolve(db);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("IndexedDB blocked"));
  });
  return dbPromise;
}

export async function getAll<T>(store: StoreName): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const request = tx.objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

export async function getMany<T>(
  stores: StoreName[]
): Promise<Record<StoreName, T[]>> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(stores, "readonly");
    const result = {} as Record<StoreName, T[]>;
    let pending = stores.length;
    if (pending === 0) {
      resolve(result);
      return;
    }
    for (const store of stores) {
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => {
        result[store] = req.result as T[];
        if (--pending === 0) resolve(result);
      };
      req.onerror = () => reject(req.error);
    }
  });
}

export async function putItem<T extends { id: string }>(
  store: StoreName,
  item: T
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteItem(store: StoreName, id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getItem<T>(store: StoreName, id: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const request = tx.objectStore(store).get(id);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

export function genId(prefix = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/data:(.*?);/)?.[1] || "application/octet-stream";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export async function addFile(
  file: File,
  category: TicketCategory,
  notes = ""
): Promise<StoredFile> {
  const dataUrl = await fileToDataUrl(file);
  const stored: StoredFile = {
    id: genId("file"),
    name: file.name,
    type: file.type,
    size: file.size,
    dataUrl,
    category,
    notes,
    uploadedAt: Date.now(),
  };
  await putItem(STORES.files, stored);
  return stored;
}

export async function getAllFiles(): Promise<StoredFile[]> {
  const all = await getAll<StoredFile>(STORES.files);
  return all.sort((a, b) => a.uploadedAt - b.uploadedAt);
}

export async function updateFile(
  id: string,
  patch: Partial<Pick<StoredFile, "name" | "category" | "notes">>
): Promise<void> {
  const existing = await getItem<StoredFile>(STORES.files, id);
  if (!existing) return;
  await putItem(STORES.files, { ...existing, ...patch });
}

export async function deleteFile(id: string): Promise<void> {
  await deleteItem(STORES.files, id);
}

export function openFile(file: StoredFile) {
  const blob = dataUrlToBlob(file.dataUrl);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.style.cssText = "position:fixed;left:-9999px;visibility:hidden;";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    if (a.parentNode) document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 120000);
}

export function downloadFile(file: StoredFile) {
  const blob = dataUrlToBlob(file.dataUrl);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name || "download";
  a.rel = "noopener";
  a.style.cssText = "position:fixed;left:-9999px;visibility:hidden;";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    if (a.parentNode) document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 4000);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
