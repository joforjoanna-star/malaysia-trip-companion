import { useState } from "react";
import { CheckSquare, Trash2, Plus, Bell } from "lucide-react";
import { Reminder } from "@/lib/types";
import { SectionHeader } from "@/components/SectionHeader";
import { IconButton } from "@/components/IconButton";
import { EmptyState } from "@/components/EmptyState";

interface RemindersTabProps {
  items: Reminder[];
  add: (payload: { label: string; done: boolean; due: string }) => void;
  update: (id: string, patch: Partial<Reminder>) => void;
  remove: (id: string) => void;
}

export function RemindersTab({ items, add, update, remove }: RemindersTabProps) {
  const [newItem, setNewItem] = useState("");
  const [newDue, setNewDue] = useState("");

  const handleAdd = () => {
    const label = newItem.trim();
    if (!label) return;
    add({ label, done: false, due: newDue.trim() });
    setNewItem("");
    setNewDue("");
  };

  const doneCount = items.filter((r) => r.done).length;
  const open = items.filter((r) => !r.done);
  const done = items.filter((r) => r.done);

  return (
    <div>
      <SectionHeader eyebrow={`${doneCount} / ${items.length} done`} title="Reminders" />

      <div className="space-y-2 mb-5">
        {items.length === 0 && (
          <EmptyState text="No reminders yet. Add things you need to do before the trip." />
        )}

        {open.length > 0 && (
          <div className="space-y-2">
            {open.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 bg-white/70 border border-sand rounded-xl px-3 py-2.5 transition hover:border-jade/40"
              >
                <button
                  onClick={() => update(item.id, { done: !item.done })}
                  className="w-5 h-5 mt-0.5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition border-sand-border"
                  aria-label="Mark as done"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] text-ink">{item.label}</div>
                  {item.due && (
                    <div className="flex items-center gap-1 text-[12px] text-spice mt-0.5">
                      <Bell size={11} />
                      {item.due}
                    </div>
                  )}
                </div>
                <IconButton onClick={() => remove(item.id)} label="Remove reminder" tone="danger">
                  <Trash2 size={15} />
                </IconButton>
              </div>
            ))}
          </div>
        )}

        {done.length > 0 && (
          <div className="pt-3">
            <div className="text-[11px] uppercase tracking-wide text-muted font-semibold mb-2">
              Done
            </div>
            <div className="space-y-2">
              {done.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 bg-white/40 border border-sand rounded-xl px-3 py-2.5"
                >
                  <button
                    onClick={() => update(item.id, { done: !item.done })}
                    className="w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center bg-jade border-jade transition"
                    aria-label="Mark as not done"
                  >
                    <CheckSquare size={13} className="text-white" strokeWidth={3} />
                  </button>
                  <span className="flex-1 text-[15px] line-through text-muted">{item.label}</span>
                  <IconButton onClick={() => remove(item.id)} label="Remove reminder" tone="danger">
                    <Trash2 size={15} />
                  </IconButton>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/70 border border-sand rounded-xl p-3 space-y-2">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="What do you need to do?"
          className="w-full rounded-lg border border-sand-deep bg-white px-2.5 py-2 text-[14px] outline-none focus:ring-2 focus:ring-jade/40"
        />
        <div className="flex gap-2">
          <input
            value={newDue}
            onChange={(e) => setNewDue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="When (e.g. 3 days before)"
            className="flex-1 rounded-lg border border-sand-deep bg-white px-2.5 py-2 text-[14px] outline-none focus:ring-2 focus:ring-jade/40"
          />
          <button
            onClick={handleAdd}
            className="px-3 rounded-lg bg-forest text-white flex items-center justify-center active:scale-95 transition hover:bg-forest/90"
            aria-label="Add reminder"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
