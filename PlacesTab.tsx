import { useState } from "react";
import { CheckSquare, Trash2, Plus } from "lucide-react";
import { PackingItem } from "@/lib/types";
import { SectionHeader } from "@/components/SectionHeader";
import { IconButton } from "@/components/IconButton";
import { EmptyState } from "@/components/EmptyState";

interface PackingTabProps {
  items: PackingItem[];
  add: (payload: { label: string; done: boolean }) => void;
  update: (id: string, patch: Partial<PackingItem>) => void;
  remove: (id: string) => void;
}

export function PackingTab({ items, add, update, remove }: PackingTabProps) {
  const [newItem, setNewItem] = useState("");

  const handleAdd = () => {
    const label = newItem.trim();
    if (!label) return;
    add({ label, done: false });
    setNewItem("");
  };

  const doneCount = items.filter((p) => p.done).length;

  return (
    <div>
      <SectionHeader eyebrow={`${doneCount} / ${items.length} packed`} title="Packing list" />

      <div className="space-y-2 mb-4">
        {items.length === 0 && (
          <EmptyState text="Nothing on the list yet. Add your first item below." />
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 bg-white/70 border border-sand rounded-xl px-3 py-2.5 transition hover:border-jade/40"
          >
            <button
              onClick={() => update(item.id, { done: !item.done })}
              className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition ${
                item.done ? "bg-jade border-jade" : "border-sand-border"
              }`}
              aria-label={item.done ? "Mark as not packed" : "Mark as packed"}
            >
              {item.done && <CheckSquare size={13} className="text-white" strokeWidth={3} />}
            </button>
            <span className={`flex-1 text-[15px] ${item.done ? "line-through text-muted" : "text-ink"}`}>
              {item.label}
            </span>
            <IconButton onClick={() => remove(item.id)} label="Remove item" tone="danger">
              <Trash2 size={15} />
            </IconButton>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add an item"
          className="flex-1 rounded-xl border border-sand-deep bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:ring-2 focus:ring-jade/40 transition"
        />
        <button
          onClick={handleAdd}
          className="px-3 rounded-xl bg-forest text-white flex items-center justify-center active:scale-95 transition hover:bg-forest/90"
          aria-label="Add packing item"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
