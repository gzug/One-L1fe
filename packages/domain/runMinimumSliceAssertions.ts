import { runAskOneL1feAssertions } from './askOneL1fe.assertions.ts';
import { runContractAssertions } from './contracts.assertions.ts';
import { runDotStructureAssertions } from './dotStructure.assertions.ts';
import { runDotCatalogAssertions } from './dots.assertions.ts';
import { runEvidenceRegistrySeedAssertions } from './evidenceSupabaseSeed.assertions.ts';
import { runFieldValueStateAssertions } from './fieldValueState.assertions.ts';
import { runMinimumSliceAppClientAssertions } from './minimumSliceAppClient.assertions.ts';
import { runMinimumSliceAppHttpClientAssertions } from './minimumSliceAppHttpClient.assertions.ts';
import { runMinimumSliceMobileFormAssertions } from './minimumSliceMobileForm.assertions.ts';
import { runMinimumSliceMobileIntegrationAssertions } from './minimumSliceMobileIntegration.assertions.ts';
import { runMinimumSliceResultSummaryAssertions } from './minimumSliceResultSummary.assertions.ts';
import { runMinimumSliceAssertions } from './minimumSlice.assertions.ts';
import { runMinimumSliceFunctionContractAssertions } from './minimumSliceFunctionContract.assertions.ts';
import { runNutritionEstimateAssertions } from './nutritionEstimate.assertions.ts';
import { runScoreAggregationAssertions } from './scoreAggregation.assertions.ts';
import { runScoreDisplayAssertions } from './scoreDisplay.assertions.ts';
import { runSupabasePayloadAssertions } from './supabasePayload.assertions.ts';
import { runSupabasePersistenceAssertions } from './supabasePersistence.assertions.ts';
import { runSupabaseRepositoryAssertions } from './supabaseRepository.assertions.ts';
import { runSyntheticDemoDataAssertions } from './syntheticDemoData.assertions.ts';

async function main(): Promise<void> {
  runAskOneL1feAssertions();
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
  runDotStructureAssertions();
  runDotCatalogAssertions();
  runScoreAggregationAssertions();
  runScoreDisplayAssertions();
  runNutritionEstimateAssertions();
  runSyntheticDemoDataAssertions();
  console.log('All domain assertions passed.');
}

void main().catch((error: unknown) => {
  console.error(error);
  throw error;
});
