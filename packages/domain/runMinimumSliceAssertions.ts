import { runContractAssertions } from './contracts.assertions';
import { runEvidenceRegistrySeedAssertions } from './evidenceSupabaseSeed.assertions';
import { runMinimumSliceAssertions } from './minimumSlice.assertions';
import { runSupabasePayloadAssertions } from './supabasePayload.assertions';

runMinimumSliceAssertions();
runContractAssertions();
runSupabasePayloadAssertions();
runEvidenceRegistrySeedAssertions();
console.log('minimum-slice, contract, Supabase payload, and evidence seed assertions passed');
