export interface Profile {
  id: string;
  display_name?: string;
  timezone?: string;
  is_dev: boolean;
  created_at: string;
  updated_at: string;
}

export function isDevUser(profile: Profile | null): boolean {
  return profile?.is_dev === true;
}
