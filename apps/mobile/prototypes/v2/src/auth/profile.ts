import type { Session, SupabaseClient } from '@supabase/supabase-js';
import type { V2SignedInIdentity } from './types';

export type RegistrationProfileInput = {
  firstName: string;
  lastName: string;
  email: string;
};

function clean(value: string): string {
  return value.trim();
}

export function makeDisplayName(firstName: string, lastName: string): string {
  return [clean(firstName), clean(lastName)].filter(Boolean).join(' ');
}

export async function upsertRegisteredProfile(
  client: SupabaseClient,
  userId: string,
  profile: RegistrationProfileInput,
): Promise<void> {
  const firstName = clean(profile.firstName);
  const lastName = clean(profile.lastName);
  const email = clean(profile.email).toLowerCase();

  const { error } = await client.from('profiles').upsert(
    {
      id: userId,
      first_name: firstName,
      last_name: lastName,
      email,
      display_name: makeDisplayName(firstName, lastName),
    },
    { onConflict: 'id' },
  );

  if (error) throw new Error(error.message);
}

export async function loadSignedInIdentity(
  client: SupabaseClient,
  session: Session,
): Promise<V2SignedInIdentity> {
  const authEmail = session.user.email ?? null;
  const { data, error } = await client
    .from('profiles')
    .select('first_name,last_name,email,display_name')
    .eq('id', session.user.id)
    .maybeSingle();

  if (error) {
    return {
      userId: session.user.id,
      email: authEmail,
      firstName: null,
      lastName: null,
      displayName: authEmail,
    };
  }

  const profile = data as {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    display_name?: string | null;
  } | null;

  return {
    userId: session.user.id,
    email: profile?.email ?? authEmail,
    firstName: profile?.first_name ?? null,
    lastName: profile?.last_name ?? null,
    displayName: profile?.display_name ?? authEmail,
  };
}
