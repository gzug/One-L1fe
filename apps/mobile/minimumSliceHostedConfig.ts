export const ONE_L1FE_SUPABASE_PROJECT_REF = 'lbqgjourpsodqglputkj';

export function getOneL1feSupabaseUrl(projectRef = ONE_L1FE_SUPABASE_PROJECT_REF): string {
  return `https://${projectRef}.supabase.co`;
}

export function getOneL1feMinimumSliceFunctionUrl(projectRef = ONE_L1FE_SUPABASE_PROJECT_REF): string {
  return `${getOneL1feSupabaseUrl(projectRef)}/functions/v1/save-minimum-slice-interpretation`;
}
