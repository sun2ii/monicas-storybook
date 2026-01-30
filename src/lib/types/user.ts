export interface User {
  user_id: string;
  email: string;
  name: string;
  dropbox_access_token?: string;
  dropbox_refresh_token?: string;
  created_at: string;
  updated_at: string;
}
