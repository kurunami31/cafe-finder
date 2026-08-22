export type Cafe = {
  id: string;
  osm_id: string;
  name: string;
  street: string | null;
  barangay: string | null;
  district: string | null;
  postcode: string | null;
  lat: number;
  lng: number;
  opening_hours: string | null;
  website: string | null;
  phone: string | null;
  cuisine: string | null;
  wifi: boolean;
  outdoor_seating: boolean;
  aircon: boolean;
  hidden?: boolean;
};

export type CafePhoto = {
  id: string;
  cafe_id: string;
  storage_path: string;
  approved: boolean;
  uploaded_by: string;
  created_at: string;
};

export type CafeWithRating = Cafe & {
  rating_avg: number | null;
  review_count: number;
  cover_url?: string | null;
  photo_count?: number;
};

export type Review = {
  id: string;
  cafe_id: string;
  display_name: string;
  rating: number;
  comment: string;
  created_at: string;
};
