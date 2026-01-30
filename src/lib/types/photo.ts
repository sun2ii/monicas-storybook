export interface Photo {
  photo_id: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  owner_id: string;
  dropbox_file_id?: string;
  dropbox_url?: string;
  dropbox_metadata?: Record<string, any>;
  hash?: string;
  file_size?: number;
  source?: string[]; // Array of storage provider names where photo exists ['Dropbox', 'Google Photos', etc.]
}

export interface PhotoFilter {
  tags?: string[];
  dateRange?: { start: Date; end: Date };
  searchTerm?: string;
}
