import { CheckSquare, Plane, FileText, MapPin, Image as ImageIcon, Ticket, Bell } from "lucide-react";
import { PackingItem, ItineraryItem, Place, Reminder, TabKey } from "@/lib/types";

interface HomeTabProps {
  packing: PackingItem[];
  itinerary: ItineraryItem[];
  places: Place[];
  reminders: Reminder[];
  photosCount: number;
  goTo: (tab: TabKey) => void;
}

const TRAVELER_NAME = "Joanna";

export function HomeTab({
  packing,
  itinerary,
  places,
  reminders,
  photosCount,
  goTo,
}: HomeTabProps) {
  const packedCount = packing.filter((p) => p.done).length;
  const openReminders = reminders.filter((r) => !r.done).length;
  const tiles = [
    { key: "packing" as const, label: "Packing", value: `${packedCount}/${packing.length}`, icon: CheckSquare },
    { key: "itinerary" as const, label: "Itinerary", value: `${itinerary.length} plans`, icon: Plane },
    { key: "tickets-docs" as const, label: "Tickets & Docs", value: "View files", icon: Ticket },
    { key: "places" as const, label: "Places", value: `${places.length} saved`, icon: MapPin },
    { key: "reminders" as const, label: "Reminders", value: openReminders > 0 ? `${openReminders} to do` : "All done", icon: Bell },
    { key: "moodboard" as const, label: "Moodboard", value: `${photosCount} photos`, icon: ImageIcon },
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="relative bg-forest rounded-3xl px-6 py-7 mb-7 overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-jade/20 blur-2xl" />
        <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full bg-gold/15 blur-xl" />
        <div className="relative">
          <div className="text-[11px] tracking-[0.3em] uppercase text-gold font-semibold mb-2.5">
            Selamat datang
          </div>
          <h1
            className="text-[27px] leading-[1.2] text-white mb-2.5"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
          >
            Hi {TRAVELER_NAME}, welcome to your Malaysia journey!
          </h1>
          <p className="text-mint text-[14px] leading-relaxed">
            Bangalore &rarr; Kuala Lumpur &amp; Ipoh/Malacca, August. Everything for the trip lives here.
          </p>
        </div>
      </div>

      <div className="text-[11px] tracking-[0.25em] uppercase text-spice font-semibold mb-3">
        At a glance
      </div>
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile, i) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.key}
              onClick={() => goTo(tile.key)}
              style={{ animationDelay: `${i * 55}ms` }}
              className="text-left bg-white/70 border border-sand rounded-2xl p-4 active:scale-[0.97] transition animate-fade-in-up hover:border-jade/50 hover:shadow-sm"
            >
              <Icon size={18} className="text-jade mb-2.5" />
              <div className="text-[15px] font-medium text-ink">{tile.label}</div>
              <div className="text-[13px] text-ink-soft mt-0.5">{tile.value}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
