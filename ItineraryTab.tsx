import { useMemo, useState, memo } from "react";
import { useTripData } from "@/hooks/useTripData";
import { useNotes } from "@/hooks/useNotes";
import { BottomNav } from "@/components/BottomNav";
import { HomeTab } from "@/components/HomeTab";
import { PackingTab } from "@/components/PackingTab";
import { ItineraryTab } from "@/components/ItineraryTab";
import { TicketsDocumentsTab } from "@/components/TicketsDocumentsTab";
import { PlacesTab } from "@/components/PlacesTab";
import { RemindersTab } from "@/components/RemindersTab";
import { MoodboardTab } from "@/components/MoodboardTab";
import { NotesTab } from "@/components/NotesTab";
import {
  TabKey,
  PackingItem,
  ItineraryItem,
  Place,
  Reminder,
  MoodboardPhoto,
} from "@/lib/types";

const MemoHomeTab = memo(HomeTab);
const MemoPackingTab = memo(PackingTab);
const MemoItineraryTab = memo(ItineraryTab);
const MemoTicketsTab = memo(TicketsDocumentsTab);
const MemoPlacesTab = memo(PlacesTab);
const MemoRemindersTab = memo(RemindersTab);
const MemoMoodboardTab = memo(MoodboardTab);
const MemoNotesTab = memo(NotesTab);

export default function App() {
  const trip = useTripData();
  const notes = useNotes();
  const [active, setActive] = useState<TabKey>("home");

  const loaded = trip.loaded && notes.loaded;

  const homeProps = useMemo(
    () => ({
      packing: trip.data.packing,
      itinerary: trip.data.itinerary,
      places: trip.data.places,
      reminders: trip.data.reminders,
      photosCount: trip.data.moodboard.length,
      goTo: setActive,
    }),
    [trip.data]
  );

  const packingApi = useMemo(
    () => ({
      items: trip.data.packing,
      add: (p: Omit<PackingItem, "id" | "created_at">) => trip.add("packing", p),
      update: (id: string, patch: Partial<PackingItem>) => trip.update("packing", id, patch),
      remove: (id: string) => trip.remove("packing", id),
    }),
    [trip]
  );

  const itineraryApi = useMemo(
    () => ({
      items: trip.data.itinerary,
      add: (p: Omit<ItineraryItem, "id" | "created_at">) => trip.add("itinerary", p),
      update: (id: string, patch: Partial<ItineraryItem>) => trip.update("itinerary", id, patch),
      remove: (id: string) => trip.remove("itinerary", id),
    }),
    [trip]
  );

  const placesApi = useMemo(
    () => ({
      items: trip.data.places,
      add: (p: Omit<Place, "id" | "created_at">) => trip.add("places", p),
      update: (id: string, patch: Partial<Place>) => trip.update("places", id, patch),
      remove: (id: string) => trip.remove("places", id),
    }),
    [trip]
  );

  const remindersApi = useMemo(
    () => ({
      items: trip.data.reminders,
      add: (p: Omit<Reminder, "id" | "created_at">) => trip.add("reminders", p),
      update: (id: string, patch: Partial<Reminder>) => trip.update("reminders", id, patch),
      remove: (id: string) => trip.remove("reminders", id),
    }),
    [trip]
  );

  const moodboardApi = useMemo(
    () => ({
      items: trip.data.moodboard,
      add: (p: Omit<MoodboardPhoto, "id" | "created_at">) => trip.add("moodboard", p),
      update: (id: string, patch: Partial<MoodboardPhoto>) => trip.update("moodboard", id, patch),
      remove: (id: string) => trip.remove("moodboard", id),
    }),
    [trip]
  );

  const notesApi = useMemo(
    () => ({
      content: notes.content,
      save: notes.save,
      saving: notes.saving,
      savedAt: notes.savedAt,
    }),
    [notes]
  );

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-forest/30 border-t-forest animate-spin" />
          <div className="text-bark text-sm">Loading trip...</div>
        </div>
      </div>
    );
  }

  const renderTab = () => {
    switch (active) {
      case "home":
        return <MemoHomeTab {...homeProps} />;
      case "packing":
        return <MemoPackingTab {...packingApi} />;
      case "itinerary":
        return <MemoItineraryTab {...itineraryApi} />;
      case "tickets-docs":
        return <MemoTicketsTab />;
      case "places":
        return <MemoPlacesTab {...placesApi} />;
      case "reminders":
        return <MemoRemindersTab {...remindersApi} />;
      case "moodboard":
        return <MemoMoodboardTab {...moodboardApi} />;
      case "notes":
        return <MemoNotesTab {...notesApi} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-cream" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="relative overflow-hidden bg-forest px-5 pt-7 pb-7">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-jade/20 blur-2xl" />
        <div className="absolute left-4 bottom-2 w-20 h-20 rounded-full bg-gold/10 blur-xl" />
        <div className="relative">
          <div className="text-[11px] tracking-[0.3em] uppercase text-gold font-semibold mb-1">
            Trip Companion
          </div>
          <h1
            className="text-[28px] text-white"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
          >
            Malaysia
          </h1>
        </div>
        <svg
          className="absolute -bottom-1 left-0 w-full"
          height="18"
          viewBox="0 0 400 18"
          preserveAspectRatio="none"
        >
          <path
            d="M0 9 Q 20 0, 40 9 T 80 9 T 120 9 T 160 9 T 200 9 T 240 9 T 280 9 T 320 9 T 360 9 T 400 9 V18 H0 Z"
            fill="#FAF3E7"
          />
        </svg>
      </div>

      <div className="px-5 pt-6 pb-28 max-w-lg mx-auto">{renderTab()}</div>

      <BottomNav active={active} onChange={setActive} />
    </div>
  );
}
