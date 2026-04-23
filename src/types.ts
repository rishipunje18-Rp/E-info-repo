export interface User {
  id: number;
  email: string;
  role: 'admin' | 'student';
}

export interface Event {
  id: number;
  title: string;
  date: string;
  venue: string;
  purpose: string;
  target_audience: string;
  description: string;
  poster_url: string;
  status: 'published' | 'draft' | 'upcoming';
  show_resources: number; // 0 or 1
}

export interface Registration {
  id: number;
  user_id: number;
  event_id: number;
  email: string;
  name: string;
  department: string;
  year: string;
  roll: string;
  registered_at: string;
}

export interface Media {
  id: number;
  event_id: number;
  file_path: string;
  file_type: string;
  category: 'gallery' | 'document' | 'internal';
}
