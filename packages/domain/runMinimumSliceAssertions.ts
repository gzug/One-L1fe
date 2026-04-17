import { runContractAssertions } from './contracts.assertions.ts';
import { runEvidenceRegistrySeedAssertions } from './evidenceSupabaseSeed.assertions.ts';
import { runFieldValueStateAssertions } from './fieldValueState.assertions.ts';
import { runMinimumSliceAppClientAssertions } from './minimumSliceAppClient.assertions.ts';
import { runMinimumSliceAppHttpClientAssertions } from './minimumSliceAppHttpClient.assertions.ts';
import { runMinimumSliceMobileFormAssertions } from './minimumSliceMobileForm.assertions.ts';
import { runMinimumSliceMobileIntegrationAssertions } from './minimumSliceMobileIntegration.assertions.ts';
import { runMinimumSliceResultSummaryAssertions } from './minimumSliceResultSummary.assertions.ts';
import { runMinimumSliceAssertions } from './minimumSlice.assertions.ts';
import { runMinimumSliceFunctionContractAssertions } from './minimumSliceFunctionContract.assertions.ts';
import { runSupabasePayloadAssertions } from './supabasePayload.assertions.ts';
import { runSupabasePersistenceAssertions } from './supabasePersistence.assertions.ts';
import { runSupabaseRepositoryAssertions } from './supabaseRepository.assertions.ts';

async function main(): Promise<void> {
  runFieldValueStateAssertions();
  runMinimumSliceAssertions();
  runMinimumSliceFunctionContractAssertions();
  await runMinimumSliceAppClientAssertions();
  await runMinimumSliceAppHttpClientAssertions();
  runMinimumSliceMobileFormAssertions();
  await runMinimumSliceMobileIntegrationAssertions();
  runMinimumSliceResultSummaryAssertions();
  runContractAssertions();
  runSupabasePayloadAssertions();
  runEvidenceRegistrySeedAssertions();
  await runSupabasePersistenceAssertions();
  await runSupabaseRepositoryAssertions();
  console.log('All domain assertions passed.');
}

void main().catch((error: unknown) => {
  console.error(error);
  throw error;
});
