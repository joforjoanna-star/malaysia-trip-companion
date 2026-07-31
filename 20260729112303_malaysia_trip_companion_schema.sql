import { useMemo, useRef, useState } from "react";
import {
  Upload,
  Eye,
  Download,
  Trash2,
  FileText,
  Image as ImageIcon,
  Pencil,
  X,
  Check,
  MoveRight,
  Plane,
  Building,
  Landmark,
  Wind,
  ShieldCheck,
  File,
} from "lucide-react";
import { useFiles } from "@/hooks/useFiles";
import {
  StoredFile,
  isAcceptedFileType,
  openFile,
  downloadFile,
  formatFileSize,
} from "@/lib/indexeddb";
import { TicketCategory } from "@/lib/types";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState } from "@/components/EmptyState";

const ACCEPT = ".pdf,.jpg,.jpeg,.png";

const CATEGORIES: { key: TicketCategory; label: string; icon: typeof Plane }[] = [
  { key: "AIR", label: "Air", icon: Wind },
  { key: "FLIGHT", label: "Flight", icon: Plane },
  { key: "HOTEL", label: "Hotel", icon: Building },
  { key: "ATTRACTIONS", label: "Attractions", icon: Landmark },
  { key: "INSURANCE", label: "Insurance", icon: ShieldCheck },
  { key: "OTHERS", label: "Others", icon: File },
];

const CATEGORY_LABEL: Record<TicketCategory, string> = {
  AIR: "Air",
  FLIGHT: "Flight",
  HOTEL: "Hotel",
  ATTRACTIONS: "Attractions",
  INSURANCE: "Insurance",
  OTHERS: "Others",
};

function FileIcon({ type }: { type: string }) {
  if (type === "application/pdf") {
    return <FileText size={18} className="text-clay" />;
  }
  return <ImageIcon size={18} className="text-jade" />;
}

interface FileCardProps {
  file: StoredFile;
  onRemove: (id: string) => void;
  onUpdate: (
    id: string,
    patch: Partial<Pick<StoredFile, "name" | "category" | "notes">>
  ) => void;
  activeCategory: TicketCategory;
}

function FileCard({ file, onRemove, onUpdate, activeCategory }: FileCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: file.name,
    category: file.category,
    notes: file.notes,
  });
  const [moving, setMoving] = useState(false);

  if (editing) {
    return (
      <div className="bg-white border border-jade/50 rounded-xl px-3 py-3 space-y-2 animate-fade-in-up">
        <input
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="File name"
          className="w-full rounded-lg border border-sand-deep bg-white px-2.5 py-2 text-[14px] outline-none focus:ring-2 focus:ring-jade/40"
        />
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setDraft({ ...draft, category: c.key })}
              className={`rounded-lg px-2 py-1.5 text-[12px] font-medium transition ${
                draft.category === c.key
                  ? "bg-forest text-white"
                  : "bg-cream-tint/60 text-bark border border-sand"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <textarea
          value={draft.notes}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          placeholder="Notes (optional)"
          rows={2}
          className="w-full rounded-lg border border-sand-deep bg-white px-2.5 py-2 text-[14px] outline-none focus:ring-2 focus:ring-jade/40 resize-none"
        />
        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={() => {
              setDraft({ name: file.name, category: file.category, notes: file.notes });
              setEditing(false);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] text-bark border border-sand-deep active:scale-95 transition"
          >
            <X size={14} /> Cancel
          </button>
          <button
            onClick={() => {
              onUpdate(file.id, draft);
              setEditing(false);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] bg-forest text-white active:scale-95 transition hover:bg-forest/90"
          >
            <Check size={14} /> Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 border border-sand rounded-xl px-3 py-3 transition hover:border-jade/40 animate-fade-in-up">
      <div className="flex items-start gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-forest/10 flex items-center justify-center flex-shrink-0">
          <FileIcon type={file.type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-medium text-ink truncate">{file.name}</div>
          <div className="text-[12px] text-muted mt-0.5">
            {formatFileSize(file.size)}
            {file.notes && <span className="ml-1.5">· {file.notes}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2.5 pl-[44px] flex-wrap">
        <button
          onClick={() => openFile(file)}
          className="flex items-center gap-1 text-[12px] font-medium text-jade bg-jade/10 px-2.5 py-1.5 rounded-lg active:scale-95 transition hover:bg-jade/20"
        >
          <Eye size={12} /> Open
        </button>
        <button
          onClick={() => downloadFile(file)}
          className="flex items-center gap-1 text-[12px] font-medium text-bark bg-cream-tint/60 px-2.5 py-1.5 rounded-lg active:scale-95 transition hover:bg-cream-tint"
        >
          <Download size={12} /> Download
        </button>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1 text-[12px] font-medium text-bark bg-cream-tint/60 px-2.5 py-1.5 rounded-lg active:scale-95 transition hover:bg-cream-tint"
        >
          <Pencil size={12} /> Edit
        </button>
        <button
          onClick={() => setMoving(!moving)}
          className="flex items-center gap-1 text-[12px] font-medium text-bark bg-cream-tint/60 px-2.5 py-1.5 rounded-lg active:scale-95 transition hover:bg-cream-tint"
        >
          <MoveRight size={12} /> Move
        </button>
        <button
          onClick={() => onRemove(file.id)}
          className="flex items-center gap-1 text-[12px] font-medium text-clay bg-clay/10 px-2.5 py-1.5 rounded-lg active:scale-95 transition hover:bg-clay/20 ml-auto"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
      {moving && (
        <div className="mt-2.5 pl-[44px] animate-fade-in-up">
          <div className="text-[11px] text-muted mb-1.5">Move to:</div>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.filter((c) => c.key !== activeCategory).map((c) => (
              <button
                key={c.key}
                onClick={() => {
                  onUpdate(file.id, { category: c.key });
                  setMoving(false);
                }}
                className="flex items-center gap-1 text-[12px] font-medium text-bark bg-cream-tint/60 px-2.5 py-1.5 rounded-lg active:scale-95 transition hover:bg-cream-tint hover:text-forest"
              >
                <MoveRight size={11} />
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TicketsDocumentsTab() {
  const { files, loaded, upload, remove, update } = useFiles();
  const [activeCategory, setActiveCategory] = useState<TicketCategory>("AIR");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filesByCategory = useMemo(() => {
    const map = {} as Record<TicketCategory, StoredFile[]>;
    for (const c of CATEGORIES) map[c.key] = [];
    for (const f of files) (map[f.category] ||= []).push(f);
    return map;
  }, [files]);

  const currentFiles = filesByCategory[activeCategory] || [];

  const handleFiles = async (fileList: FileList | null) => {
    setError("");
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        if (!isAcceptedFileType(file)) {
          setError(`${file.name} is not a supported format. Use PDF, JPG, or PNG.`);
          continue;
        }
        await upload(file, activeCategory);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <SectionHeader eyebrow="Upload & manage" title="Tickets & Documents" />

      {/* Category tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const count = (filesByCategory[c.key] || []).length;
          return (
            <button
              key={c.key}
              onClick={() => setActiveCategory(c.key)}
              className={`flex-1 min-w-[72px] flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-[12px] font-medium transition ${
                activeCategory === c.key
                  ? "bg-forest text-white shadow-sm"
                  : "bg-white/70 text-bark border border-sand hover:border-jade/50"
              }`}
            >
              <Icon size={16} />
              <span>{c.label}</span>
              <span className={`text-[10px] ${activeCategory === c.key ? "text-mint" : "text-muted"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Upload area */}
      <button
        onClick={() => inputRef.current && inputRef.current.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-sand-border rounded-2xl py-6 mb-4 text-bark active:scale-[0.99] transition disabled:opacity-60 hover:border-jade/60 hover:bg-white/40"
      >
        <Upload size={18} />
        <span className="text-[14px] font-medium">
          {uploading ? "Uploading..." : `Upload to ${CATEGORY_LABEL[activeCategory]}`}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      {error && <div className="text-[13px] text-clay mb-4">{error}</div>}

      {/* File list */}
      {currentFiles.length === 0 ? (
        <EmptyState text={`No files in ${CATEGORY_LABEL[activeCategory]} yet. Upload your tickets or documents here.`} />
      ) : (
        <div className="space-y-2.5">
          {currentFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onRemove={remove}
              onUpdate={update}
              activeCategory={activeCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
}
