import { runContractAssertions } from './contracts.assertions';
import { runEvidenceRegistrySeedAssertions } from './evidenceSupabaseSeed.assertions';
import { runMinimumSliceAssertions } from './minimumSlice.assertions';
import { runSupabasePayloadAssertions } from './supabasePayload.assertions';
import { runSupabasePersistenceAssertions } from './supabasePersistence.assertions';

async function main(): Promise<void> {
  runMinimumSliceAssertions();
  runContractAssertions();
  runSupabasePayloadAssertions();
  runEvidenceRegistrySeedAssertions();
  await runSupabasePersistenceAssertions();
  console.log('minimum-slice, contract, Supabase payload, evidence seed, and persistence assertions passed');
}

void main().catch((error: unknown) => {
  console.error(error);
  throw error;
});
