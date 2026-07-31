import { Home, CheckSquare, Plane, FileText, MapPin, Image as ImageIcon, NotebookPen, Bell, Ticket } from "lucide-react";
import { TabKey } from "@/lib/types";

interface TabDef {
  key: TabKey;
  label: string;
  icon: typeof Home;
}

export const TABS: TabDef[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "packing", label: "Packing", icon: CheckSquare },
  { key: "itinerary", label: "Itinerary", icon: Plane },
  { key: "tickets-docs", label: "Tickets", icon: Ticket },
  { key: "places", label: "Places", icon: MapPin },
  { key: "reminders", label: "Reminders", icon: Bell },
  { key: "moodboard", label: "Moodboard", icon: ImageIcon },
  { key: "notes", label: "Notes", icon: NotebookPen },
];

interface BottomNavProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-cream/95 backdrop-blur border-t border-tan z-20">
      <div className="max-w-lg mx-auto flex overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className="flex-1 min-w-[56px] flex flex-col items-center gap-1 py-2.5 transition"
            >
              <div className={`relative transition ${isActive ? "scale-110" : ""}`}>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.4 : 1.8}
                  className={isActive ? "text-forest" : "text-muted"}
                />
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-spice" />
                )}
              </div>
              <span
                className={`text-[9px] tracking-wide transition ${
                  isActive ? "text-forest font-semibold" : "text-muted"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
