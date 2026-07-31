import { useRef, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { MoodboardPhoto } from "@/lib/types";
import { resizeImageFile } from "@/lib/resizeImage";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState } from "@/components/EmptyState";

interface MoodboardTabProps {
  items: MoodboardPhoto[];
  add: (payload: { src: string; caption: string }) => void;
  update: (id: string, patch: Partial<MoodboardPhoto>) => void;
  remove: (id: string) => void;
}

export function MoodboardTab({ items, add, update, remove }: MoodboardTabProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    setError("");
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        const dataUrl = await resizeImageFile(file);
        add({ src: dataUrl, caption: "" });
      }
    } catch (e) {
      setError("Couldn't add one of those photos. Try a smaller image.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <SectionHeader eyebrow={`${items.length} photos`} title="Moodboard" />

      <button
        onClick={() => inputRef.current && inputRef.current.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-sand-border rounded-2xl py-6 mb-5 text-bark active:scale-[0.99] transition disabled:opacity-60 hover:border-jade/60 hover:bg-white/40"
      >
        <Upload size={18} />
        <span className="text-[14px] font-medium">
          {uploading ? "Adding photos..." : "Upload inspiration photos"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      {error && <div className="text-[13px] text-clay mb-4">{error}</div>}

      {items.length === 0 ? (
        <EmptyState text="No photos yet. Upload a few shots for inspiration." />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((photo) => (
            <div
              key={photo.id}
              className="bg-white/70 border border-sand rounded-xl overflow-hidden group animate-fade-in-up"
            >
              <div className="relative">
                <img
                  src={photo.src}
                  alt={photo.caption || "Inspiration"}
                  className="w-full h-32 object-cover"
                />
                <button
                  onClick={() => remove(photo.id)}
                  aria-label="Remove photo"
                  className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full p-1 backdrop-blur-sm transition hover:bg-black/70"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <input
                value={photo.caption}
                onChange={(e) => update(photo.id, { caption: e.target.value })}
                placeholder="Add a caption"
                className="w-full text-[12px] px-2 py-1.5 outline-none bg-transparent text-ink placeholder:text-muted"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
