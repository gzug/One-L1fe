import { runContractAssertions } from './contracts.assertions';
import { runEvidenceRegistrySeedAssertions } from './evidenceSupabaseSeed.assertions';
import { runMinimumSliceAssertions } from './minimumSlice.assertions';
import { runMinimumSliceFunctionContractAssertions } from './minimumSliceFunctionContract.assertions';
import { runSupabasePayloadAssertions } from './supabasePayload.assertions';
import { runSupabasePersistenceAssertions } from './supabasePersistence.assertions';
import { runSupabaseRepositoryAssertions } from './supabaseRepository.assertions';

async function main(): Promise<void> {
  runMinimumSliceAssertions();
  runMinimumSliceFunctionContractAssertions();
  runContractAssertions();
  runSupabasePayloadAssertions();
  runEvidenceRegistrySeedAssertions();
  await runSupabasePersistenceAssertions();
  await runSupabaseRepositoryAssertions();
  console.log('minimum-slice, function contract, contract, Supabase payload, evidence seed, persistence, and repository assertions passed');
}

void main().catch((error: unknown) => {
  console.error(error);
  throw error;
});
