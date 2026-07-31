export interface PackingItem {
  id: string;
  label: string;
  done: boolean;
  created_at: string;
}

export interface ItineraryItem {
  id: string;
  day: string;
  time: string;
  activity: string;
  created_at: string;
}

export type PlaceCategory = "Kuala Lumpur" | "Ipoh/Malacca(Melaka)" | "Others";
export type PlaceSubType = "Cafes" | "Malls" | "Attractions" | "Parks" | "Hotels" | "Others";

export interface Place {
  id: string;
  name: string;
  notes: string;
  link: string;
  region: string;
  category: PlaceCategory;
  sub_type: PlaceSubType;
  created_at: string;
}

export type TicketCategory =
  | "AIR"
  | "FLIGHT"
  | "HOTEL"
  | "ATTRACTIONS"
  | "INSURANCE"
  | "OTHERS";

export interface Reminder {
  id: string;
  label: string;
  done: boolean;
  due: string;
  created_at: string;
}

export interface MoodboardPhoto {
  id: string;
  src: string;
  caption: string;
  created_at: string;
}

export type TabKey =
  | "home"
  | "packing"
  | "itinerary"
  | "tickets-docs"
  | "places"
  | "reminders"
  | "moodboard"
  | "notes";
