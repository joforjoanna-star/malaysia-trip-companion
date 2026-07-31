import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Plus, X, Check, ArrowRight, Clock } from "lucide-react";
import { ItineraryItem } from "@/lib/types";
import { SectionHeader } from "@/components/SectionHeader";
import { IconButton } from "@/components/IconButton";
import { EmptyState } from "@/components/EmptyState";

const MAX_PLACES_PER_DAY = 20;

function normalizeDay(raw: string): string {
  const trimmed = (raw || "").trim();
  if (!trimmed) return "Day 1";
  const match = trimmed.match(/(\d+)/);
  if (match) return `Day ${match[1]}`;
  return trimmed;
}

function parseTimeValue(time: string): number {
  const t = (time || "").trim();
  if (!t) return 9999;
  const match24 = t.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const h = parseInt(match24[1], 10);
    const m = parseInt(match24[2], 10);
    return h * 60 + m;
  }
  const matchAmPm = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (matchAmPm) {
    let h = parseInt(matchAmPm[1], 10);
    const m = matchAmPm[2] ? parseInt(matchAmPm[2], 10) : 0;
    const period = matchAmPm[3].toLowerCase();
    if (period === "pm" && h !== 12) h += 12;
    if (period === "am" && h === 12) h = 0;
    return h * 60 + m;
  }
  const num = parseFloat(t);
  if (!isNaN(num)) return num * 60;
  return 9999;
}

interface ItineraryRowProps {
  item: ItineraryItem;
  onSave: (updated: ItineraryItem) => void;
  onRemove: (id: string) => void;
}

function ItineraryRow({ item, onSave, onRemove }: ItineraryRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item);

  useEffect(() => {
    setDraft(item);
  }, [item]);

  if (editing) {
    return (
      <div className="bg-white border border-jade/50 rounded-xl px-3 py-3 space-y-2 animate-fade-in-up">
        <div className="flex gap-2">
          <input
            value={draft.day}
            onChange={(e) => setDraft({ ...draft, day: e.target.value })}
            placeholder="Day (e.g. Day 3)"
            className="w-1/2 rounded-lg border border-sand-deep bg-white px-2.5 py-2 text-[14px] outline-none focus:ring-2 focus:ring-jade/40"
          />
          <input
            value={draft.time}
            onChange={(e) => setDraft({ ...draft, time: e.target.value })}
            placeholder="Time (e.g. 09:00)"
            className="w-1/2 rounded-lg border border-sand-deep bg-white px-2.5 py-2 text-[14px] outline-none focus:ring-2 focus:ring-jade/40"
          />
        </div>
        <input
          value={draft.activity}
          onChange={(e) => setDraft({ ...draft, activity: e.target.value })}
          placeholder="Place or activity"
          className="w-full rounded-lg border border-sand-deep bg-white px-2.5 py-2 text-[14px] outline-none focus:ring-2 focus:ring-jade/40"
        />
        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={() => {
              setDraft(item);
              setEditing(false);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] text-bark border border-sand-deep active:scale-95 transition"
          >
            <X size={14} /> Cancel
          </button>
          <button
            onClick={() => {
              onSave({
                ...draft,
                day: normalizeDay(draft.day),
              });
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

  const displayActivity = item.activity.trim() || "(untitled place)";

  return (
    <div className="flex items-start gap-1.5 bg-white/80 border border-sand rounded-xl px-3 py-2.5 transition hover:border-jade/40 animate-fade-in-up">
      <div className="flex-1 min-w-0">
        <div className="text-[15px] text-ink leading-snug">{displayActivity}</div>
        {item.time && (
          <div className="flex items-center gap-1 text-[11px] text-spice mt-1">
            <Clock size={10} />
            {item.time}
          </div>
        )}
      </div>
      <IconButton onClick={() => setEditing(true)} label="Edit plan">
        <Pencil size={14} />
      </IconButton>
      <IconButton onClick={() => onRemove(item.id)} label="Remove plan" tone="danger">
        <Trash2 size={14} />
      </IconButton>
    </div>
  );
}

interface ItineraryTabProps {
  items: ItineraryItem[];
  add: (payload: { day: string; time: string; activity: string }) => void;
  update: (id: string, patch: Partial<ItineraryItem>) => void;
  remove: (id: string) => void;
}

export function ItineraryTab({ items, add, update, remove }: ItineraryTabProps) {
  const [form, setForm] = useState({ day: "Day 1", time: "", activity: "" });

  const grouped = useMemo(() => {
    const map: Record<string, ItineraryItem[]> = {};
    for (const item of items) {
      const day = normalizeDay(item.day);
      (map[day] = map[day] || []).push(item);
    }
    for (const day of Object.keys(map)) {
      map[day].sort((a, b) => parseTimeValue(a.time) - parseTimeValue(b.time));
    }
    return map;
  }, [items]);

  const sortedDays = useMemo(() => {
    return Object.keys(grouped).sort((a, b) => {
      const na = parseInt(a.match(/\d+/)?.[0] || "0", 10);
      const nb = parseInt(b.match(/\d+/)?.[0] || "0", 10);
      return na - nb;
    });
  }, [grouped]);

  const dayCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of items) {
      const day = normalizeDay(item.day);
      map[day] = (map[day] || 0) + 1;
    }
    return map;
  }, [items]);

  const handleAdd = () => {
    const activity = form.activity.trim();
    if (!activity) return;
    const day = normalizeDay(form.day);
    if ((dayCounts[day] || 0) >= MAX_PLACES_PER_DAY) return;
    add({ day, time: form.time.trim(), activity });
    setForm({ day, time: "", activity: "" });
  };

  const selectedDay = normalizeDay(form.day);
  const selectedDayCount = dayCounts[selectedDay] || 0;
  const selectedDayFull = selectedDayCount >= MAX_PLACES_PER_DAY;

  return (
    <div>
      <SectionHeader eyebrow={`Up to ${MAX_PLACES_PER_DAY} places per day`} title="Itinerary" />

      <div className="space-y-6 mb-5">
        {items.length === 0 && <EmptyState text="No plans added yet." />}
        {sortedDays.map((day) => {
          const dayItems = grouped[day];
          const count = dayItems.length;
          const dayFull = count >= MAX_PLACES_PER_DAY;
          return (
            <div key={day}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-spice/60" />
                  <div className="text-[13px] font-semibold text-spice uppercase tracking-wide">
                    {day}
                  </div>
                </div>
                <div className={`text-[11px] ${dayFull ? "text-clay" : "text-muted"}`}>
                  {count}/{MAX_PLACES_PER_DAY} places
                </div>
              </div>

              {/* Flow with arrows */}
              <div className="flex flex-wrap items-center gap-y-1">
                {dayItems.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-1.5">
                    {idx > 0 && (
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-spice/15 flex-shrink-0">
                        <ArrowRight size={15} className="text-spice" strokeWidth={2.5} />
                      </div>
                    )}
                    <ItineraryRow
                      item={{ ...item, day }}
                      onSave={(updated) => update(updated.id, updated)}
                      onRemove={remove}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white/70 border border-sand rounded-xl p-3 space-y-2">
        {selectedDayFull && (
          <div className="text-[12px] text-clay bg-clay/10 rounded-lg px-2.5 py-2">
            {selectedDay} is full — {MAX_PLACES_PER_DAY} places max. Remove one or choose another day.
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={form.day}
            onChange={(e) => setForm({ ...form, day: e.target.value })}
            placeholder="Day (e.g. Day 3)"
            className="w-1/2 rounded-lg border border-sand-deep bg-white px-2.5 py-2 text-[14px] outline-none focus:ring-2 focus:ring-jade/40"
          />
          <input
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            placeholder="Time (e.g. 09:00)"
            className="w-1/2 rounded-lg border border-sand-deep bg-white px-2.5 py-2 text-[14px] outline-none focus:ring-2 focus:ring-jade/40"
          />
        </div>
        <div className="flex gap-2">
          <input
            value={form.activity}
            onChange={(e) => setForm({ ...form, activity: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Place or activity"
            className="flex-1 rounded-lg border border-sand-deep bg-white px-2.5 py-2 text-[14px] outline-none focus:ring-2 focus:ring-jade/40"
          />
          <button
            onClick={handleAdd}
            disabled={selectedDayFull || !form.activity.trim()}
            className="px-3 rounded-lg bg-forest text-white flex items-center justify-center active:scale-95 transition hover:bg-forest/90 disabled:opacity-50"
            aria-label="Add itinerary item"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
