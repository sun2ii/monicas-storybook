import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SessionData, sessionOptions } from './config';

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isLoggedIn === true && !!session.username;
}

export async function getCurrentUsername(): Promise<string | null> {
  const session = await getSession();
  return session.isLoggedIn ? session.username : null;
}

export async function login(username: string) {
  const session = await getSession();
  session.username = username;
  session.isLoggedIn = true;
  await session.save();
}

export async function logout() {
  const session = await getSession();
  session.destroy();
}
