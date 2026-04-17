import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import type {
  WearableSourceResolveRequest,
  WearableSourceResolveResponse,
} from './types.ts';

type SourceRow = {
  id: string;
  profile_id: string;
  source_kind: WearableSourceResolveRequest['source_kind'];
  vendor_name: string;
  source_app_id: string | null;
  source_app_name: string | null;
  device_hardware_id: string | null;
  device_label: string | null;
  app_install_id: string | null;
};

type UpdatableSourceFields = Pick<
  WearableSourceResolveRequest,
  'source_app_id' | 'source_app_name' | 'device_hardware_id' | 'device_label' | 'app_install_id'
>;

function isPresent(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function buildSourcePatch(existing: SourceRow, request: WearableSourceResolveRequest): Partial<UpdatableSourceFields> {
  const patch: Partial<UpdatableSourceFields> = {};

  if (!isPresent(existing.app_install_id) && isPresent(request.app_install_id)) {
    patch.app_install_id = request.app_install_id;
  }

  if (!isPresent(existing.device_hardware_id) && isPresent(request.device_hardware_id)) {
    patch.device_hardware_id = request.device_hardware_id;
  }

  if (!isPresent(existing.source_app_id) && isPresent(request.source_app_id)) {
    patch.source_app_id = request.source_app_id;
  }

  if (!isPresent(existing.source_app_name) && isPresent(request.source_app_name)) {
    patch.source_app_name = request.source_app_name;
  }

  if (!isPresent(existing.device_label) && isPresent(request.device_label)) {
    patch.device_label = request.device_label;
  }

  return patch;
}

async function enrichExistingSource(
  supabase: SupabaseClient,
  existing: SourceRow,
  request: WearableSourceResolveRequest,
): Promise<void> {
  const patch = buildSourcePatch(existing, request);
  if (Object.keys(patch).length === 0) {
    return;
  }

  const { error } = await supabase
    .from('wearable_sources')
    .update(patch)
    .eq('id', existing.id)
    .eq('profile_id', existing.profile_id);

  if (error) {
    throw new Error(`Failed to enrich wearable source metadata: ${error.message}`);
  }
}

function isUniqueConflict(error: { code?: string } | null | undefined): boolean {
  return error?.code === '23505';
}

async function findExistingSource(
  supabase: SupabaseClient,
  profileId: string,
  request: WearableSourceResolveRequest,
): Promise<SourceRow | null> {
  const identifierFilters = [
    { column: 'app_install_id', value: request.app_install_id },
    { column: 'device_hardware_id', value: request.device_hardware_id },
  ].filter((item) => item.value !== undefined && item.value !== null);

  for (const filter of identifierFilters) {
    const { data, error } = await supabase
      .from('wearable_sources')
      .select(
        'id, profile_id, source_kind, vendor_name, source_app_id, source_app_name, device_hardware_id, device_label, app_install_id',
      )
      .eq('profile_id', profileId)
      .eq('source_kind', request.source_kind)
      .eq('vendor_name', request.vendor_name)
      .eq(filter.column, filter.value)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to resolve existing wearable source: ${error.message}`);
    }

    if (data) {
      return data as SourceRow;
    }
  }

  return null;
}

export async function resolveWearableSource(
  supabase: SupabaseClient,
  profileId: string,
  request: WearableSourceResolveRequest,
): Promise<WearableSourceResolveResponse> {
  const existing = await findExistingSource(supabase, profileId, request);
  if (existing) {
    await enrichExistingSource(supabase, existing, request);

    return {
      wearable_source_id: existing.id,
      profile_id: existing.profile_id,
      source_kind: existing.source_kind,
      vendor_name: existing.vendor_name,
      created: false,
    };
  }

  const { data: created, error: createError } = await supabase
    .from('wearable_sources')
    .insert({
      profile_id: profileId,
      source_kind: request.source_kind,
      vendor_name: request.vendor_name,
      source_app_id: request.source_app_id ?? null,
      source_app_name: request.source_app_name ?? null,
      device_hardware_id: request.device_hardware_id ?? null,
      device_label: request.device_label ?? null,
      app_install_id: request.app_install_id ?? null,
      is_active: true,
    })
    .select('id, profile_id, source_kind, vendor_name')
    .single();

  if (createError || !created) {
    if (isUniqueConflict(createError)) {
      const concurrentExisting = await findExistingSource(supabase, profileId, request);
      if (concurrentExisting) {
        await enrichExistingSource(supabase, concurrentExisting, request);

        return {
          wearable_source_id: concurrentExisting.id,
          profile_id: concurrentExisting.profile_id,
          source_kind: concurrentExisting.source_kind,
          vendor_name: concurrentExisting.vendor_name,
          created: false,
        };
      }
    }

    throw new Error(`Failed to create wearable source: ${createError?.message}`);
  }

  return {
    wearable_source_id: created.id,
    profile_id: created.profile_id,
    source_kind: created.source_kind,
    vendor_name: created.vendor_name,
    created: true,
  };
}
