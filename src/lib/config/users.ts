/**
 * User configuration mapping
 * Maps usernames to their access codes and Dropbox tokens
 *
 * For production: Move to database with hashed passwords
 * For now: Hardcoded mapping for single client (Monica)
 */

interface UserConfig {
  accessCode: string;
  dropboxToken: string;
}

export const USER_CONFIG: Record<string, UserConfig> = {
  monica: {
    accessCode: process.env.MONICA_ACCESS_CODE || '',
    dropboxToken: process.env.MONICA_DROPBOX_TOKEN || process.env.DROPBOX_ACCESS_TOKEN || '',
  },
};

export function getUserConfig(username: string): UserConfig | null {
  return USER_CONFIG[username] || null;
}

export function isValidUsername(username: string): boolean {
  return username in USER_CONFIG;
}

export function validateAccessCode(username: string, accessCode: string): boolean {
  const config = getUserConfig(username);
  return config?.accessCode === accessCode;
}

export function getDropboxToken(username: string): string | null {
  const config = getUserConfig(username);
  return config?.dropboxToken || null;
}
