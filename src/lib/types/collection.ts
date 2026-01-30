export interface Collection {
  collection_id: string;
  user_id: string;
  name: string;
  photo_ids: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
  type: 'album' | 'scrapbook';
}
