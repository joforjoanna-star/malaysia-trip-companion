import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";

interface NotesTabProps {
  content: string;
  save: (next: string) => void;
  saving: boolean;
  savedAt: number | null;
}

export function NotesTab({ content, save, saving, savedAt }: NotesTabProps) {
  const [text, setText] = useState(content);
  const [justSaved, setJustSaved] = useState(false);
  const prevSavedAt = useRef<number | null>(null);

  useEffect(() => {
    setText(content);
  }, [content]);

  useEffect(() => {
    if (savedAt && savedAt !== prevSavedAt.current) {
      prevSavedAt.current = savedAt;
      setJustSaved(true);
      const t = setTimeout(() => setJustSaved(false), 1600);
      return () => clearTimeout(t);
    }
  }, [savedAt]);

  const handleBlur = () => {
    if (text !== content) save(text);
  };

  return (
    <div>
      <SectionHeader eyebrow="Freeform" title="Notes" />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        rows={14}
        placeholder="Jot anything down — visa reminders, budget, gift ideas, contacts..."
        className="w-full rounded-xl border border-sand-deep bg-white/70 px-3 py-3 text-[15px] leading-relaxed text-ink outline-none focus:ring-2 focus:ring-jade/40 focus:bg-white transition resize-none"
      />
      <div className="flex items-center gap-1.5 text-[12px] text-muted mt-2 h-4">
        {saving ? (
          <span>Saving...</span>
        ) : justSaved ? (
          <span className="flex items-center gap-1 text-jade">
            <Check size={12} /> Saved
          </span>
        ) : (
          <span>Saves automatically when you tap away.</span>
        )}
      </div>
    </div>
  );
}
