import { runContractAssertions } from './contracts.assertions';
import { runMinimumSliceAssertions } from './minimumSlice.assertions';
import { runSupabasePayloadAssertions } from './supabasePayload.assertions';

runMinimumSliceAssertions();
runContractAssertions();
runSupabasePayloadAssertions();
console.log('minimum-slice, contract, and Supabase payload assertions passed');
